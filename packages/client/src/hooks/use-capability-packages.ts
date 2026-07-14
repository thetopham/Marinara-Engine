import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  replaceBuiltInAgentDefinitions,
  type CapabilityCatalog,
  type BuiltInAgentManifest,
  type InstalledCapabilityPackage,
} from "@marinara-engine/shared";
import { api } from "../lib/api-client";

export const capabilityPackageKeys = {
  all: ["capability-packages"] as const,
  catalog: () => [...capabilityPackageKeys.all, "catalog"] as const,
  installed: () => [...capabilityPackageKeys.all, "installed"] as const,
  agents: () => [...capabilityPackageKeys.all, "agents"] as const,
};

export function useCapabilityCatalog(enabled = true) {
  return useQuery({
    queryKey: capabilityPackageKeys.catalog(),
    queryFn: () => api.get<CapabilityCatalog>("/capability-packages/catalog"),
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useCapabilityAgentRegistry() {
  const query = useQuery({
    queryKey: capabilityPackageKeys.agents(),
    queryFn: () => api.get<BuiltInAgentManifest[]>("/capability-packages/agents"),
  });
  useEffect(() => {
    if (query.data) replaceBuiltInAgentDefinitions(query.data);
  }, [query.data]);
  return query;
}

export function useInstalledCapabilityPackages(enabled = true) {
  return useQuery({
    queryKey: capabilityPackageKeys.installed(),
    queryFn: () => api.get<InstalledCapabilityPackage[]>("/capability-packages/installed"),
    enabled,
  });
}

function useInvalidateCapabilityState() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: capabilityPackageKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["agents"] }),
      queryClient.invalidateQueries({ queryKey: ["chats"] }),
    ]);
  };
}

export function useInstallCapabilityPackage() {
  const invalidate = useInvalidateCapabilityState();
  return useMutation({
    mutationFn: (id: string) => api.post<InstalledCapabilityPackage>(`/capability-packages/${id}/install`),
    onSuccess: invalidate,
  });
}

export function useUninstallCapabilityPackage() {
  const invalidate = useInvalidateCapabilityState();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/capability-packages/${id}`),
    onSuccess: invalidate,
  });
}

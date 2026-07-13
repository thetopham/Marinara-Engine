import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Chat,
  GameLocation,
  GameLocationLink,
  GameLocationState,
  GameLocationTransition,
  ManualGameLocationTransitionRequest,
  ManualGameLocationTransitionResponse,
} from "@marinara-engine/shared";
import { api } from "../lib/api-client";
import { chatKeys, syncCachedChat } from "./use-chats";

export const gameLocationKeys = {
  all: ["game-locations"] as const,
  state: (chatId: string) => [...gameLocationKeys.all, "state", chatId] as const,
};

function readMetadata(chat: Chat | null | undefined): Record<string, unknown> {
  const raw = chat?.metadata;
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

function normalizeGameLocationState(chat: Chat | null | undefined): GameLocationState {
  const metadata = readMetadata(chat);
  return {
    locations: Array.isArray(metadata.gameLocations) ? (metadata.gameLocations as GameLocation[]) : [],
    links: Array.isArray(metadata.gameLocationLinks) ? (metadata.gameLocationLinks as GameLocationLink[]) : [],
    currentGameLocationId:
      typeof metadata.currentGameLocationId === "string" && metadata.currentGameLocationId.trim()
        ? metadata.currentGameLocationId
        : null,
    startingGameLocationId:
      typeof metadata.startingGameLocationId === "string" && metadata.startingGameLocationId.trim()
        ? metadata.startingGameLocationId
        : null,
    revision:
      typeof metadata.gameLocationRevision === "number" && Number.isFinite(metadata.gameLocationRevision)
        ? metadata.gameLocationRevision
        : 0,
    transitions: Array.isArray(metadata.gameLocationTransitions)
      ? (metadata.gameLocationTransitions as GameLocationTransition[])
      : [],
  };
}

export function useGameLocations(chatId: string | null | undefined) {
  return useQuery({
    queryKey: gameLocationKeys.state(chatId ?? ""),
    queryFn: async () => normalizeGameLocationState(await api.get<Chat>(`/chats/${chatId}`)),
    enabled: !!chatId,
    staleTime: 30_000,
  });
}

export function useSetGameLocation(chatId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: ManualGameLocationTransitionRequest) => {
      if (!chatId) throw new Error("Chat ID is required");
      const chat = await api.get<Chat>(`/chats/${chatId}`);
      const state = normalizeGameLocationState(chat);
      const now = new Date().toISOString();
      const transition: GameLocationTransition = {
        id: `manual-${Date.now()}`,
        fromLocationId: request.fromLocationId ?? state.currentGameLocationId,
        toLocationId: request.toLocationId,
        linkId: request.linkId ?? null,
        source: "manual",
        note: request.note ?? null,
        createdAt: now,
      };
      const revision = state.revision + 1;
      const updated = await api.patch<Chat>(`/chats/${chatId}/metadata`, {
        currentGameLocationId: request.toLocationId,
        gameLocationRevision: revision,
        gameLocationTransitions: [...(state.transitions ?? []), transition],
      });
      const response: ManualGameLocationTransitionResponse = {
        currentGameLocationId: request.toLocationId,
        gameLocationRevision: revision,
        transition,
        locations: state.locations,
      };
      syncCachedChat(qc, updated);
      return response;
    },
    onSuccess: () => {
      if (!chatId) return;
      qc.invalidateQueries({ queryKey: gameLocationKeys.state(chatId) });
      qc.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
      qc.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}

export function useUpdateGameLocations(chatId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      state: Partial<
        Pick<GameLocationState, "locations" | "links" | "currentGameLocationId" | "startingGameLocationId">
      >,
    ) => {
      if (!chatId) throw new Error("Chat ID is required");
      const current = normalizeGameLocationState(await api.get<Chat>(`/chats/${chatId}`));
      const revision = current.revision + 1;
      const updated = await api.patch<Chat>(`/chats/${chatId}/metadata`, {
        ...(state.locations ? { gameLocations: state.locations } : {}),
        ...(state.links ? { gameLocationLinks: state.links } : {}),
        ...(state.currentGameLocationId !== undefined ? { currentGameLocationId: state.currentGameLocationId } : {}),
        ...(state.startingGameLocationId !== undefined ? { startingGameLocationId: state.startingGameLocationId } : {}),
        gameLocationRevision: revision,
      });
      syncCachedChat(qc, updated);
      return normalizeGameLocationState(updated);
    },
    onSuccess: () => {
      if (!chatId) return;
      qc.invalidateQueries({ queryKey: gameLocationKeys.state(chatId) });
      qc.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
      qc.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}

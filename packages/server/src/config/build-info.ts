import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_VERSION } from "@marinara-engine/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_ROOT = resolve(__dirname, "../..");
const MONOREPO_ROOT = resolve(SERVER_ROOT, "../..");
const BUILD_META_PATH = resolve(__dirname, "build-meta.json");
const COMMIT_LENGTH = 12;

let cachedCommit: string | null | undefined;
let cachedBranch: string | null | undefined;

type BuildMeta = {
  commit?: string | null;
  branch?: string | null;
};

function normalizeCommit(value: string | undefined | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, COMMIT_LENGTH);
}

function normalizeBranch(value: string | undefined | null) {
  const trimmed = value?.trim().replace(/^refs\/heads\//u, "");
  return trimmed && trimmed !== "HEAD" ? trimmed : null;
}

function readBuildMeta(): BuildMeta | null {
  if (!existsSync(BUILD_META_PATH)) return null;

  try {
    return JSON.parse(readFileSync(BUILD_META_PATH, "utf8")) as BuildMeta;
  } catch {
    return null;
  }
}

function readBuiltCommit() {
  return normalizeCommit(readBuildMeta()?.commit);
}

function readBuiltBranch() {
  return normalizeBranch(readBuildMeta()?.branch);
}

export function getBuildCommit() {
  if (cachedCommit !== undefined) return cachedCommit;

  const builtCommit = readBuiltCommit();
  if (builtCommit) {
    cachedCommit = builtCommit;
    return cachedCommit;
  }

  const envCommit = normalizeCommit(process.env.MARINARA_GIT_COMMIT ?? process.env.GITHUB_SHA);
  if (envCommit) {
    cachedCommit = envCommit;
    return cachedCommit;
  }

  if (!existsSync(resolve(MONOREPO_ROOT, ".git"))) {
    cachedCommit = null;
    return cachedCommit;
  }

  try {
    const commit = execFileSync("git", ["rev-parse", `--short=${COMMIT_LENGTH}`, "HEAD"], {
      cwd: MONOREPO_ROOT,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    cachedCommit = commit || null;
  } catch {
    cachedCommit = null;
  }

  return cachedCommit;
}

export function getBuildBranch() {
  if (cachedBranch !== undefined) return cachedBranch;

  const builtBranch = readBuiltBranch();
  if (builtBranch) {
    cachedBranch = builtBranch;
    return cachedBranch;
  }

  const envBranch = normalizeBranch(
    process.env.MARINARA_GIT_BRANCH ?? process.env.GITHUB_HEAD_REF ?? process.env.GITHUB_REF_NAME,
  );
  if (envBranch) {
    cachedBranch = envBranch;
    return cachedBranch;
  }

  if (!existsSync(resolve(MONOREPO_ROOT, ".git"))) {
    cachedBranch = null;
    return cachedBranch;
  }

  try {
    const branch = execFileSync("git", ["symbolic-ref", "--short", "-q", "HEAD"], {
      cwd: MONOREPO_ROOT,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    cachedBranch = normalizeBranch(branch);
  } catch {
    cachedBranch = null;
  }

  return cachedBranch;
}

export function getBuildLabel() {
  const commit = getBuildCommit();
  return commit ? `${APP_VERSION}+${commit}` : APP_VERSION;
}

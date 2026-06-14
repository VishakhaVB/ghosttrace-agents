import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type RepositorySourceType = "github" | "uploaded-reference" | "mock";

export type EngineeringActivitySignal =
  | "architecture_churn"
  | "instability_acceleration"
  | "deployment_turbulence"
  | "dependency_growth"
  | "scaling_pressure"
  | "ownership_volatility"
  | "security_boundary_motion"
  | "low_signal";

export interface RepositoryAcquisitionInput {
  repositoryUrl?: string;
  repoUrl?: string;
  url?: string;
  owner?: string;
  repoName?: string;
  branch?: string;
  referenceName?: string;
  metadata?: Record<string, unknown>;
}

export interface RepositoryAcquisitionOptions {
  branch?: string;
  cloneDepth?: number;
  maxCommits?: number;
  maxRepositoryBytes?: number;
  timeoutMs?: number;
  workspaceRoot?: string;
  keepLocalCopy?: boolean;
  allowFallback?: boolean;
}

export interface SanitizedGitHubRepository {
  owner: string;
  repoName: string;
  htmlUrl: string;
  cloneUrl: string;
}

export interface CloneRepositoryResult {
  localPath: string;
  branch?: string;
  depth: number;
  shallow: boolean;
  clonedAt: string;
  warnings: string[];
}

export interface CommitIntelligence {
  hash: string;
  shortHash: string;
  message: string;
  authorName: string;
  authorEmail?: string;
  date: string;
  filesChanged: string[];
  suspiciousPatterns: string[];
  engineeringSignals: EngineeringActivitySignal[];
}

export interface ContributorIntelligence {
  name: string;
  email?: string;
  commits: number;
  ownershipSignal: "primary-owner" | "frequent-contributor" | "drive-by" | "unknown";
}

export interface CommitPatternAnalysis {
  suspiciousCommitPatterns: string[];
  engineeringSignals: EngineeringActivitySignal[];
  rapidFeatureBursts: string[];
  ownershipChanges: string[];
  instabilityNarrative: string;
}

export interface RepositoryMetadata {
  sourceType: RepositorySourceType;
  sourceUrl?: string;
  sanitizedCloneUrl?: string;
  defaultBranch?: string;
  selectedBranch?: string;
  currentBranch?: string;
  headCommit?: string;
  clonedAt: string;
  shallow: boolean;
  depth: number;
  fileCount: number;
  estimatedSizeBytes: number;
  acquisitionMode: "native-git" | "fallback";
  cleanupRecommended: boolean;
  cleanedUp: boolean;
  warnings: string[];
  engineeringSignals: EngineeringActivitySignal[];
}

export interface RepositoryAcquisitionConfidence {
  acquisitionConfidence: number;
  metadataConfidence: number;
  activitySignalConfidence: number;
  sourceTrust: number;
  method: "native-git" | "cinematic-fallback";
}

export interface RepositoryIntelligence {
  repoName: string;
  owner: string;
  branches: string[];
  latestCommits: CommitIntelligence[];
  contributors: ContributorIntelligence[];
  commitSummary: CommitPatternAnalysis;
  localPath: string | null;
  metadata: RepositoryMetadata;
  confidence: RepositoryAcquisitionConfidence;
}

interface GitCommandOptions {
  cwd?: string;
  timeoutMs: number;
}

interface ParsedGitLogCommit {
  hash: string;
  authorName: string;
  authorEmail?: string;
  date: string;
  message: string;
}

const DEFAULT_CLONE_DEPTH = 40;
const DEFAULT_MAX_COMMITS = 60;
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_REPOSITORY_BYTES = 180 * 1024 * 1024;
const GIT_FIELD_SEPARATOR = "\u001f";
const GIT_COMMIT_SEPARATOR = "\u001e";

export async function fetchRepositoryIntelligence(
  input: RepositoryAcquisitionInput | string,
  options: RepositoryAcquisitionOptions = {},
): Promise<RepositoryIntelligence> {
  try {
    const acquisitionInput = normalizeAcquisitionInput(input);
    const sanitized = sanitizeGitHubRepository(acquisitionInput);
    const clone = await cloneRepository(sanitized, {
      ...options,
      branch: options.branch ?? acquisitionInput.branch,
    });
    const metadata = await getRepositoryMetadata(sanitized, clone, options);
    const latestCommits = await extractCommitHistory(
      clone.localPath,
      options.maxCommits ?? DEFAULT_MAX_COMMITS,
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );
    const contributors = extractContributors(latestCommits);
    const commitSummary = analyzeCommitPatterns(latestCommits);
    const branches = await listBranches(clone.localPath, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    const intelligence = buildRepositoryIntelligence({
      sanitized,
      clone,
      metadata: {
        ...metadata,
        engineeringSignals: uniqueSignals([
          ...metadata.engineeringSignals,
          ...commitSummary.engineeringSignals,
        ]),
      },
      latestCommits,
      contributors,
      commitSummary,
      branches,
      method: "native-git",
    });

    if (options.keepLocalCopy === false) {
      await cleanupRepository(clone.localPath);
      return {
        ...intelligence,
        localPath: null,
        metadata: {
          ...intelligence.metadata,
          cleanedUp: true,
        },
      };
    }

    return intelligence;
  } catch (error) {
    if (options.allowFallback === false) {
      throw error;
    }

    return generateFallbackRepositoryIntelligence(input, error);
  }
}

export async function acquireRepository(
  input: RepositoryAcquisitionInput | string,
  options: RepositoryAcquisitionOptions = {},
): Promise<RepositoryIntelligence> {
  return fetchRepositoryIntelligence(input, options);
}

export async function cloneRepository(
  repository: SanitizedGitHubRepository | RepositoryAcquisitionInput | string,
  options: RepositoryAcquisitionOptions = {},
): Promise<CloneRepositoryResult> {
  const sanitized =
    typeof repository === "string" || !("cloneUrl" in repository)
      ? sanitizeGitHubRepository(normalizeAcquisitionInput(repository))
      : repository;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const depth = clampInteger(options.cloneDepth ?? DEFAULT_CLONE_DEPTH, 1, 500);
  const localPath = await createTemporaryRepositoryPath(
    sanitized.owner,
    sanitized.repoName,
    options.workspaceRoot,
  );
  const args = [
    "clone",
    "--depth",
    String(depth),
    "--filter=blob:none",
    "--no-tags",
  ];

  if (options.branch) {
    args.push("--branch", validateBranchName(options.branch));
  }

  args.push(sanitized.cloneUrl, localPath);

  try {
    await runGit(args, { timeoutMs });
    const currentBranch = await getCurrentBranch(localPath, timeoutMs);

    return {
      localPath,
      branch: currentBranch || options.branch,
      depth,
      shallow: true,
      clonedAt: now(),
      warnings: [],
    };
  } catch (error) {
    await safeCleanup(localPath);
    throw normalizeGitError(error, sanitized);
  }
}

export async function extractCommitHistory(
  localPath: string,
  maxCommits = DEFAULT_MAX_COMMITS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<CommitIntelligence[]> {
  const limit = clampInteger(maxCommits, 1, 300);
  const format = [
    "%H",
    "%an",
    "%ae",
    "%aI",
    "%s",
  ].join(GIT_FIELD_SEPARATOR);
  const { stdout } = await runGit(
    ["log", `--max-count=${limit}`, `--pretty=format:${format}${GIT_COMMIT_SEPARATOR}`, "--name-only"],
    { cwd: localPath, timeoutMs },
  );
  const commits = parseGitLog(stdout);

  return commits.map((commit) => {
    const suspiciousPatterns = analyzeCommitMessage(commit.message);

    return {
      hash: commit.hash,
      shortHash: commit.hash.slice(0, 7),
      message: commit.message,
      authorName: commit.authorName,
      authorEmail: commit.authorEmail,
      date: commit.date,
      filesChanged: commit.filesChanged,
      suspiciousPatterns,
      engineeringSignals: classifyCommitSignals(commit.message, commit.filesChanged),
    };
  });
}

export async function getRepositoryMetadata(
  repository: SanitizedGitHubRepository,
  clone: CloneRepositoryResult,
  options: RepositoryAcquisitionOptions = {},
): Promise<RepositoryMetadata> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const [currentBranch, headCommit, fileCount, estimatedSizeBytes, defaultBranch] =
    await Promise.all([
      getCurrentBranch(clone.localPath, timeoutMs),
      getHeadCommit(clone.localPath, timeoutMs),
      countRepositoryFiles(clone.localPath),
      estimateDirectorySize(clone.localPath),
      getRemoteDefaultBranch(clone.localPath, timeoutMs),
    ]);
  const maxBytes = options.maxRepositoryBytes ?? DEFAULT_MAX_REPOSITORY_BYTES;
  const warnings: string[] = [...clone.warnings];

  if (estimatedSizeBytes > maxBytes) {
    warnings.push(
      `Repository estimate ${estimatedSizeBytes} bytes exceeds safeguard ${maxBytes} bytes.`,
    );
  }

  return {
    sourceType: "github",
    sourceUrl: repository.htmlUrl,
    sanitizedCloneUrl: repository.cloneUrl,
    defaultBranch,
    selectedBranch: clone.branch,
    currentBranch,
    headCommit,
    clonedAt: clone.clonedAt,
    shallow: clone.shallow,
    depth: clone.depth,
    fileCount,
    estimatedSizeBytes,
    acquisitionMode: "native-git",
    cleanupRecommended: estimatedSizeBytes > maxBytes,
    cleanedUp: false,
    warnings,
    engineeringSignals: inferRepositorySignalsFromMetadata({
      currentBranch,
      defaultBranch,
      fileCount,
      estimatedSizeBytes,
      warnings,
    }),
  };
}

export function analyzeCommitPatterns(
  commits: CommitIntelligence[],
): CommitPatternAnalysis {
  const suspiciousCommitPatterns = uniqueStrings(
    commits.flatMap((commit) => commit.suspiciousPatterns),
  );
  const engineeringSignals = uniqueSignals(
    commits.flatMap((commit) => commit.engineeringSignals),
  );
  const rapidFeatureBursts = detectRapidFeatureBursts(commits);
  const ownershipChanges = detectOwnershipChanges(commits);

  return {
    suspiciousCommitPatterns,
    engineeringSignals,
    rapidFeatureBursts,
    ownershipChanges,
    instabilityNarrative: buildInstabilityNarrative({
      commits,
      suspiciousCommitPatterns,
      engineeringSignals,
      rapidFeatureBursts,
      ownershipChanges,
    }),
  };
}

export async function cleanupRepository(localPath: string): Promise<void> {
  const resolved = path.resolve(localPath);
  const tempRoot = path.resolve(tmpdir());

  if (!resolved.startsWith(tempRoot)) {
    throw new Error(`Refusing to clean repository outside temp workspace: ${resolved}`);
  }

  await rm(resolved, { recursive: true, force: true });
}

export function sanitizeGitHubRepository(
  input: RepositoryAcquisitionInput,
): SanitizedGitHubRepository {
  const rawUrl = input.repositoryUrl ?? input.repoUrl ?? input.url;
  const fromParts =
    input.owner && input.repoName
      ? {
          owner: input.owner,
          repoName: input.repoName,
        }
      : undefined;
  const parsed = fromParts ?? parseGitHubUrl(rawUrl);

  if (!parsed) {
    throw new Error("Invalid repository source. Only GitHub repositories are accepted.");
  }

  const owner = validateGitHubSegment(parsed.owner, "owner");
  const repoName = validateGitHubSegment(parsed.repoName.replace(/\.git$/i, ""), "repository");

  return {
    owner,
    repoName,
    htmlUrl: `https://github.com/${owner}/${repoName}`,
    cloneUrl: `https://github.com/${owner}/${repoName}.git`,
  };
}

function buildRepositoryIntelligence(input: {
  sanitized: SanitizedGitHubRepository;
  clone: CloneRepositoryResult;
  metadata: RepositoryMetadata;
  latestCommits: CommitIntelligence[];
  contributors: ContributorIntelligence[];
  commitSummary: CommitPatternAnalysis;
  branches: string[];
  method: RepositoryAcquisitionConfidence["method"];
}): RepositoryIntelligence {
  const confidence = calculateConfidence(input);

  return {
    repoName: input.sanitized.repoName,
    owner: input.sanitized.owner,
    branches: input.branches,
    latestCommits: input.latestCommits,
    contributors: input.contributors,
    commitSummary: input.commitSummary,
    localPath: input.clone.localPath,
    metadata: input.metadata,
    confidence,
  };
}

function calculateConfidence(input: {
  metadata: RepositoryMetadata;
  latestCommits: CommitIntelligence[];
  contributors: ContributorIntelligence[];
  commitSummary: CommitPatternAnalysis;
  method: RepositoryAcquisitionConfidence["method"];
}): RepositoryAcquisitionConfidence {
  const commitDepth = Math.min(input.latestCommits.length * 2, 30);
  const contributorDepth = Math.min(input.contributors.length * 4, 18);
  const metadataDepth = input.metadata.fileCount > 0 ? 18 : 0;
  const warningPenalty = input.metadata.warnings.length * 6;
  const signalDepth = Math.min(input.commitSummary.engineeringSignals.length * 5, 20);

  return {
    acquisitionConfidence: clampScore(54 + commitDepth + metadataDepth - warningPenalty),
    metadataConfidence: clampScore(58 + metadataDepth + contributorDepth - warningPenalty),
    activitySignalConfidence: clampScore(50 + commitDepth + signalDepth),
    sourceTrust: input.metadata.sourceType === "github" ? 92 : 46,
    method: input.method,
  };
}

function parseGitHubUrl(rawUrl?: string): { owner: string; repoName: string } | undefined {
  if (!rawUrl || !rawUrl.trim()) {
    return undefined;
  }

  const trimmed = rawUrl.trim();
  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);

  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repoName: sshMatch[2],
    };
  }

  const shorthandMatch = trimmed.match(/^github\.com\/([^/]+)\/([^/#?]+)(?:\.git)?(?:[/?#].*)?$/i);

  if (shorthandMatch) {
    return {
      owner: shorthandMatch[1],
      repoName: shorthandMatch[2],
    };
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return undefined;
  }

  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
    return undefined;
  }

  const [owner, repoName] = url.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.trim());

  if (!owner || !repoName) {
    return undefined;
  }

  return {
    owner,
    repoName,
  };
}

function validateGitHubSegment(value: string, label: string): string {
  const normalized = value.trim();

  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(normalized)) {
    throw new Error(`Invalid GitHub ${label} segment.`);
  }

  if (normalized === "." || normalized === ".." || normalized.includes("..")) {
    throw new Error(`Unsafe GitHub ${label} segment.`);
  }

  return normalized;
}

function validateBranchName(branch: string): string {
  const normalized = branch.trim();

  if (!/^[A-Za-z0-9._/-]{1,180}$/.test(normalized)) {
    throw new Error("Invalid branch name.");
  }

  if (
    normalized.startsWith("/") ||
    normalized.endsWith("/") ||
    normalized.includes("..") ||
    normalized.includes("//") ||
    normalized.includes("@{")
  ) {
    throw new Error("Unsafe branch name.");
  }

  return normalized;
}

function normalizeAcquisitionInput(
  input: RepositoryAcquisitionInput | string,
): RepositoryAcquisitionInput {
  if (typeof input === "string") {
    return {
      repositoryUrl: input,
    };
  }

  return input;
}

async function createTemporaryRepositoryPath(
  owner: string,
  repoName: string,
  workspaceRoot?: string,
): Promise<string> {
  const root = workspaceRoot
    ? path.resolve(workspaceRoot)
    : path.join(tmpdir(), "ghost-trace-repositories");
  const directoryName = `${slugify(owner)}-${slugify(repoName)}-${randomUUID()}`;
  const target = path.join(root, directoryName);

  await mkdir(root, { recursive: true });

  return target;
}

async function runGit(
  args: string[],
  options: GitCommandOptions,
): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync("git", args, {
    cwd: options.cwd,
    timeout: options.timeoutMs,
    maxBuffer: 12 * 1024 * 1024,
    windowsHide: true,
  });

  return {
    stdout: String(stdout),
    stderr: String(stderr),
  };
}

async function listBranches(localPath: string, timeoutMs: number): Promise<string[]> {
  try {
    const { stdout } = await runGit(
      ["branch", "-r", "--format=%(refname:short)"],
      { cwd: localPath, timeoutMs },
    );

    return uniqueStrings(
      stdout
        .split(/\r?\n/)
        .map((branch) => branch.trim())
        .filter((branch) => branch && !branch.includes("HEAD"))
        .map((branch) => branch.replace(/^origin\//, "")),
    );
  } catch {
    return [];
  }
}

async function getCurrentBranch(localPath: string, timeoutMs: number): Promise<string | undefined> {
  try {
    const { stdout } = await runGit(["branch", "--show-current"], {
      cwd: localPath,
      timeoutMs,
    });

    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function getHeadCommit(localPath: string, timeoutMs: number): Promise<string | undefined> {
  try {
    const { stdout } = await runGit(["rev-parse", "HEAD"], {
      cwd: localPath,
      timeoutMs,
    });

    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function getRemoteDefaultBranch(
  localPath: string,
  timeoutMs: number,
): Promise<string | undefined> {
  try {
    const { stdout } = await runGit(["symbolic-ref", "refs/remotes/origin/HEAD"], {
      cwd: localPath,
      timeoutMs,
    });

    return stdout.trim().replace(/^refs\/remotes\/origin\//, "") || undefined;
  } catch {
    return undefined;
  }
}

function parseGitLog(stdout: string): Array<ParsedGitLogCommit & { filesChanged: string[] }> {
  return stdout
    .split(GIT_COMMIT_SEPARATOR)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/);
      const header = lines[0] ?? "";
      const [hash, authorName, authorEmail, date, message] = header.split(GIT_FIELD_SEPARATOR);

      return {
        hash: hash ?? "",
        authorName: authorName ?? "Unknown Contributor",
        authorEmail: authorEmail || undefined,
        date: date ?? "",
        message: message ?? "Commit message unavailable",
        filesChanged: uniqueStrings(lines.slice(1).map((line) => line.trim())),
      };
    })
    .filter((commit) => commit.hash);
}

function analyzeCommitMessage(message: string): string[] {
  const normalized = message.toLowerCase();

  return uniqueStrings([
    includesAny(normalized, ["hotfix", "quick fix", "urgent", "emergency"])
      ? "Emergency repair language detected"
      : "",
    includesAny(normalized, ["revert", "rollback", "backout"])
      ? "Rollback or reversal activity detected"
      : "",
    includesAny(normalized, ["hack", "temporary", "workaround", "fixme"])
      ? "Temporary engineering workaround detected"
      : "",
    includesAny(normalized, ["auth", "session", "token", "permission"])
      ? "Trust boundary modification detected"
      : "",
    includesAny(normalized, ["dependency", "deps", "package", "lockfile", "upgrade"])
      ? "Dependency movement detected"
      : "",
    includesAny(normalized, ["deploy", "release", "ci", "build"])
      ? "Deployment turbulence marker detected"
      : "",
    includesAny(normalized, ["queue", "worker", "retry", "timeout", "scale"])
      ? "Scaling or retry pressure marker detected"
      : "",
  ]);
}

function classifyCommitSignals(
  message: string,
  filesChanged: string[],
): EngineeringActivitySignal[] {
  const corpus = `${message}\n${filesChanged.join("\n")}`.toLowerCase();

  return uniqueSignals([
    includesAny(corpus, ["architecture", "refactor", "service", "module", "shared"])
      ? "architecture_churn"
      : undefined,
    includesAny(corpus, ["hotfix", "urgent", "revert", "rollback", "temporary"])
      ? "instability_acceleration"
      : undefined,
    includesAny(corpus, ["deploy", "release", "ci", "build", "docker", "vercel"])
      ? "deployment_turbulence"
      : undefined,
    includesAny(corpus, ["package", "lockfile", "dependency", "deps", "upgrade"])
      ? "dependency_growth"
      : undefined,
    includesAny(corpus, ["queue", "worker", "retry", "timeout", "scale", "latency"])
      ? "scaling_pressure"
      : undefined,
    includesAny(corpus, ["owner", "handoff", "shared", "adapter", "boundary"])
      ? "ownership_volatility"
      : undefined,
    includesAny(corpus, ["auth", "session", "token", "jwt", "permission", "role"])
      ? "security_boundary_motion"
      : undefined,
  ]);
}

function extractContributors(commits: CommitIntelligence[]): ContributorIntelligence[] {
  const contributorMap = new Map<string, ContributorIntelligence>();

  for (const commit of commits) {
    const key = `${commit.authorName}<${commit.authorEmail ?? ""}>`;
    const current = contributorMap.get(key) ?? {
      name: commit.authorName,
      email: commit.authorEmail,
      commits: 0,
      ownershipSignal: "unknown" as const,
    };

    contributorMap.set(key, {
      ...current,
      commits: current.commits + 1,
    });
  }

  const contributors = [...contributorMap.values()].sort(
    (left, right) => right.commits - left.commits,
  );
  const totalCommits = commits.length || 1;

  return contributors.map((contributor) => {
    const share = contributor.commits / totalCommits;

    return {
      ...contributor,
      ownershipSignal:
        share >= 0.45
          ? "primary-owner"
          : share >= 0.16
            ? "frequent-contributor"
            : contributor.commits <= 1
              ? "drive-by"
              : "unknown",
    };
  });
}

function detectRapidFeatureBursts(commits: CommitIntelligence[]): string[] {
  const byDay = new Map<string, CommitIntelligence[]>();

  for (const commit of commits) {
    const day = commit.date.slice(0, 10) || "unknown-day";
    byDay.set(day, [...(byDay.get(day) ?? []), commit]);
  }

  return [...byDay.entries()]
    .filter(([, dayCommits]) => dayCommits.length >= 6)
    .map(([day, dayCommits]) => {
      const signals = uniqueSignals(dayCommits.flatMap((commit) => commit.engineeringSignals));
      return `${day}: ${dayCommits.length} commits formed a rapid activity burst around ${
        signals.join(", ") || "general engineering churn"
      }`;
    });
}

function detectOwnershipChanges(commits: CommitIntelligence[]): string[] {
  const contributors = extractContributors(commits);
  const driveByCount = contributors.filter(
    (contributor) => contributor.ownershipSignal === "drive-by",
  ).length;

  return uniqueStrings([
    contributors.length >= 8
      ? `${contributors.length} contributors appear in the shallow history; ownership may be distributed.`
      : "",
    driveByCount >= 4
      ? `${driveByCount} drive-by contributors detected; review ownership consistency.`
      : "",
    contributors[0]?.ownershipSignal === "primary-owner" && contributors.length > 5
      ? `Primary ownership sits with ${contributors[0].name}, but several peripheral committers modified the system.`
      : "",
  ]);
}

function buildInstabilityNarrative(input: {
  commits: CommitIntelligence[];
  suspiciousCommitPatterns: string[];
  engineeringSignals: EngineeringActivitySignal[];
  rapidFeatureBursts: string[];
  ownershipChanges: string[];
}): string {
  if (input.commits.length === 0) {
    return "GHOST TRACE could not recover commit history; repository activity remains a dark zone in the investigation.";
  }

  const signals = input.engineeringSignals.join(", ") || "low explicit instability signal";
  const suspicious =
    input.suspiciousCommitPatterns.length > 0
      ? ` Suspicious commit residue includes ${input.suspiciousCommitPatterns
          .slice(0, 3)
          .join(", ")}.`
      : "";
  const bursts =
    input.rapidFeatureBursts.length > 0
      ? " Rapid feature bursts suggest engineering pressure accelerated faster than governance."
      : "";
  const ownership =
    input.ownershipChanges.length > 0
      ? ` Ownership turbulence: ${input.ownershipChanges.slice(0, 2).join(" ")}`
      : "";

  return `Repository activity shows ${signals}. The acquisition layer reads this history as forensic fuel: commits are not just changes, they are pressure marks left by the engineering system.${suspicious}${bursts}${ownership}`;
}

function inferRepositorySignalsFromMetadata(input: {
  currentBranch?: string;
  defaultBranch?: string;
  fileCount: number;
  estimatedSizeBytes: number;
  warnings: string[];
}): EngineeringActivitySignal[] {
  return uniqueSignals([
    input.currentBranch && input.defaultBranch && input.currentBranch !== input.defaultBranch
      ? "ownership_volatility"
      : undefined,
    input.fileCount > 1_500 ? "architecture_churn" : undefined,
    input.estimatedSizeBytes > DEFAULT_MAX_REPOSITORY_BYTES ? "instability_acceleration" : undefined,
    input.warnings.length > 0 ? "low_signal" : undefined,
  ]);
}

async function countRepositoryFiles(localPath: string): Promise<number> {
  let count = 0;

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === ".git") {
        continue;
      }

      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        count += 1;
      }
    }
  }

  await walk(localPath);
  return count;
}

async function estimateDirectorySize(localPath: string): Promise<number> {
  let total = 0;

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        const info = await stat(entryPath);
        total += info.size;
      }
    }
  }

  await walk(localPath);
  return total;
}

function normalizeGitError(error: unknown, repository: SanitizedGitHubRepository): Error {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("repository not found")) {
    return new Error(`Repository not found or private: ${repository.htmlUrl}`);
  }

  if (normalized.includes("remote branch") || normalized.includes("not found")) {
    return new Error(`Requested branch is missing for ${repository.htmlUrl}`);
  }

  if (
    normalized.includes("could not resolve host") ||
    normalized.includes("network") ||
    normalized.includes("timed out")
  ) {
    return new Error(`Network failure while acquiring ${repository.htmlUrl}`);
  }

  return new Error(`Repository acquisition failed for ${repository.htmlUrl}: ${message}`);
}

function generateFallbackRepositoryIntelligence(
  input: RepositoryAcquisitionInput | string,
  error?: unknown,
): RepositoryIntelligence {
  const acquisitionInput = normalizeAcquisitionInput(input);
  const fallbackOwner = acquisitionInput.owner ?? "ghost-trace";
  const fallbackRepo =
    acquisitionInput.repoName ??
    acquisitionInput.referenceName ??
    inferFallbackRepoName(acquisitionInput.repositoryUrl ?? acquisitionInput.repoUrl ?? acquisitionInput.url);
  const reason = error instanceof Error ? error.message : "repository fetch failed before telemetry stabilized";
  const latestCommits: CommitIntelligence[] = [
    {
      hash: "fallback000000000000000000000000000000000001",
      shortHash: "fallback",
      message: "hotfix: contain auth replay instability during release window",
      authorName: "GHOST TRACE Fallback Analyst",
      date: now(),
      filesChanged: ["middleware/auth.ts", "workers/replay.ts"],
      suspiciousPatterns: [
        "Emergency repair language detected",
        "Trust boundary modification detected",
      ],
      engineeringSignals: [
        "instability_acceleration",
        "security_boundary_motion",
        "scaling_pressure",
      ],
    },
    {
      hash: "fallback000000000000000000000000000000000002",
      shortHash: "fallback",
      message: "refactor: isolate dependency drift across api and worker runtime",
      authorName: "GHOST TRACE Fallback Analyst",
      date: now(),
      filesChanged: ["package-lock.json", "workers/package.json"],
      suspiciousPatterns: ["Dependency movement detected"],
      engineeringSignals: ["dependency_growth", "architecture_churn"],
    },
  ];
  const commitSummary = analyzeCommitPatterns(latestCommits);

  return {
    repoName: fallbackRepo,
    owner: fallbackOwner,
    branches: [acquisitionInput.branch ?? "main", "recovery/mock-forensics"],
    latestCommits,
    contributors: extractContributors(latestCommits),
    commitSummary: {
      ...commitSummary,
      instabilityNarrative:
        `Live repository acquisition failed, so GHOST TRACE activated cinematic ingestion fallback. ${reason}. ` +
        commitSummary.instabilityNarrative,
    },
    localPath: null,
    metadata: {
      sourceType: "mock",
      sourceUrl: acquisitionInput.repositoryUrl ?? acquisitionInput.repoUrl ?? acquisitionInput.url,
      selectedBranch: acquisitionInput.branch,
      clonedAt: now(),
      shallow: true,
      depth: 0,
      fileCount: 0,
      estimatedSizeBytes: 0,
      acquisitionMode: "fallback",
      cleanupRecommended: false,
      cleanedUp: true,
      warnings: [`Fallback repository intelligence activated: ${reason}`],
      engineeringSignals: commitSummary.engineeringSignals,
    },
    confidence: {
      acquisitionConfidence: 42,
      metadataConfidence: 38,
      activitySignalConfidence: 72,
      sourceTrust: 30,
      method: "cinematic-fallback",
    },
  };
}

async function safeCleanup(localPath: string): Promise<void> {
  try {
    await cleanupRepository(localPath);
  } catch {
    // Cleanup is defensive; acquisition errors should preserve the original cause.
  }
}

function inferFallbackRepoName(url?: string): string {
  if (!url) {
    return "unknown-repository";
  }

  return (
    url
      .replace(/\.git$/i, "")
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/[^A-Za-z0-9_.-]/g, "") || "unknown-repository"
  );
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  );
}

function uniqueSignals(
  values: Array<EngineeringActivitySignal | undefined>,
): EngineeringActivitySignal[] {
  return Array.from(new Set(values.filter((value): value is EngineeringActivitySignal => Boolean(value))));
}

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function now(): string {
  return new Date().toISOString();
}

export const git = {
  acquireRepository,
  fetchRepositoryIntelligence,
  cloneRepository,
  extractCommitHistory,
  getRepositoryMetadata,
  analyzeCommitPatterns,
  cleanupRepository,
  sanitizeGitHubRepository,
};

export default git;

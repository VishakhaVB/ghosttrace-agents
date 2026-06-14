import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AnalyzeFileInput,
  AnalyzeRequest,
  ArchitectureNodeType,
  ConfidenceScore,
} from "@/types/index";

type SourceType = "repository-url" | "uploaded-code" | "mock-structure" | "unknown";

export interface ParserFile {
  path: string;
  content: string;
  language?: string;
  sizeBytes?: number;
}

export interface ParserDependency {
  name: string;
  version: string;
  manager: "npm" | "python" | "maven" | "gradle" | "unknown";
  scope?: "production" | "development" | "peer" | "optional" | "runtime";
  sourceFile: string;
  suspicious?: boolean;
  reason?: string;
}

export interface ParserService {
  id: string;
  name: string;
  type: ArchitectureNodeType;
  path?: string;
  confidence: ConfidenceScore;
  indicators: string[];
}

export interface ParserArchitectureIntelligence {
  style: "monolith" | "modular-monolith" | "microservices" | "fullstack" | "unknown";
  frontendDetected: boolean;
  backendDetected: boolean;
  apiLayers: string[];
  authSystems: string[];
  databaseServices: string[];
  middlewareLayers: string[];
  sharedModules: string[];
  serviceBoundaries: string[];
  ownershipConcerns: string[];
  confidence: ConfidenceScore;
}

export interface ParserConfidence {
  parsing: ConfidenceScore;
  architecture: ConfidenceScore;
  instability: ConfidenceScore;
  overall: ConfidenceScore;
}

export interface RepositoryIntelligenceParseResult {
  sourceType: SourceType;
  repositoryUrl?: string;
  fileCount: number;
  files: ParserFile[];
  sampledPaths: string[];
  codeExcerpt: string;
  fileMap: Record<string, Pick<ParserFile, "language" | "sizeBytes"> & { lines: number }>;
  frameworks: string[];
  detectedFrameworks: string[];
  dependencies: string[];
  dependencyMap: ParserDependency[];
  dependencySignals: string[];
  architecture: ParserArchitectureIntelligence;
  services: ParserService[];
  detectedServices: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
  instabilitySignals: string[];
  architectureDrift: string[];
  securitySignals: string[];
  scalingSignals: string[];
  repoSummary: string;
  confidence: ParserConfidence;
  metadata: {
    parsedAt: string;
    parserMode: "filesystem" | "uploaded-files" | "mock-structure" | "raw-code" | "fallback";
    contentFingerprint: string;
    totalBytes: number;
    analyzedBytes: number;
    ignoredFiles: number;
    maxFiles: number;
  };
}

export interface ParserOptions {
  rootPath?: string;
  maxFiles?: number;
  maxFileBytes?: number;
  maxTotalBytes?: number;
  allowFallback?: boolean;
  includeHidden?: boolean;
}

export type ParserInput =
  | (AnalyzeRequest & {
      rootPath?: string;
      extractedPath?: string;
      localPath?: string;
      fileTree?: unknown;
    })
  | string;

type FileCandidate = {
  path: string;
  content?: string;
  sizeBytes?: number;
};

type ScanStats = {
  ignoredFiles: number;
  totalBytes: number;
  analyzedBytes: number;
};

const DEFAULT_MAX_FILES = 420;
const DEFAULT_MAX_FILE_BYTES = 180_000;
const DEFAULT_MAX_TOTAL_BYTES = 3_500_000;
const CODE_EXCERPT_LIMIT = 28_000;

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".cache",
  "__pycache__",
  "target",
  "bin",
  "obj",
  "vendor",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".toml",
  ".env",
  ".txt",
  ".py",
  ".java",
  ".kt",
  ".go",
  ".rs",
  ".php",
  ".rb",
  ".cs",
  ".sql",
  ".graphql",
  ".prisma",
  ".xml",
  ".gradle",
]);

const FRAMEWORK_RULES: Array<{
  name: string;
  dependencies: string[];
  files: string[];
  pathHints: string[];
}> = [
  {
    name: "Next.js",
    dependencies: ["next"],
    files: ["next.config.js", "next.config.mjs", "next.config.ts", "app/layout.tsx"],
    pathHints: ["app/page.", "pages/api/"],
  },
  {
    name: "React",
    dependencies: ["react", "react-dom"],
    files: ["vite.config.ts", "vite.config.js"],
    pathHints: ["src/App.", "components/"],
  },
  {
    name: "Express",
    dependencies: ["express"],
    files: [],
    pathHints: ["routes/", "server.ts", "server.js", "app.ts", "app.js"],
  },
  {
    name: "NestJS",
    dependencies: ["@nestjs/core", "@nestjs/common"],
    files: ["nest-cli.json"],
    pathHints: [".module.ts", ".controller.ts", ".service.ts"],
  },
  {
    name: "Flask",
    dependencies: ["flask"],
    files: ["app.py"],
    pathHints: ["flask", "blueprints/"],
  },
  {
    name: "Django",
    dependencies: ["django"],
    files: ["manage.py", "settings.py"],
    pathHints: ["django", "migrations/"],
  },
  {
    name: "Spring Boot",
    dependencies: ["spring-boot", "spring-boot-starter-web"],
    files: ["pom.xml", "build.gradle"],
    pathHints: ["src/main/java", "@SpringBootApplication"],
  },
  {
    name: "FastAPI",
    dependencies: ["fastapi", "uvicorn"],
    files: [],
    pathHints: ["fastapi", "APIRouter"],
  },
  {
    name: "MongoDB",
    dependencies: ["mongodb", "mongoose", "pymongo"],
    files: [],
    pathHints: ["mongoose", "mongodb", "mongo"],
  },
  {
    name: "PostgreSQL",
    dependencies: ["pg", "postgres", "psycopg2", "asyncpg"],
    files: [],
    pathHints: ["postgres", "postgresql", ".sql", "prisma/schema.prisma"],
  },
];

export async function parseRepository(
  input: ParserInput = {},
  options: ParserOptions = {},
): Promise<RepositoryIntelligenceParseResult> {
  try {
    const normalizedInput = normalizeInput(input);
    const config = {
      maxFiles: options.maxFiles ?? DEFAULT_MAX_FILES,
      maxFileBytes: options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES,
      maxTotalBytes: options.maxTotalBytes ?? DEFAULT_MAX_TOTAL_BYTES,
      includeHidden: options.includeHidden ?? false,
    };
    const scan = await collectRepositoryFiles(normalizedInput, options, config);

    if (scan.files.length === 0) {
      throw new Error("No readable repository files were supplied to parser.");
    }

    const files = scan.files.slice(0, config.maxFiles);
    const sampledPaths = files.map((file) => file.path);
    const corpus = buildCorpus(files);
    const dependencies = extractDependencies(files);
    const dependencyNames = uniqueStrings(dependencies.map((dependency) => dependency.name));
    const frameworks = detectFrameworks(files, dependencyNames, corpus);
    const services = detectServices(files, corpus);
    const architecture = analyzeArchitecture(files, services, frameworks, corpus);
    const suspiciousPatterns = detectSuspiciousPatterns(files, dependencies, corpus);
    const duplicatedModules = detectDuplicatedModules(files);
    const dependencySignals = detectDependencySignals(dependencies, files);
    const securitySignals = detectSecuritySignals(files, suspiciousPatterns, corpus);
    const scalingSignals = detectScalingSignals(files, suspiciousPatterns, corpus);
    const architectureDrift = detectArchitectureDrift(files, services, suspiciousPatterns);
    const instabilitySignals = uniqueStrings([
      ...dependencySignals,
      ...securitySignals,
      ...scalingSignals,
      ...architectureDrift,
      ...suspiciousPatterns.filter((pattern) =>
        containsAny(pattern, ["drift", "fragment", "duplicate", "retry", "oversized"]),
      ),
    ]);
    const confidence = calculateConfidence({
      files,
      frameworks,
      services,
      dependencies,
      suspiciousPatterns,
      instabilitySignals,
      sourceType: normalizedInput.sourceType,
      ignoredFiles: scan.stats.ignoredFiles,
    });

    return {
      sourceType: normalizedInput.sourceType,
      repositoryUrl: normalizedInput.repositoryUrl,
      fileCount: files.length,
      files,
      sampledPaths,
      codeExcerpt: buildCodeExcerpt(files),
      fileMap: buildFileMap(files),
      frameworks,
      detectedFrameworks: frameworks,
      dependencies: dependencyNames,
      dependencyMap: dependencies,
      dependencySignals,
      architecture,
      services,
      detectedServices: services.map((service) => service.name),
      duplicatedModules,
      suspiciousPatterns,
      instabilitySignals,
      architectureDrift,
      securitySignals,
      scalingSignals,
      repoSummary: buildRepoSummary({
        files,
        frameworks,
        services,
        suspiciousPatterns,
        instabilitySignals,
        architecture,
      }),
      confidence,
      metadata: {
        parsedAt: new Date().toISOString(),
        parserMode: scan.mode,
        contentFingerprint: fingerprint(
          files.map((file) => `${file.path}:${file.sizeBytes}:${file.content.slice(0, 400)}`).join("|"),
        ),
        totalBytes: scan.stats.totalBytes,
        analyzedBytes: scan.stats.analyzedBytes,
        ignoredFiles: scan.stats.ignoredFiles,
        maxFiles: config.maxFiles,
      },
    };
  } catch (error) {
    if (options.allowFallback === false) {
      throw error;
    }

    return buildFallbackIntelligence(
      error instanceof Error ? error.message : "Unknown parser failure.",
      input,
      options,
    );
  }
}

export async function parse(
  input: ParserInput = {},
  options: ParserOptions = {},
): Promise<RepositoryIntelligenceParseResult> {
  return parseRepository(input, options);
}

export async function extractRepositoryIntelligence(
  input: ParserInput = {},
  options: ParserOptions = {},
): Promise<RepositoryIntelligenceParseResult> {
  return parseRepository(input, options);
}

async function collectRepositoryFiles(
  input: NormalizedParserInput,
  options: ParserOptions,
  config: Required<Pick<ParserOptions, "maxFiles" | "maxFileBytes" | "maxTotalBytes" | "includeHidden">>,
): Promise<{
  files: ParserFile[];
  stats: ScanStats;
  mode: RepositoryIntelligenceParseResult["metadata"]["parserMode"];
}> {
  const stats: ScanStats = {
    ignoredFiles: 0,
    totalBytes: 0,
    analyzedBytes: 0,
  };
  const rootPath = options.rootPath ?? input.rootPath;

  if (rootPath) {
    const files = await readFilesFromFilesystem(rootPath, config, stats);
    return { files, stats, mode: "filesystem" };
  }

  if (input.files.length > 0) {
    const files = normalizeProvidedFiles(input.files, config, stats);
    return { files, stats, mode: "uploaded-files" };
  }

  if (input.structure !== undefined) {
    const candidates = normalizeStructureToCandidates(input.structure);
    const files = normalizeProvidedFiles(candidates, config, stats);
    return { files, stats, mode: "mock-structure" };
  }

  if (input.rawCode.trim()) {
    const file: ParserFile = {
      path: "uploaded-code.txt",
      content: input.rawCode.slice(0, config.maxFileBytes),
      language: "text",
      sizeBytes: byteLength(input.rawCode),
    };

    stats.totalBytes = file.sizeBytes ?? 0;
    stats.analyzedBytes = byteLength(file.content);

    return { files: [file], stats, mode: "raw-code" };
  }

  return { files: [], stats, mode: "fallback" };
}

async function readFilesFromFilesystem(
  rootPath: string,
  config: Required<Pick<ParserOptions, "maxFiles" | "maxFileBytes" | "maxTotalBytes" | "includeHidden">>,
  stats: ScanStats,
) {
  const resolvedRoot = path.resolve(rootPath);
  const rootStat = await fs.stat(resolvedRoot);

  if (!rootStat.isDirectory()) {
    throw new Error(`Repository path is not a directory: ${resolvedRoot}`);
  }

  const files: ParserFile[] = [];

  async function walk(current: string) {
    if (files.length >= config.maxFiles || stats.analyzedBytes >= config.maxTotalBytes) {
      return;
    }

    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= config.maxFiles || stats.analyzedBytes >= config.maxTotalBytes) {
        return;
      }

      if (!config.includeHidden && entry.name.startsWith(".") && entry.name !== ".env") {
        stats.ignoredFiles += 1;
        continue;
      }

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) {
          stats.ignoredFiles += 1;
          continue;
        }

        await walk(path.join(current, entry.name));
        continue;
      }

      if (!entry.isFile()) {
        stats.ignoredFiles += 1;
        continue;
      }

      const absolutePath = path.join(current, entry.name);
      const relativePath = normalizePath(path.relative(resolvedRoot, absolutePath));

      if (!shouldAnalyzeFile(relativePath)) {
        stats.ignoredFiles += 1;
        continue;
      }

      const fileStat = await fs.stat(absolutePath);
      stats.totalBytes += fileStat.size;

      if (fileStat.size > config.maxFileBytes) {
        stats.ignoredFiles += 1;
        continue;
      }

      const content = await fs.readFile(absolutePath, "utf8");
      const analyzedBytes = byteLength(content);

      if (stats.analyzedBytes + analyzedBytes > config.maxTotalBytes) {
        stats.ignoredFiles += 1;
        continue;
      }

      stats.analyzedBytes += analyzedBytes;
      files.push({
        path: relativePath,
        content,
        language: inferLanguage(relativePath),
        sizeBytes: fileStat.size,
      });
    }
  }

  await walk(resolvedRoot);
  return files;
}

function normalizeProvidedFiles(
  providedFiles: Array<AnalyzeFileInput | FileCandidate>,
  config: Required<Pick<ParserOptions, "maxFiles" | "maxFileBytes" | "maxTotalBytes" | "includeHidden">>,
  stats: ScanStats,
) {
  const files: ParserFile[] = [];

  for (const [index, file] of providedFiles.entries()) {
    if (files.length >= config.maxFiles || stats.analyzedBytes >= config.maxTotalBytes) {
      stats.ignoredFiles += 1;
      continue;
    }

    const filePath = normalizePath(file.path ?? `uploaded-file-${index + 1}.txt`);

    if (!shouldAnalyzeFile(filePath)) {
      stats.ignoredFiles += 1;
      continue;
    }

    const rawContent = file.content ?? "";
    const sizeBytes = file.sizeBytes ?? byteLength(rawContent);
    stats.totalBytes += sizeBytes;

    if (sizeBytes > config.maxFileBytes) {
      stats.ignoredFiles += 1;
      continue;
    }

    if (stats.analyzedBytes + byteLength(rawContent) > config.maxTotalBytes) {
      stats.ignoredFiles += 1;
      continue;
    }

    stats.analyzedBytes += byteLength(rawContent);
    files.push({
      path: filePath,
      content: rawContent,
      language: inferLanguage(filePath),
      sizeBytes,
    });
  }

  return files;
}

function normalizeStructureToCandidates(structure: unknown, prefix = ""): FileCandidate[] {
  if (Array.isArray(structure)) {
    return structure.flatMap((item) => normalizeStructureToCandidates(item, prefix));
  }

  if (!isRecord(structure)) {
    return [];
  }

  if (typeof structure.content === "string") {
    return [
      {
        path:
          readString(structure, "path") ??
          readString(structure, "name") ??
          `${prefix || "mock-file"}.txt`,
        content: structure.content,
        sizeBytes: readNumber(structure, "sizeBytes"),
      },
    ];
  }

  if (Array.isArray(structure.files)) {
    return normalizeStructureToCandidates(structure.files, prefix);
  }

  if (Array.isArray(structure.children)) {
    const name = readString(structure, "path") ?? readString(structure, "name") ?? prefix;
    return normalizeStructureToCandidates(structure.children, name);
  }

  const candidates: FileCandidate[] = [];

  for (const [key, value] of Object.entries(structure)) {
    const nextPath = prefix ? `${prefix}/${key}` : key;

    if (typeof value === "string") {
      candidates.push({
        path: nextPath,
        content: value,
        sizeBytes: byteLength(value),
      });
      continue;
    }

    candidates.push(...normalizeStructureToCandidates(value, nextPath));
  }

  return candidates;
}

function extractDependencies(files: ParserFile[]): ParserDependency[] {
  const dependencies: ParserDependency[] = [];

  for (const file of files) {
    const basename = path.posix.basename(file.path).toLowerCase();

    if (basename === "package.json") {
      dependencies.push(...extractPackageJsonDependencies(file));
      continue;
    }

    if (basename === "requirements.txt") {
      dependencies.push(...extractRequirementsDependencies(file));
      continue;
    }

    if (basename === "pyproject.toml") {
      dependencies.push(...extractPyprojectDependencies(file));
      continue;
    }

    if (basename === "pom.xml") {
      dependencies.push(...extractMavenDependencies(file));
      continue;
    }

    if (basename === "build.gradle" || basename === "build.gradle.kts") {
      dependencies.push(...extractGradleDependencies(file));
    }
  }

  return dependencies.map((dependency) => ({
    ...dependency,
    suspicious: dependency.suspicious ?? isSuspiciousDependency(dependency.name, dependency.version),
    reason:
      dependency.reason ??
      suspiciousDependencyReason(dependency.name, dependency.version) ??
      undefined,
  }));
}

function extractPackageJsonDependencies(file: ParserFile): ParserDependency[] {
  try {
    const parsed = JSON.parse(file.content) as Record<string, unknown>;
    const buckets: Array<[string, ParserDependency["scope"]]> = [
      ["dependencies", "production"],
      ["devDependencies", "development"],
      ["peerDependencies", "peer"],
      ["optionalDependencies", "optional"],
    ];

    return buckets.flatMap(([key, scope]) => {
      const record = isRecord(parsed[key]) ? parsed[key] : {};

      return Object.entries(record).map(([name, version]) => ({
        name,
        version: String(version),
        manager: "npm" as const,
        scope,
        sourceFile: file.path,
      }));
    });
  } catch {
    return [
      {
        name: "package-json-parse-failure",
        version: "unknown",
        manager: "npm",
        sourceFile: file.path,
        suspicious: true,
        reason: "package.json could not be parsed; dependency intelligence is degraded.",
      },
    ];
  }
}

function extractRequirementsDependencies(file: ParserFile): ParserDependency[] {
  return file.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"))
    .map((line) => {
      const [name, version = "unbounded"] = line.split(/[=<>~!]+/);

      return {
        name: name.trim().toLowerCase(),
        version: version.trim() || "unbounded",
        manager: "python" as const,
        scope: "runtime" as const,
        sourceFile: file.path,
      };
    });
}

function extractPyprojectDependencies(file: ParserFile): ParserDependency[] {
  const matches = [...file.content.matchAll(/["']([a-zA-Z0-9_.-]+)(?:[<>=!~ ].*?)?["']/g)];

  return matches
    .map((match) => match[1])
    .filter((name) => knownPythonDependency(name))
    .map((name) => ({
      name: name.toLowerCase(),
      version: "pyproject",
      manager: "python" as const,
      scope: "runtime" as const,
      sourceFile: file.path,
    }));
}

function extractMavenDependencies(file: ParserFile): ParserDependency[] {
  const dependencies: ParserDependency[] = [];
  const blocks = file.content.match(/<dependency>[\s\S]*?<\/dependency>/g) ?? [];

  for (const block of blocks) {
    const artifact = block.match(/<artifactId>(.*?)<\/artifactId>/)?.[1];
    const version = block.match(/<version>(.*?)<\/version>/)?.[1] ?? "managed";

    if (artifact) {
      dependencies.push({
        name: artifact,
        version,
        manager: "maven",
        scope: "runtime",
        sourceFile: file.path,
      });
    }
  }

  return dependencies;
}

function extractGradleDependencies(file: ParserFile): ParserDependency[] {
  const dependencies: ParserDependency[] = [];
  const matches = file.content.matchAll(
    /(implementation|api|compileOnly|runtimeOnly|testImplementation)\s*\(?\s*["']([^:"']+):([^:"']+):([^"']+)["']/g,
  );

  for (const match of matches) {
    dependencies.push({
      name: match[3],
      version: match[4],
      manager: "gradle",
      scope: match[1] === "testImplementation" ? "development" : "runtime",
      sourceFile: file.path,
    });
  }

  return dependencies;
}

function detectFrameworks(
  files: ParserFile[],
  dependencies: string[],
  corpus: string,
) {
  const pathSet = new Set(files.map((file) => file.path.toLowerCase()));
  const dependencySet = new Set(dependencies.map((dependency) => dependency.toLowerCase()));
  const detected = new Set<string>();

  for (const rule of FRAMEWORK_RULES) {
    const dependencyHit = rule.dependencies.some((dependency) =>
      dependencySet.has(dependency.toLowerCase()),
    );
    const fileHit = rule.files.some((fileName) => pathSet.has(fileName.toLowerCase()));
    const pathHit = rule.pathHints.some((hint) => {
      const normalizedHint = hint.toLowerCase();
      return corpus.includes(normalizedHint) || [...pathSet].some((filePath) => filePath.includes(normalizedHint));
    });

    if (dependencyHit || fileHit || pathHit) {
      detected.add(rule.name);
    }
  }

  return [...detected];
}

function detectServices(files: ParserFile[], corpus: string): ParserService[] {
  const services = new Map<string, ParserService>();

  const addService = (
    name: string,
    type: ArchitectureNodeType,
    filePath: string | undefined,
    confidence: number,
    indicator: string,
  ) => {
    const id = slugify(name);
    const existing = services.get(id);

    if (existing) {
      existing.confidence = clampScore(Math.max(existing.confidence, confidence));
      existing.indicators = uniqueStrings([...existing.indicators, indicator]);
      existing.path ??= filePath;
      return;
    }

    services.set(id, {
      id,
      name,
      type,
      path: filePath,
      confidence: clampScore(confidence),
      indicators: [indicator],
    });
  };

  for (const file of files) {
    const normalized = file.path.toLowerCase();
    const content = file.content.toLowerCase();

    if (containsAny(normalized, ["app/", "pages/", "components/", "src/app", "src/pages"])) {
      addService("Frontend Application", "frontend", file.path, 82, "UI directory structure detected");
    }

    if (containsAny(normalized, ["api/", "routes/", "controllers/", "route.ts", "route.js"])) {
      addService("API Layer", "api", file.path, 86, "API route/controller files detected");
    }

    if (containsAny(normalized, ["auth", "session", "jwt", "middleware"])) {
      addService("Authentication System", "auth", file.path, 88, "Auth/session artifacts detected");
    }

    if (containsAny(normalized, ["worker", "queue", "jobs", "consumer"])) {
      addService("Worker and Queue Runtime", "worker", file.path, 84, "Worker/queue execution path detected");
    }

    if (containsAny(normalized, ["db", "database", "prisma", "migration"]) || containsAny(content, ["postgres", "mongodb", "mongoose", "prisma"])) {
      addService("Data Layer", "database", file.path, 80, "Database access or schema layer detected");
    }

    if (containsAny(normalized, ["middleware", "interceptor", "guard"])) {
      addService("Middleware Boundary", "service", file.path, 76, "Middleware or guard layer detected");
    }

    if (containsAny(normalized, ["billing", "payment", "stripe", "webhook"])) {
      addService("Billing Integration", "external", file.path, 82, "Payment/webhook integration detected");
    }
  }

  if (containsAny(corpus, ["microservice", "services/", "apps/"])) {
    addService("Service Mesh", "service", undefined, 72, "Multi-service structure inferred");
  }

  return [...services.values()].sort((left, right) => right.confidence - left.confidence);
}

function analyzeArchitecture(
  files: ParserFile[],
  services: ParserService[],
  frameworks: string[],
  corpus: string,
): ParserArchitectureIntelligence {
  const paths = files.map((file) => file.path.toLowerCase());
  const apiLayers = paths.filter((filePath) =>
    containsAny(filePath, ["api/", "routes/", "controllers/", "route."]),
  );
  const authSystems = paths.filter((filePath) =>
    containsAny(filePath, ["auth", "session", "jwt", "middleware", "guard"]),
  );
  const databaseServices = paths.filter((filePath) =>
    containsAny(filePath, ["db", "database", "prisma", "migration", "schema.sql"]),
  );
  const middlewareLayers = paths.filter((filePath) =>
    containsAny(filePath, ["middleware", "interceptor", "guard", "policy"]),
  );
  const sharedModules = paths.filter((filePath) =>
    containsAny(filePath, ["shared", "common", "utils", "lib/"]),
  );
  const frontendDetected =
    services.some((service) => service.type === "frontend") ||
    frameworks.some((framework) => ["Next.js", "React"].includes(framework));
  const backendDetected =
    services.some((service) => ["api", "service", "worker"].includes(service.type)) ||
    frameworks.some((framework) =>
      ["Express", "NestJS", "Flask", "Django", "Spring Boot", "FastAPI"].includes(framework),
    );
  const serviceBoundaryRoots = uniqueStrings(
    services.map((service) => service.path?.split("/").slice(0, 2).join("/") ?? service.name),
  );
  const style = inferArchitectureStyle({
    frontendDetected,
    backendDetected,
    services,
    paths,
  });
  const ownershipConcerns = inferOwnershipConcerns({
    authSystems,
    apiLayers,
    sharedModules,
    databaseServices,
    corpus,
  });

  return {
    style,
    frontendDetected,
    backendDetected,
    apiLayers: apiLayers.slice(0, 16),
    authSystems: authSystems.slice(0, 16),
    databaseServices: databaseServices.slice(0, 16),
    middlewareLayers: middlewareLayers.slice(0, 16),
    sharedModules: sharedModules.slice(0, 16),
    serviceBoundaries: serviceBoundaryRoots.slice(0, 16),
    ownershipConcerns,
    confidence: clampScore(50 + services.length * 6 + frameworks.length * 5 + ownershipConcerns.length * 3),
  };
}

function detectSuspiciousPatterns(
  files: ParserFile[],
  dependencies: ParserDependency[],
  corpus: string,
) {
  const patterns: string[] = [];
  const paths = files.map((file) => file.path);
  const authFiles = files.filter((file) =>
    containsAny(file.path.toLowerCase(), ["auth", "session", "jwt", "token"]),
  );
  const validationFiles = files.filter((file) =>
    containsAny(file.path.toLowerCase(), ["validator", "validation", "schema", "dto"]),
  );
  const retryFiles = files.filter((file) =>
    containsAny(file.path.toLowerCase(), ["retry", "queue", "worker", "replay"]) ||
    containsAny(file.content.toLowerCase(), ["retry", "backoff", "deadletter", "dead-letter"]),
  );
  const oversizedFiles = files.filter((file) => lineCount(file.content) > 420);
  const deeplyNested = paths.filter((filePath) => filePath.split("/").length >= 7);
  const deadCodeFiles = files.filter((file) =>
    containsAny(file.content.toLowerCase(), ["todo", "fixme", "deprecated", "legacy", "remove before prod"]),
  );
  const circularImports = detectCircularDependencies(files);
  const suspiciousDeps = dependencies.filter((dependency) => dependency.suspicious);

  if (authFiles.length >= 3) {
    patterns.push(
      `Duplicated auth logic suspected across ${authFiles.length} files; session authority may be fragmented.`,
    );
  }

  if (validationFiles.length >= 3) {
    patterns.push(
      `Fragmented validation detected across ${validationFiles.length} schema or validator surfaces.`,
    );
  }

  if (retryFiles.length >= 2) {
    patterns.push(
      `Retry inconsistency risk detected across ${retryFiles.length} queue, worker, or replay paths.`,
    );
  }

  if (oversizedFiles.length > 0) {
    patterns.push(
      `Oversized modules found: ${oversizedFiles
        .slice(0, 3)
        .map((file) => `${file.path} (${lineCount(file.content)} lines)`)
        .join(", ")}.`,
    );
  }

  if (deeplyNested.length > 0) {
    patterns.push(
      `Deeply nested service hierarchy detected in ${deeplyNested.slice(0, 3).join(", ")}.`,
    );
  }

  if (deadCodeFiles.length > 0) {
    patterns.push(
      `Dead-code or legacy markers detected in ${deadCodeFiles.length} files, increasing forensic ambiguity.`,
    );
  }

  if (circularImports.length > 0) {
    patterns.push(
      `Circular dependency risk detected: ${circularImports.slice(0, 2).join(" | ")}.`,
    );
  }

  if (suspiciousDeps.length > 0) {
    patterns.push(
      `Unstable dependency usage detected: ${suspiciousDeps
        .slice(0, 5)
        .map((dependency) => `${dependency.name}@${dependency.version}`)
        .join(", ")}.`,
    );
  }

  if (containsAny(corpus, ["any", "unknown as", "as any"]) && containsAny(corpus, ["auth", "payment", "billing", "permission"])) {
    patterns.push(
      "Type boundary erosion found near sensitive auth/payment surfaces; runtime assumptions may be hiding instability.",
    );
  }

  if (containsAny(corpus, ["catch (", "catch("]) && containsAny(corpus, ["console.error", "return null", "return undefined"])) {
    patterns.push(
      "Error handling may suppress root-cause signals by converting failures into null or undefined recovery paths.",
    );
  }

  return uniqueStrings(patterns);
}

function detectDuplicatedModules(files: ParserFile[]) {
  const groups = new Map<string, string[]>();

  for (const file of files) {
    const basename = path.posix.basename(file.path).toLowerCase();
    const normalized = basename
      .replace(/\.(test|spec|mock|fixture)\./, ".")
      .replace(/[-_.]?(copy|legacy|old|new|v2|fallback)/g, "")
      .replace(/\.(ts|tsx|js|jsx|py|java|go|rs)$/, "");

    if (normalized.length < 4) {
      continue;
    }

    const existing = groups.get(normalized) ?? [];
    existing.push(file.path);
    groups.set(normalized, existing);
  }

  return [...groups.entries()]
    .filter(([, paths]) => paths.length > 1)
    .flatMap(([name, paths]) =>
      paths.map((filePath) => `${name}: ${filePath}`),
    )
    .slice(0, 20);
}

function detectDependencySignals(dependencies: ParserDependency[], files: ParserFile[]) {
  const signals: string[] = [];
  const names = dependencies.map((dependency) => dependency.name.toLowerCase());
  const suspicious = dependencies.filter((dependency) => dependency.suspicious);

  if (suspicious.length > 0) {
    signals.push(
      `Dependency instability detected in ${suspicious
        .slice(0, 5)
        .map((dependency) => dependency.reason ?? `${dependency.name}@${dependency.version}`)
        .join("; ")}.`,
    );
  }

  if (names.includes("jsonwebtoken") && names.includes("jose")) {
    signals.push(
      "Dual auth dependency stack detected: jsonwebtoken and jose may split runtime identity behavior.",
    );
  }

  if (names.includes("mongoose") && (names.includes("pg") || names.includes("postgres"))) {
    signals.push(
      "Multiple database client families detected, suggesting mixed persistence ownership.",
    );
  }

  const packageFiles = files.filter((file) => path.posix.basename(file.path).toLowerCase() === "package.json");

  if (packageFiles.length > 1) {
    signals.push(
      `${packageFiles.length} package.json files detected; runtime dependency parity should be verified across services.`,
    );
  }

  return uniqueStrings(signals);
}

function detectSecuritySignals(files: ParserFile[], suspiciousPatterns: string[], corpus: string) {
  const signals: string[] = [];
  const authPaths = files.filter((file) =>
    containsAny(file.path.toLowerCase(), ["auth", "session", "token", "jwt", "guard"]),
  );

  if (authPaths.length >= 2) {
    signals.push(
      `Authentication logic spans ${authPaths.length} files, increasing risk of inconsistent authorization verdicts.`,
    );
  }

  if (containsAny(corpus, ["process.env.jwt", "jwt_secret", "secret_key", "private_key"])) {
    signals.push("Secret-dependent authentication paths detected; environment parity is security-critical.");
  }

  if (suspiciousPatterns.some((pattern) => containsAny(pattern, ["auth", "validation", "boundary"]))) {
    signals.push("Security boundary confidence reduced by fragmented auth or validation evidence.");
  }

  return uniqueStrings(signals);
}

function detectScalingSignals(files: ParserFile[], suspiciousPatterns: string[], corpus: string) {
  const signals: string[] = [];
  const queueFiles = files.filter((file) =>
    containsAny(file.path.toLowerCase(), ["queue", "worker", "job", "consumer", "producer"]),
  );

  if (queueFiles.length > 0) {
    signals.push(
      `Queue or worker runtime detected in ${queueFiles.length} files; replay and scaling behavior require forensic review.`,
    );
  }

  if (containsAny(corpus, ["retry", "backoff", "settimeout", "setinterval", "timeout"])) {
    signals.push("Retry or timeout logic detected; failure amplification is possible under load.");
  }

  if (containsAny(corpus, ["rate limit", "ratelimit", "throttle", "concurrency"])) {
    signals.push("Concurrency or rate-limit controls detected; scaling bottleneck analysis is available.");
  }

  if (suspiciousPatterns.some((pattern) => containsAny(pattern, ["retry", "oversized", "deeply nested"]))) {
    signals.push("Scaling confidence reduced by retry inconsistency or complex service hierarchy.");
  }

  return uniqueStrings(signals);
}

function detectArchitectureDrift(
  files: ParserFile[],
  services: ParserService[],
  suspiciousPatterns: string[],
) {
  const drift: string[] = [];
  const sharedFiles = files.filter((file) =>
    containsAny(file.path.toLowerCase(), ["shared", "common", "utils", "lib/"]),
  );
  const apiFiles = files.filter((file) => containsAny(file.path.toLowerCase(), ["api", "route", "controller"]));
  const workerFiles = files.filter((file) => containsAny(file.path.toLowerCase(), ["worker", "queue", "job"]));
  const authServices = services.filter((service) => service.type === "auth");

  if (sharedFiles.length > Math.max(6, files.length * 0.16)) {
    drift.push(
      "Shared modules occupy a large portion of the repository, suggesting ownership boundaries may be eroding.",
    );
  }

  if (apiFiles.length > 0 && workerFiles.length > 0 && authServices.length > 0) {
    drift.push(
      "API, worker, and auth surfaces coexist; architecture should verify that trust decisions remain canonical.",
    );
  }

  if (suspiciousPatterns.some((pattern) => containsAny(pattern, ["fragmented", "duplicated", "circular"]))) {
    drift.push(
      "Architecture drift inferred from duplicated modules, fragmented boundaries, or circular dependency pressure.",
    );
  }

  if (services.length >= 6) {
    drift.push(
      `${services.length} service zones detected; service ownership needs explicit boundaries to prevent cross-domain recovery logic.`,
    );
  }

  return uniqueStrings(drift);
}

function detectCircularDependencies(files: ParserFile[]) {
  const graph = new Map<string, string[]>();
  const knownFiles = new Set(files.map((file) => stripExtension(file.path)));

  for (const file of files) {
    if (!["typescript", "javascript"].includes(file.language ?? "")) {
      continue;
    }

    const imports = [...file.content.matchAll(/(?:import|export).*?from\s+["'](.+?)["']|require\(["'](.+?)["']\)/g)]
      .map((match) => match[1] ?? match[2])
      .filter((specifier) => specifier.startsWith("."))
      .map((specifier) => resolveImportPath(file.path, specifier, knownFiles))
      .filter((resolved): resolved is string => Boolean(resolved));

    graph.set(stripExtension(file.path), imports);
  }

  const cycles: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(node: string, stack: string[]) {
    if (cycles.length >= 5) {
      return;
    }

    if (visiting.has(node)) {
      const cycleStart = stack.indexOf(node);
      cycles.push([...stack.slice(cycleStart), node].join(" -> "));
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visiting.add(node);

    for (const next of graph.get(node) ?? []) {
      visit(next, [...stack, node]);
    }

    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) {
    visit(node, []);
  }

  return uniqueStrings(cycles);
}

function buildFileMap(files: ParserFile[]) {
  return Object.fromEntries(
    files.map((file) => [
      file.path,
      {
        language: file.language,
        sizeBytes: file.sizeBytes,
        lines: lineCount(file.content),
      },
    ]),
  );
}

function buildCodeExcerpt(files: ParserFile[]) {
  const priority = [...files].sort((left, right) => filePriority(right) - filePriority(left));
  let excerpt = "";

  for (const file of priority) {
    const block = `FILE: ${file.path}\n${file.content.slice(0, 2_400)}\n\n`;

    if (excerpt.length + block.length > CODE_EXCERPT_LIMIT) {
      break;
    }

    excerpt += block;
  }

  return excerpt.trim();
}

function buildCorpus(files: ParserFile[]) {
  return files
    .map((file) => `${file.path}\n${file.content}`)
    .join("\n")
    .toLowerCase()
    .slice(0, 180_000);
}

function buildRepoSummary(input: {
  files: ParserFile[];
  frameworks: string[];
  services: ParserService[];
  suspiciousPatterns: string[];
  instabilitySignals: string[];
  architecture: ParserArchitectureIntelligence;
}) {
  const frameworkText =
    input.frameworks.length > 0 ? humanList(input.frameworks) : "unknown framework stack";
  const serviceText =
    input.services.length > 0
      ? humanList(input.services.slice(0, 5).map((service) => service.name))
      : "unclassified service zones";
  const riskText =
    input.instabilitySignals.length > 0
      ? input.instabilitySignals[0]
      : "No dominant instability signal exceeded parser threshold.";

  return `GHOST TRACE parsed ${input.files.length} repository files and reconstructed a ${input.architecture.style} architecture using ${frameworkText}. Primary service zones include ${serviceText}. Forensic scanner headline: ${riskText}`;
}

function calculateConfidence(input: {
  files: ParserFile[];
  frameworks: string[];
  services: ParserService[];
  dependencies: ParserDependency[];
  suspiciousPatterns: string[];
  instabilitySignals: string[];
  sourceType: SourceType;
  ignoredFiles: number;
}): ParserConfidence {
  const parsing = clampScore(
    48 +
      Math.min(input.files.length, 60) * 0.7 +
      Math.min(input.dependencies.length, 35) * 0.4 -
      Math.min(input.ignoredFiles, 25) * 0.5,
  );
  const architecture = clampScore(
    42 +
      input.frameworks.length * 9 +
      input.services.length * 7 +
      (input.sourceType === "unknown" ? -8 : 0),
  );
  const instability = clampScore(
    45 + input.suspiciousPatterns.length * 8 + input.instabilitySignals.length * 5,
  );
  const overall = clampScore((parsing + architecture + instability) / 3);

  return { parsing, architecture, instability, overall };
}

function buildFallbackIntelligence(
  reason: string,
  input: ParserInput,
  options: ParserOptions,
): RepositoryIntelligenceParseResult {
  const normalized = normalizeInput(input);
  const files: ParserFile[] = [
    {
      path: "mock://ghost-trace/auth/sessionValidator.ts",
      language: "typescript",
      sizeBytes: 1320,
      content:
        "export function validateSession(token: string) { return verifyJwt(token); }\nexport function replayValidateSession(token: string) { return legacyVerify(token); }",
    },
    {
      path: "mock://ghost-trace/workers/billingRetry.ts",
      language: "typescript",
      sizeBytes: 980,
      content:
        "export async function retryBillingEvent(event) { await queue.add('billing', event); }",
    },
    {
      path: "mock://ghost-trace/package.json",
      language: "json",
      sizeBytes: 220,
      content:
        '{"dependencies":{"next":"16.2.9","react":"19.2.4","jsonwebtoken":"latest","jose":"^5.0.0","bullmq":"^5.0.0","pg":"^8.0.0"}}',
    },
  ];
  const dependencies = extractDependencies(files);
  const frameworks = ["Next.js", "React", "PostgreSQL"];
  const services = detectServices(files, buildCorpus(files));
  const suspiciousPatterns = [
    "Fallback parser activated; repository evidence was invalid or unavailable.",
    "Duplicated auth logic suspected across live and replay validation paths.",
    "Retry inconsistency risk detected in billing worker replay flow.",
  ];
  const dependencySignals = detectDependencySignals(dependencies, files);
  const instabilitySignals = [
    "Authentication fragmentation inferred from fallback evidence.",
    "Queue replay may amplify billing failures under load.",
    ...dependencySignals,
  ];
  const architecture = analyzeArchitecture(files, services, frameworks, buildCorpus(files));

  return {
    sourceType: normalized.sourceType === "unknown" ? "mock-structure" : normalized.sourceType,
    repositoryUrl: normalized.repositoryUrl,
    fileCount: files.length,
    files,
    sampledPaths: files.map((file) => file.path),
    codeExcerpt: buildCodeExcerpt(files),
    fileMap: buildFileMap(files),
    frameworks,
    detectedFrameworks: frameworks,
    dependencies: uniqueStrings(dependencies.map((dependency) => dependency.name)),
    dependencyMap: dependencies,
    dependencySignals,
    architecture,
    services,
    detectedServices: services.map((service) => service.name),
    duplicatedModules: ["sessionValidator: live auth and replay auth share competing authority"],
    suspiciousPatterns,
    instabilitySignals,
    architectureDrift: [
      "Fallback intelligence indicates recovery logic may be crossing service ownership boundaries.",
    ],
    securitySignals: [
      "Dual auth dependencies indicate possible identity authority split.",
    ],
    scalingSignals: [
      "Billing retry worker suggests replay pressure can become a scaling bottleneck.",
    ],
    repoSummary: `Fallback forensic parser generated cinematic repository intelligence because primary parsing failed: ${reason}`,
    confidence: {
      parsing: options.allowFallback === false ? 0 : 62,
      architecture: 68,
      instability: 82,
      overall: 71,
    },
    metadata: {
      parsedAt: new Date().toISOString(),
      parserMode: "fallback",
      contentFingerprint: fingerprint(`${reason}:${normalized.repositoryUrl ?? ""}`),
      totalBytes: files.reduce((sum, file) => sum + (file.sizeBytes ?? 0), 0),
      analyzedBytes: files.reduce((sum, file) => sum + byteLength(file.content), 0),
      ignoredFiles: 0,
      maxFiles: options.maxFiles ?? DEFAULT_MAX_FILES,
    },
  };
}

type NormalizedParserInput = {
  sourceType: SourceType;
  repositoryUrl?: string;
  rootPath?: string;
  rawCode: string;
  files: Array<AnalyzeFileInput | FileCandidate>;
  structure?: unknown;
};

function normalizeInput(input: ParserInput): NormalizedParserInput {
  if (typeof input === "string") {
    return {
      sourceType: "unknown",
      rootPath: input,
      rawCode: "",
      files: [],
    };
  }

  const repositoryUrl = input.repositoryUrl ?? input.repoUrl ?? input.url;
  const rawCode = input.codeContent ?? input.uploadedCode ?? input.content ?? "";
  const structure = input.mockProjectStructure ?? input.projectStructure ?? input.fileTree;
  const rootPath = input.rootPath ?? input.extractedPath ?? input.localPath;
  const files = input.files ?? [];

  return {
    sourceType: determineSourceType({ repositoryUrl, rawCode, structure, rootPath, files }),
    repositoryUrl,
    rootPath,
    rawCode,
    files,
    structure,
  };
}

function determineSourceType(input: {
  repositoryUrl?: string;
  rawCode: string;
  structure: unknown;
  rootPath?: string;
  files: unknown[];
}): SourceType {
  if (input.repositoryUrl) {
    return "repository-url";
  }

  if (input.rawCode.trim() || input.files.length > 0 || input.rootPath) {
    return "uploaded-code";
  }

  if (input.structure !== undefined) {
    return "mock-structure";
  }

  return "unknown";
}

function inferArchitectureStyle(input: {
  frontendDetected: boolean;
  backendDetected: boolean;
  services: ParserService[];
  paths: string[];
}): ParserArchitectureIntelligence["style"] {
  if (input.services.length >= 7 || input.paths.some((filePath) => filePath.startsWith("services/"))) {
    return "microservices";
  }

  if (input.frontendDetected && input.backendDetected) {
    return "fullstack";
  }

  if (input.services.length >= 4) {
    return "modular-monolith";
  }

  if (input.paths.length > 0) {
    return "monolith";
  }

  return "unknown";
}

function inferOwnershipConcerns(input: {
  authSystems: string[];
  apiLayers: string[];
  sharedModules: string[];
  databaseServices: string[];
  corpus: string;
}) {
  const concerns: string[] = [];

  if (input.authSystems.length >= 4) {
    concerns.push("Authentication ownership appears distributed across multiple modules.");
  }

  if (input.sharedModules.length > input.apiLayers.length && input.apiLayers.length > 0) {
    concerns.push("Shared modules may be absorbing domain logic from API boundaries.");
  }

  if (input.databaseServices.length >= 3 && input.apiLayers.length >= 3) {
    concerns.push("Data access appears from several API or service surfaces; write ownership should be reviewed.");
  }

  if (containsAny(input.corpus, ["fallback", "legacy", "compat"])) {
    concerns.push("Legacy or fallback paths detected, increasing architecture drift risk.");
  }

  return concerns;
}

function isSuspiciousDependency(name: string, version: string) {
  const normalizedName = name.toLowerCase();
  const normalizedVersion = version.toLowerCase();

  return (
    containsAny(normalizedVersion, ["*", "latest", "alpha", "beta", "rc", "snapshot"]) ||
    containsAny(normalizedName, ["jsonwebtoken", "request", "node-sass", "left-pad"]) ||
    normalizedVersion === "unbounded"
  );
}

function suspiciousDependencyReason(name: string, version: string) {
  const normalizedVersion = version.toLowerCase();

  if (containsAny(normalizedVersion, ["*", "latest", "unbounded"])) {
    return `${name} uses an unbounded or floating version (${version}).`;
  }

  if (containsAny(normalizedVersion, ["alpha", "beta", "rc", "snapshot"])) {
    return `${name} uses prerelease dependency version ${version}.`;
  }

  if (name.toLowerCase() === "jsonwebtoken") {
    return "jsonwebtoken detected; verify parity with edge/runtime auth libraries.";
  }

  if (["request", "node-sass", "left-pad"].includes(name.toLowerCase())) {
    return `${name} is historically fragile or deprecated in modern stacks.`;
  }

  return undefined;
}

function knownPythonDependency(name: string) {
  return [
    "flask",
    "django",
    "fastapi",
    "uvicorn",
    "sqlalchemy",
    "psycopg2",
    "pymongo",
    "celery",
    "redis",
  ].includes(name.toLowerCase());
}

function shouldAnalyzeFile(filePath: string) {
  const normalized = normalizePath(filePath);
  const parts = normalized.split("/");

  if (parts.some((part) => IGNORED_DIRS.has(part))) {
    return false;
  }

  const extension = path.posix.extname(normalized).toLowerCase();
  const basename = path.posix.basename(normalized).toLowerCase();

  return (
    TEXT_EXTENSIONS.has(extension) ||
    [
      "package.json",
      "requirements.txt",
      "dockerfile",
      "makefile",
      "pom.xml",
      "build.gradle",
      "build.gradle.kts",
      "next.config.js",
      "next.config.mjs",
      "next.config.ts",
      "tsconfig.json",
    ].includes(basename)
  );
}

function inferLanguage(filePath: string) {
  const extension = path.posix.extname(filePath).toLowerCase();

  const languages: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".py": "python",
    ".java": "java",
    ".kt": "kotlin",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".rb": "ruby",
    ".cs": "csharp",
    ".json": "json",
    ".md": "markdown",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".toml": "toml",
    ".xml": "xml",
    ".sql": "sql",
    ".prisma": "prisma",
  };

  return languages[extension] ?? "text";
}

function filePriority(file: ParserFile) {
  const normalized = file.path.toLowerCase();
  let score = 0;

  if (containsAny(normalized, ["package.json", "requirements.txt", "pyproject.toml", "pom.xml"])) {
    score += 9;
  }

  if (containsAny(normalized, ["auth", "api", "route", "worker", "queue", "schema", "validator"])) {
    score += 6;
  }

  if (containsAny(normalized, ["config", "middleware", "service", "controller"])) {
    score += 3;
  }

  return score;
}

function resolveImportPath(filePath: string, specifier: string, knownFiles: Set<string>) {
  const baseDirectory = path.posix.dirname(filePath);
  const normalized = stripExtension(normalizePath(path.posix.normalize(path.posix.join(baseDirectory, specifier))));

  if (knownFiles.has(normalized)) {
    return normalized;
  }

  const indexPath = `${normalized}/index`;

  if (knownFiles.has(indexPath)) {
    return indexPath;
  }

  return undefined;
}

function stripExtension(filePath: string) {
  return filePath.replace(/\.(ts|tsx|js|jsx|mjs|cjs|py|java|go|rs)$/, "");
}

function lineCount(content: string) {
  return content.length === 0 ? 0 : content.split(/\r?\n/).length;
}

function byteLength(content: string) {
  return Buffer.byteLength(content, "utf8");
}

function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function containsAny(value: string, needles: string[]) {
  const normalized = value.toLowerCase();
  return needles.some((needle) => normalized.includes(needle.toLowerCase()));
}

function uniqueStrings(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();

    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }

  return result;
}

function humanList(values: string[]) {
  if (values.length === 0) {
    return "unknown";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function clampScore(value: number): ConfidenceScore {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readString(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate
    : undefined;
}

function readNumber(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const parser = {
  parseRepository,
  parse,
  extractRepositoryIntelligence,
};

export default parser;

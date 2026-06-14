"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  CloudUpload,
  Cpu,
  FileArchive,
  GitBranch,
  HardDriveUpload,
  Loader2,
  LockKeyhole,
  Radar,
  Radio,
  ScanLine,
  ShieldCheck,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type InvestigationSource = "github" | "zip" | "manual" | "hybrid";

export interface InvestigationPayload {
  githubUrl: string;
  file: File | null;
  source: InvestigationSource;
}

export interface UploadPanelProps {
  className?: string;
  onLaunch?: (payload: InvestigationPayload) => void;
}

type ActionState = "idle" | "scanning" | "agents" | "launching";

type StatusItem = {
  label: string;
  detail: string;
  icon: LucideIcon;
  tone: "cyan" | "violet" | "emerald" | "orange";
};

const statusItems: StatusItem[] = [
  {
    label: "AI agents online",
    detail: "5 forensic models synchronized",
    icon: Bot,
    tone: "cyan",
  },
  {
    label: "Forensic engine ready",
    detail: "collapse replay matrix armed",
    icon: Cpu,
    tone: "violet",
  },
  {
    label: "Threat analysis initialized",
    detail: "dependency, auth, scale vectors primed",
    icon: ShieldCheck,
    tone: "emerald",
  },
];

const toneStyles = {
  cyan: {
    text: "text-cyan-300",
    border: "border-cyan-300/25",
    bg: "bg-cyan-300/10",
    glow: "rgba(34,211,238,0.72)",
    soft: "rgba(34,211,238,0.14)",
  },
  violet: {
    text: "text-violet-300",
    border: "border-violet-300/25",
    bg: "bg-violet-300/10",
    glow: "rgba(139,92,246,0.72)",
    soft: "rgba(139,92,246,0.14)",
  },
  emerald: {
    text: "text-emerald-300",
    border: "border-emerald-300/25",
    bg: "bg-emerald-300/10",
    glow: "rgba(52,211,153,0.72)",
    soft: "rgba(52,211,153,0.14)",
  },
  orange: {
    text: "text-orange-300",
    border: "border-orange-300/25",
    bg: "bg-orange-300/10",
    glow: "rgba(249,115,22,0.72)",
    soft: "rgba(249,115,22,0.14)",
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.64, ease: [0.22, 1, 0.36, 1] },
  },
};

const particlePositions = [
  ["8%", "18%"],
  ["17%", "72%"],
  ["25%", "36%"],
  ["39%", "84%"],
  ["51%", "22%"],
  ["64%", "58%"],
  ["76%", "12%"],
  ["83%", "78%"],
  ["92%", "42%"],
  ["33%", "8%"],
  ["58%", "92%"],
  ["5%", "88%"],
];

function inferSource(githubUrl: string, file: File | null): InvestigationSource {
  if (githubUrl.trim() && file) {
    return "hybrid";
  }

  if (githubUrl.trim()) {
    return "github";
  }

  if (file) {
    return "zip";
  }

  return "manual";
}

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function UploadPanel({ className = "", onLaunch }: UploadPanelProps) {
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const source = useMemo(
    () => inferSource(githubUrl, selectedFile),
    [githubUrl, selectedFile],
  );

  const readiness = useMemo(() => {
    if (githubUrl.trim() && selectedFile) {
      return "Dual evidence channels linked";
    }

    if (githubUrl.trim()) {
      return "Repository URL staged for scan";
    }

    if (selectedFile) {
      return "Evidence package sealed";
    }

    return "AI forensic scan ready";
  }, [githubUrl, selectedFile]);

  const isActive = Boolean(githubUrl.trim() || selectedFile || actionState !== "idle");

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function ingestFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setActionState("scanning");
    window.setTimeout(() => setActionState("idle"), 1200);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    ingestFile(event.dataTransfer.files.item(0) ?? undefined);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  }

  function triggerAction(nextState: ActionState) {
    setActionState(nextState);
    window.setTimeout(() => setActionState("idle"), nextState === "launching" ? 1800 : 1200);
  }

  function launchInvestigation() {
    const payload = {
      githubUrl: githubUrl.trim(),
      file: selectedFile,
      source,
    };

    triggerAction("launching");
    onLaunch?.(payload);
  }

  return (
    <motion.section
      className={`relative isolate overflow-hidden rounded-lg border border-cyan-300/18 bg-[#050816]/88 p-4 text-slate-100 shadow-[0_40px_160px_rgba(0,0,0,0.62)] backdrop-blur-2xl sm:p-6 lg:p-8 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <PanelBackground active={isActive || isDragging} />

      <div className="relative mx-auto max-w-6xl">
        <motion.header
          variants={itemVariants}
          className="mb-7 flex flex-col gap-5 border-b border-cyan-300/12 pb-6 lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
              <motion.span
                className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.95)]"
                animate={{ scale: [1, 1.8, 1], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              Live AI system status
            </div>
            <h2 className="text-3xl font-black uppercase leading-tight tracking-normal text-slate-50 sm:text-4xl lg:text-5xl">
              Initiate forensic investigation
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Upload repository evidence, paste a GitHub target, and activate the
              Ghost Trace intelligence mesh to reconstruct software collapse.
            </p>
          </div>

          <motion.div
            className="min-w-64 rounded-lg border border-slate-400/15 bg-slate-950/58 p-4 backdrop-blur-xl"
            animate={{
              boxShadow: [
                "0 0 22px rgba(34,211,238,0.1)",
                "0 0 46px rgba(34,211,238,0.2)",
                "0 0 22px rgba(34,211,238,0.1)",
              ],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">
                Mission state
              </p>
              <Radio className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <motion.div
                className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10"
                animate={{ rotate: [0, 4, -4, 0] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Radar className="h-5 w-5 text-cyan-300" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-slate-50">{readiness}</p>
                <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/75">
                  TRACE_SESSION_ARMED
                </p>
              </div>
            </div>
          </motion.div>
        </motion.header>

        <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
          <motion.div variants={itemVariants} className="space-y-5">
            <div
              className={`group relative min-h-80 overflow-hidden rounded-lg border bg-slate-950/62 p-5 shadow-[0_30px_110px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-colors duration-300 sm:p-7 ${
                isDragging
                  ? "border-cyan-200/70 bg-cyan-300/10"
                  : "border-cyan-300/18 hover:border-cyan-300/45"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <UploadZoneEffects active={isDragging || Boolean(selectedFile)} />

              <div className="relative flex min-h-72 flex-col items-center justify-center text-center">
                <motion.div
                  className="relative mb-7 grid h-28 w-28 place-items-center rounded-full border border-cyan-300/25 bg-[#050816]/76 shadow-[0_0_80px_rgba(34,211,238,0.18)]"
                  animate={{
                    y: [0, -8, 0],
                    boxShadow: [
                      "0 0 44px rgba(34,211,238,0.16)",
                      "0 0 86px rgba(139,92,246,0.24)",
                      "0 0 44px rgba(34,211,238,0.16)",
                    ],
                  }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full border border-cyan-300/25"
                    animate={{ scale: [1, 1.32, 1], opacity: [0.65, 0, 0.65] }}
                    transition={{ duration: 2.1, repeat: Infinity }}
                  />
                  {selectedFile ? (
                    <FileArchive className="h-11 w-11 text-emerald-300" />
                  ) : (
                    <CloudUpload className="h-12 w-12 text-cyan-300" />
                  )}
                </motion.div>

                <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-200">
                  Drop repository intelligence package
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-normal text-slate-50 sm:text-3xl">
                  Upload software evidence
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Drag a zip archive into the scanner, or manually select a project
                  package for AI forensic ingestion.
                </p>

                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
                  <CinematicButton
                    icon={HardDriveUpload}
                    label="Manual Project Upload"
                    onClick={openFilePicker}
                    tone="cyan"
                  />
                  <div className="inline-flex items-center gap-2 rounded-md border border-slate-500/15 bg-slate-900/70 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                    <LockKeyhole className="h-3.5 w-3.5 text-cyan-300" />
                    Zip evidence only
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  className="sr-only"
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={(event) => ingestFile(event.target.files?.item(0) ?? undefined)}
                />

                {selectedFile ? (
                  <motion.div
                    className="mt-7 w-full max-w-lg rounded-lg border border-emerald-300/25 bg-emerald-300/8 p-4 text-left"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-50">
                          {selectedFile.name}
                        </p>
                        <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-emerald-200/75">
                          {formatBytes(selectedFile.size)} secured for forensic scan
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>

            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-lg border border-violet-300/18 bg-slate-950/62 p-4 backdrop-blur-2xl sm:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />
              <label
                htmlFor="ghost-trace-github-url"
                className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-violet-200"
              >
                <GitBranch className="h-4 w-4" />
                GitHub repository URL
              </label>
              <div className="relative">
                <Terminal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-300" />
                <input
                  id="ghost-trace-github-url"
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                  placeholder="https://github.com/company/project"
                  className="h-14 w-full rounded-md border border-slate-500/18 bg-[#050816]/78 pl-12 pr-4 font-mono text-sm text-slate-100 shadow-[inset_0_0_24px_rgba(34,211,238,0.06)] outline-none transition duration-200 placeholder:text-slate-600 focus:border-cyan-300/60 focus:shadow-[0_0_36px_rgba(34,211,238,0.18),inset_0_0_24px_rgba(34,211,238,0.08)]"
                />
                <motion.span
                  className="pointer-events-none absolute bottom-0 left-12 h-px w-24 bg-gradient-to-r from-cyan-300 to-transparent"
                  animate={{ opacity: [0.15, 0.95, 0.15], x: [0, 120, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.aside variants={itemVariants} className="space-y-5">
            <div className="relative overflow-hidden rounded-lg border border-cyan-300/18 bg-slate-950/62 p-5 shadow-[0_26px_100px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/12 blur-3xl" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">
                      Live AI status
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-50">
                      Intelligence mesh active
                    </h3>
                  </div>
                  <motion.div
                    className="grid h-11 w-11 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <Activity className="h-5 w-5 text-cyan-300" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  {statusItems.map((status, index) => (
                    <StatusRow key={status.label} status={status} index={index} />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-slate-400/15 bg-slate-950/62 p-5 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.16),transparent_42%)]" />
              <div className="relative">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">
                  Action protocol
                </p>
                <div className="mt-5 grid gap-3">
                  <CinematicButton
                    icon={Zap}
                    label="Launch Investigation"
                    onClick={launchInvestigation}
                    tone="primary"
                    loading={actionState === "launching"}
                  />
                  <CinematicButton
                    icon={ScanLine}
                    label="Scan Repository"
                    onClick={() => triggerAction("scanning")}
                    tone="violet"
                    loading={actionState === "scanning"}
                  />
                  <CinematicButton
                    icon={Bot}
                    label="Initialize AI Agents"
                    onClick={() => triggerAction("agents")}
                    tone="cyan"
                    loading={actionState === "agents"}
                  />
                </div>
              </div>
            </div>

            <motion.div
              className="relative overflow-hidden rounded-lg border border-orange-300/20 bg-orange-300/8 p-4 backdrop-blur-xl"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(249,115,22,0)",
                  "0 0 32px rgba(249,115,22,0.16)",
                  "0 0 0 rgba(249,115,22,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Evidence chain will be reconstructed
                  </p>
                  <p className="mt-1 text-xs leading-6 text-orange-100/70">
                    Authentication drift, validation gaps, dependency pressure,
                    architecture decay, and scaling risk are queued for analysis.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.aside>
        </div>
      </div>
    </motion.section>
  );
}

function PanelBackground({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_88%_26%,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_12%_82%,rgba(59,130,246,0.13),transparent_32%)]" />
      <motion.div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.12) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "58px 58px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -left-1/4 top-0 h-28 w-[150%] bg-gradient-to-b from-cyan-300/12 via-cyan-300/5 to-transparent blur-sm"
        animate={{ y: ["-25%", "860%", "-25%"], opacity: active ? [0.12, 0.36, 0.12] : [0.06, 0.18, 0.06] }}
        transition={{ duration: 8.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 0, transparent 6px, rgba(248,250,252,0.42) 7px)",
          backgroundSize: "100% 8px",
        }}
      />
      {particlePositions.map(([left, top], index) => (
        <motion.span
          key={`${left}-${top}`}
          className="absolute h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.95)]"
          style={{ left, top }}
          animate={{
            x: [0, index % 2 ? 20 : -20, 0],
            y: [0, -24, 0],
            opacity: active ? [0.2, 0.95, 0.2] : [0.1, 0.48, 0.1],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 4.2 + (index % 5),
            repeat: Infinity,
            delay: index * 0.17,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function UploadZoneEffects({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.14) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "34px 34px"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-300/18 to-transparent blur-sm"
        animate={{ y: ["-40%", "430%", "-40%"], opacity: active ? [0.16, 0.52, 0.16] : [0.08, 0.24, 0.08] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20"
        animate={{ rotate: 360, scale: active ? [1, 1.05, 1] : [0.96, 1, 0.96] }}
        transition={{ rotate: { duration: 9, repeat: Infinity, ease: "linear" }, scale: { duration: 2.8, repeat: Infinity } }}
      >
        <div className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-gradient-to-b from-cyan-200/70 to-transparent" />
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: active
            ? [
                "inset 0 0 30px rgba(34,211,238,0.12)",
                "inset 0 0 70px rgba(34,211,238,0.22)",
                "inset 0 0 30px rgba(34,211,238,0.12)",
              ]
            : [
                "inset 0 0 18px rgba(34,211,238,0.08)",
                "inset 0 0 36px rgba(139,92,246,0.1)",
                "inset 0 0 18px rgba(34,211,238,0.08)",
              ],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function StatusRow({ status, index }: { status: StatusItem; index: number }) {
  const Icon = status.icon;
  const style = toneStyles[status.tone];

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border ${style.border} ${style.bg} p-4`}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.35 + index * 0.1, ease: "easeOut" }}
    >
      <div className="relative flex items-center gap-3">
        <motion.div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border ${style.border} bg-slate-950/72`}
          animate={{
            boxShadow: [
              `0 0 12px ${style.soft}`,
              `0 0 28px ${style.glow}`,
              `0 0 12px ${style.soft}`,
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.16 }}
        >
          <Icon className={`h-5 w-5 ${style.text}`} />
        </motion.div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-50">{status.label}</p>
          <p className="mt-1 truncate font-mono text-[0.68rem] uppercase tracking-[0.12em] text-slate-400">
            {status.detail}
          </p>
        </div>
        <motion.div
          className={`ml-auto h-2.5 w-2.5 shrink-0 rounded-full ${style.bg}`}
          animate={{ scale: [1, 1.7, 1], opacity: [0.54, 1, 0.54] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: index * 0.2 }}
        >
          <CircleDot className={`h-2.5 w-2.5 ${style.text}`} />
        </motion.div>
      </div>
    </motion.div>
  );
}

function CinematicButton({
  icon: Icon,
  label,
  onClick,
  tone,
  loading = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone: "primary" | "cyan" | "violet";
  loading?: boolean;
}) {
  const toneClass =
    tone === "primary"
      ? "border-cyan-300/40 bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-500 text-[#050816] shadow-[0_0_38px_rgba(34,211,238,0.24)]"
      : tone === "violet"
        ? "border-violet-300/35 bg-violet-300/10 text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.16)]"
        : "border-cyan-300/35 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.16)]";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex min-h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-md border px-4 text-sm font-black uppercase tracking-[0.16em] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:w-auto ${toneClass}`}
      whileHover={{ y: -3, scale: 1.012 }}
      whileTap={{ scale: 0.985 }}
    >
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/28 to-transparent"
        animate={{ x: ["-120%", "120%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {loading ? (
        <Loader2 className="relative h-4 w-4 animate-spin" />
      ) : (
        <Icon className="relative h-4 w-4" />
      )}
      <span className="relative">{label}</span>
      <ChevronRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </motion.button>
  );
}

export default UploadPanel;

"use client";

import { AgentCard } from "@/components/AgentCard";
import { RiskMeter } from "@/components/RiskMeter";
import { Timeline, type TimelineEvent as UiTimelineEvent } from "@/components/Timeline";
import {
  UploadPanel,
  type InvestigationPayload,
} from "@/components/UploadPanel";
import { VerdictPanel } from "@/components/VerdictPanel";
import { useInvestigation, type InvestigationControllerData } from "@/hooks/useInvestigation";
import { mockAnalyzeResponse } from "@/lib/mockData";
import type {
  AgentData,
  ArchitectureNode,
  ArchitectureReport,
  PredictedFailure,
  RiskMetric,
  RiskSeverity,
  TimelineEvent,
} from "@/types";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CircuitBoard,
  DatabaseZap,
  GitBranch,
  Loader2,
  Network,
  Radio,
  Radar,
  ShieldAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";

const fallbackData: InvestigationControllerData = {
  ...mockAnalyzeResponse,
  raw: mockAnalyzeResponse,
  usedFallback: true,
  generatedAt: "2026-06-14T10:34:12.000Z",
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const investigation = useInvestigation();
  const activeData = investigation.data ?? fallbackData;
  const architecture = activeData.architectureReport;
  const metrics = buildRiskMeters(activeData);
  const timeline = activeData.timeline.map(toUiTimelineEvent);
  const verdict = activeData.verdict;

  function handleLaunch(payload: InvestigationPayload) {
    void investigation.startInvestigation({
      githubUrl: payload.githubUrl,
      file: payload.file,
      metadata: {
        source: payload.source,
        launchedFrom: "ghost-trace-upload-panel",
      },
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <HeroStatus
        loading={investigation.loading}
        progress={investigation.progress}
        phase={investigation.phase}
        status={investigation.status}
        usedFallback={activeData.usedFallback}
      />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-10">
        <UploadPanel onLaunch={handleLaunch} />
        <InvestigationProgress
          loading={investigation.loading}
          progress={investigation.progress}
          phase={investigation.phase}
          error={investigation.error}
        />
      </section>

      <motion.section
        className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-10"
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
      >
        {metrics.map((metric) => (
          <RiskMeter
            key={metric.id}
            score={metric.value}
            label={metric.label}
            severity={metric.severity}
          />
        ))}
      </motion.section>

      <WarRoomSection
        agents={activeData.agents}
        loading={investigation.loading}
        requestId={activeData.requestId ?? "mock-investigation"}
      />

      <ArchitectureSection architecture={architecture} />

      <Timeline events={timeline} />

      <FailureProjectionSection failures={activeData.predictedFailures} />

      <VerdictPanel
        verdict={verdict.verdict}
        rootCause={verdict.rootCause}
        risks={verdict.detectedRisks}
        predictedFailures={verdict.predictedFailures.map(
          (failure) => `${failure.title}: ${failure.description}`,
        )}
        severity={verdict.severity}
      />
    </main>
  );
}

function HeroStatus({
  loading,
  progress,
  phase,
  status,
  usedFallback,
}: {
  loading: boolean;
  progress: number;
  phase: string;
  status: string;
  usedFallback: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_8%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_80%_34%,rgba(139,92,246,0.16),transparent_28%),radial-gradient(circle_at_12%_64%,rgba(248,113,113,0.1),transparent_26%)]" />
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.16) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "72px 72px"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      <div className="mx-auto grid max-w-7xl gap-8 border-b border-cyan-300/15 pb-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">
            <motion.span
              className="h-2 w-2 bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]"
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.45, repeat: Infinity }}
            />
            AI forensic intelligence platform
          </div>
          <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-none tracking-normal text-white sm:text-7xl lg:text-8xl">
            Ghost Trace
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            A cinematic multi-agent war room that ingests repository evidence,
            reconstructs engineering collapse, predicts failure cascades, and
            seals an AI forensic verdict.
          </p>
        </motion.div>

        <motion.aside
          className="relative overflow-hidden border border-cyan-300/20 bg-slate-950/68 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.54)] backdrop-blur-2xl"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">
                  command core
                </p>
                <p className="mt-2 font-mono text-sm font-black uppercase text-cyan-200">
                  {status.replaceAll("_", " ")}
                </p>
              </div>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
              ) : (
                <Radio className="h-5 w-5 text-cyan-300" />
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
                <span>{phase.replaceAll("_", " ")}</span>
                <span className="text-cyan-200">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden bg-slate-900">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <HeroTile icon={Radar} label="scan" value={loading ? "LIVE" : "READY"} />
              <HeroTile icon={BrainCircuit} label="agents" value="05" />
              <HeroTile icon={ShieldAlert} label="fallback" value={usedFallback ? "ARMED" : "OFF"} />
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function HeroTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-slate-950/60 p-3">
      <Icon className="h-4 w-4 text-cyan-300" />
      <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs font-bold text-white">{value}</p>
    </div>
  );
}

function InvestigationProgress({
  loading,
  progress,
  phase,
  error,
}: {
  loading: boolean;
  progress: number;
  phase: string;
  error: string | null;
}) {
  return (
    <AnimatePresence>
      {(loading || error) && (
        <motion.div
          className="mt-5 overflow-hidden border border-cyan-300/18 bg-slate-950/72 p-4 backdrop-blur-xl"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              )}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200">
                  {phase.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {error ?? "AI agents are reconstructing the collapse timeline."}
                </p>
              </div>
            </div>
            <p className="font-mono text-sm font-bold text-white">{Math.round(progress)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WarRoomSection({
  agents,
  loading,
  requestId,
}: {
  agents: AgentData[];
  loading: boolean;
  requestId: string;
}) {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <SectionHeader
        eyebrow="LIVE AI WAR ROOM"
        title="Agents debating repository evidence"
        description="Each specialist receives the same reconstructed intelligence and surfaces a competing slice of the collapse story."
        meta={requestId}
      />

      <motion.div
        className="mt-7 grid gap-5 lg:grid-cols-5"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
      >
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            role={agent.displayName}
            message={agent.message}
            confidence={agent.confidence}
            status={toAgentCardStatus(agent, loading)}
            evidence={agent.evidence.map((item) => item.label)}
          />
        ))}
      </motion.div>
    </section>
  );
}

function ArchitectureSection({ architecture }: { architecture: ArchitectureReport }) {
  const nodes = architecture.nodes.length > 0 ? architecture.nodes : fallbackArchitectureNodes(architecture);

  return (
    <motion.section
      className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
    >
      <SectionHeader
        eyebrow="ARCHITECTURE INTELLIGENCE"
        title="Service topology reconstructed"
        description={architecture.summary ?? "GHOST TRACE mapped system boundaries, dependency pressure, duplicated modules, and drift corridors."}
        meta={`${architecture.detectedServices.length} services`}
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="relative min-h-[440px] overflow-hidden border border-cyan-300/18 bg-slate-950/64 p-5 shadow-[0_30px_130px_rgba(0,0,0,0.52)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="relative h-full min-h-[398px]">
            {nodes.slice(0, 8).map((node, index) => (
              <ArchitectureNodeChip
                key={node.id}
                node={node}
                index={index}
                total={Math.min(nodes.length, 8)}
              />
            ))}
            <motion.div
              className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_70px_rgba(34,211,238,0.2)]"
              animate={{ rotate: 360, scale: [1, 1.04, 1] }}
              transition={{
                rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity },
              }}
            >
              <CircuitBoard className="h-9 w-9" />
            </motion.div>
          </div>
        </div>

        <div className="grid gap-5">
          <SignalPanel
            icon={Network}
            title="Detected services"
            items={architecture.detectedServices}
          />
          <SignalPanel
            icon={GitBranch}
            title="Architecture drift"
            items={architecture.architectureDrift}
          />
          <SignalPanel
            icon={DatabaseZap}
            title="Dependency concerns"
            items={architecture.dependencyConcerns ?? architecture.dependencies}
          />
        </div>
      </div>
    </motion.section>
  );
}

function ArchitectureNodeChip({
  node,
  index,
  total,
}: {
  node: ArchitectureNode;
  index: number;
  total: number;
}) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 38;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  const severity = normalizeSeverity(node.severity);

  return (
    <motion.div
      className={`absolute min-w-32 border bg-slate-950/82 px-3 py-3 text-left shadow-[0_18px_70px_rgba(0,0,0,0.46)] ${severityBorder(severity)}`}
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.08 },
        scale: { duration: 0.4, delay: index * 0.08 },
        y: { duration: 4 + index * 0.2, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">
        {node.type}
      </p>
      <p className="mt-1 text-sm font-black uppercase text-white">{node.name}</p>
      <p className="mt-1 font-mono text-[0.68rem] text-cyan-200">
        {node.healthScore ?? 72}% integrity
      </p>
    </motion.div>
  );
}

function SignalPanel({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) {
  const normalized = items.length > 0 ? items.slice(0, 5) : ["No confirmed signal yet"];

  return (
    <div className="border border-white/10 bg-slate-950/64 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-cyan-300" />
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
          {title}
        </h3>
      </div>
      <div className="mt-4 space-y-2">
        {normalized.map((item) => (
          <div key={item} className="flex gap-3 border border-white/8 bg-slate-950/70 px-3 py-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-cyan-300" />
            <p className="text-xs leading-5 text-slate-300">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FailureProjectionSection({ failures }: { failures: PredictedFailure[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <SectionHeader
        eyebrow="FAILURE PREDICTION ENGINE"
        title="Future collapse vectors projected"
        description="The risk model converts current forensic evidence into likely future breakpoints."
        meta={`${failures.length} projections`}
      />

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {failures.map((failure, index) => {
          const severity = normalizeSeverity(failure.severity);

          return (
            <motion.article
              key={failure.id}
              className={`relative overflow-hidden border bg-slate-950/70 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.48)] backdrop-blur-2xl ${severityBorder(severity)}`}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(248,250,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.035)_1px,transparent_1px)] bg-[size:28px_28px] opacity-55" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-slate-500">
                      {severity} projection
                    </p>
                    <h3 className="mt-2 text-xl font-black uppercase text-white">
                      {failure.title}
                    </h3>
                  </div>
                  <Zap className={severityText(severity)} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{failure.description}</p>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                    <span>probability</span>
                    <span className={severityText(severity)}>{failure.probability}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-300 via-orange-400 to-red-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${failure.probability}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: index * 0.08 }}
                    />
                  </div>
                </div>
                {failure.trigger ? (
                  <p className="mt-4 border-l border-cyan-300/30 pl-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-slate-400">
                    trigger: {failure.trigger}
                  </p>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-y border-cyan-300/15 py-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase leading-none text-white sm:text-5xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
          {description}
        </p>
      </div>
      <div className="inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-cyan-200">
        <Activity className="h-4 w-4" />
        {meta}
      </div>
    </div>
  );
}

function buildRiskMeters(data: InvestigationControllerData): RiskMetric[] {
  const metrics = data.riskMetrics.metrics.length > 0 ? data.riskMetrics.metrics : [];
  const required: RiskMetric[] = [
    {
      id: "risk-overall",
      key: "risk_score",
      label: "Risk Score",
      value: data.riskMetrics.riskScore,
      severity: data.riskMetrics.severity,
    },
    {
      id: "risk-stability",
      key: "stability_score",
      label: "Stability Index",
      value: data.riskMetrics.stabilityScore,
      severity: scoreToSeverity(100 - data.riskMetrics.stabilityScore),
    },
    {
      id: "risk-integrity",
      key: "integrity_score",
      label: "Architecture Integrity",
      value: data.riskMetrics.integrityScore,
      severity: scoreToSeverity(100 - data.riskMetrics.integrityScore),
    },
    {
      id: "risk-failure",
      key: "projected_failure_rate",
      label: "Failure Probability",
      value: data.riskMetrics.projectedFailureRate,
      severity: scoreToSeverity(data.riskMetrics.projectedFailureRate),
    },
  ];

  return required.map(
    (fallback) => metrics.find((metric) => metric.key === fallback.key) ?? fallback,
  );
}

function toUiTimelineEvent(event: TimelineEvent): UiTimelineEvent {
  return {
    timestamp: event.timestamp,
    title: event.title,
    severity: normalizeSeverity(event.severity),
    description: event.description,
  };
}

function toAgentCardStatus(
  agent: AgentData,
  loading: boolean,
): "active" | "analyzing" | "warning" {
  if (agent.status === "warning" || agent.status === "escalating" || agent.status === "disputing") {
    return "warning";
  }

  if (loading || agent.status === "analyzing") {
    return "analyzing";
  }

  return "active";
}

function fallbackArchitectureNodes(architecture: ArchitectureReport): ArchitectureNode[] {
  return architecture.detectedServices.map((service, index) => ({
    id: `fallback-node-${index + 1}`,
    name: service,
    type: service.toLowerCase().includes("auth")
      ? "auth"
      : service.toLowerCase().includes("api")
        ? "api"
        : service.toLowerCase().includes("queue")
          ? "queue"
          : service.toLowerCase().includes("data")
            ? "database"
            : "service",
    severity: index === 0 ? architectureSeverity(architecture) : "medium",
    healthScore: Math.max(38, 82 - index * 7),
  }));
}

function architectureSeverity(architecture: ArchitectureReport): RiskSeverity {
  if (architecture.suspiciousPatterns.length + architecture.duplicatedModules.length > 5) {
    return "critical";
  }

  if (architecture.architectureDrift.length > 2) {
    return "high";
  }

  return "medium";
}

function normalizeSeverity(severity?: string): RiskSeverity {
  const normalized = severity?.toLowerCase();

  if (normalized === "critical") {
    return "critical";
  }

  if (normalized === "high") {
    return "high";
  }

  if (normalized === "moderate" || normalized === "medium") {
    return "medium";
  }

  return "low";
}

function scoreToSeverity(score: number): RiskSeverity {
  if (score >= 85) {
    return "critical";
  }

  if (score >= 68) {
    return "high";
  }

  if (score >= 42) {
    return "medium";
  }

  return "low";
}

function severityBorder(severity: RiskSeverity) {
  if (severity === "critical") {
    return "border-red-300/42";
  }

  if (severity === "high") {
    return "border-orange-300/38";
  }

  if (severity === "medium") {
    return "border-violet-300/32";
  }

  return "border-cyan-300/26";
}

function severityText(severity: RiskSeverity) {
  if (severity === "critical") {
    return "text-red-300";
  }

  if (severity === "high") {
    return "text-orange-300";
  }

  if (severity === "medium") {
    return "text-violet-300";
  }

  return "text-cyan-300";
}

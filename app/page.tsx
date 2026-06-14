"use client";

import {
  UploadPanel,
  type InvestigationPayload,
} from "@/components/UploadPanel";
import { useInvestigation, type InvestigationControllerData } from "@/hooks/useInvestigation";
import { mockAnalyzeResponse } from "@/lib/mockData";
import type {
  AgentData,
  ForensicVerdict,
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
  Clock3,
  FileWarning,
  Loader2,
  Radio,
  Radar,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

const fallbackData: InvestigationControllerData = {
  ...mockAnalyzeResponse,
  raw: mockAnalyzeResponse,
  usedFallback: true,
  generatedAt: "2026-06-14T10:34:12.000Z",
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const investigation = useInvestigation();
  const activeData = investigation.data ?? fallbackData;
  const metrics = buildRiskMeters(activeData);
  const timeline = activeData.timeline.slice(0, 4);
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

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <UploadPanel onLaunch={handleLaunch} />
        <InvestigationProgress
          loading={investigation.loading}
          progress={investigation.progress}
          phase={investigation.phase}
          error={investigation.error}
        />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {metrics.map((metric) => (
          <CompactRiskCard key={metric.id} metric={metric} />
        ))}
      </section>

      <WarRoomSection
        agents={activeData.agents}
        loading={investigation.loading}
        requestId={activeData.requestId ?? "mock-investigation"}
      />

      <CompactTimelineSection events={timeline} />

      <CompactVerdictSection
        verdict={verdict}
        failures={activeData.predictedFailures.slice(0, 3)}
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
    <section className="relative isolate overflow-hidden px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(139,92,246,0.12),transparent_26%)]" />
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.16) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "72px 72px"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      <div className="mx-auto grid max-w-6xl gap-6 border-b border-cyan-300/15 pb-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-cyan-200">
            <motion.span
              className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.45, repeat: Infinity }}
            />
            Forensic engine online
          </div>
          <h1 className="mt-5 text-4xl font-black uppercase leading-none tracking-normal text-white sm:text-6xl">
            Ghost Trace
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Upload a repository and get a concise AI forensic report: risk,
            agents, timeline, and verdict.
          </p>
        </motion.div>

        <motion.aside
          className="relative overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950/68 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                status
              </p>
              <p className="mt-1 font-mono text-sm font-bold uppercase text-cyan-200">
                {status.replaceAll("_", " ")}
              </p>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            ) : (
              <Radio className="h-5 w-5 text-cyan-300" />
            )}
          </div>

          <div className="mt-4">
            <div className="mb-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
              <span>{phase.replaceAll("_", " ")}</span>
              <span className="text-cyan-200">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-900">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <HeroTile icon={Radar} label="scan" value={loading ? "live" : "ready"} />
            <HeroTile icon={BrainCircuit} label="agents" value="5" />
            <HeroTile icon={ShieldAlert} label="fallback" value={usedFallback ? "on" : "off"} />
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
    <div className="rounded border border-white/10 bg-slate-950/60 p-2">
      <Icon className="h-4 w-4 text-cyan-300" />
      <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="font-mono text-xs font-bold uppercase text-white">{value}</p>
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
          className="mt-4 overflow-hidden rounded-md border border-cyan-300/18 bg-slate-950/72 p-4 backdrop-blur-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {loading ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cyan-300" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
              )}
              <div className="min-w-0">
                <p className="truncate font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
                  {phase.replaceAll("_", " ")}
                </p>
                {error ? (
                  <p className="mt-1 line-clamp-1 text-sm text-slate-400">{error}</p>
                ) : null}
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
    <section className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="AI agents"
        title="Key findings"
        meta={requestId}
      />

      <motion.div
        className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {agents.slice(0, 5).map((agent) => (
          <CompactAgentCard
            key={agent.id}
            agent={agent}
            status={toAgentCardStatus(agent, loading)}
          />
        ))}
      </motion.div>
    </section>
  );
}

function CompactRiskCard({ metric }: { metric: RiskMetric }) {
  const severity = normalizeSeverity(metric.severity);
  const value = Math.max(0, Math.min(100, Math.round(metric.value)));

  return (
    <motion.article
      className={`relative overflow-hidden rounded-md border bg-slate-950/72 p-4 shadow-[0_16px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl ${severityBorder(severity)}`}
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
            {severity}
          </p>
          <h3 className="mt-1 text-base font-bold leading-tight text-white">
            {metric.label}
          </h3>
        </div>
        <div className={`rounded border px-2 py-1 font-mono text-xs font-bold ${severityBadge(severity)}`}>
          {value}%
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-900">
        <motion.div
          className={`h-full rounded-full ${severityBar(severity)}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </motion.article>
  );
}

function CompactAgentCard({
  agent,
  status,
}: {
  agent: AgentData;
  status: "active" | "analyzing" | "warning";
}) {
  const statusSeverity: RiskSeverity =
    status === "warning" ? "high" : status === "analyzing" ? "medium" : "low";
  const evidence = agent.evidence.slice(0, 2).map((item) => item.label);

  return (
    <motion.article
      className={`relative overflow-hidden rounded-md border bg-slate-950/72 p-4 shadow-[0_16px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl ${severityBorder(statusSeverity)}`}
      variants={sectionVariants}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-200">
            {agent.displayName}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-tight text-white">
            {agent.title}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm font-black text-white">
            {Math.round(agent.confidence)}%
          </p>
          <p className={`mt-1 rounded border px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] ${severityBadge(statusSeverity)}`}>
            {status}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
        {agent.message}
      </p>

      {agent.currentTask ? (
        <p className="mt-3 line-clamp-1 border-l border-cyan-300/25 pl-3 text-xs leading-5 text-slate-400">
          Task: {agent.currentTask}
        </p>
      ) : null}

      {agent.disagreement ? (
        <p className="mt-2 line-clamp-1 border-l border-orange-300/25 pl-3 text-xs leading-5 text-slate-400">
          Challenge: {agent.disagreement}
        </p>
      ) : null}

      {evidence.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {evidence.map((item) => (
            <span
              key={item}
              className="rounded border border-cyan-300/18 bg-cyan-300/8 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-cyan-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function CompactTimelineSection({ events }: { events: TimelineEvent[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Timeline" title="Collapse sequence" meta={`${events.length} events`} />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {events.map((event, index) => {
          const severity = normalizeSeverity(event.severity);

          return (
            <motion.article
              key={event.id ?? `${event.timestamp}-${event.title}`}
              className={`rounded-md border bg-slate-950/72 p-4 ${severityBorder(severity)}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42, delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <Clock3 className={`mt-0.5 h-4 w-4 shrink-0 ${severityText(severity)}`} />
                <div className="min-w-0">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
                    {event.timestamp}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-white">{event.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function CompactVerdictSection({
  verdict,
  failures,
}: {
  verdict: ForensicVerdict;
  failures: PredictedFailure[];
}) {
  const severity = normalizeSeverity(verdict.severity);
  const risks = verdict.detectedRisks.slice(0, 3);
  const headline = verdictHeadline(severity);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <motion.div
        className={`relative overflow-hidden rounded-md border bg-slate-950/76 p-5 shadow-[0_22px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl sm:p-6 ${severityBorder(severity)}`}
        variants={sectionVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <FileWarning className={`h-5 w-5 ${severityText(severity)}`} />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200">
                Final verdict
              </p>
            </div>
            <h2 className="mt-3 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
              {headline}
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
              {compactSentence(verdict.verdict)}
            </p>
            <p className="mt-2 line-clamp-2 max-w-4xl text-xs leading-5 text-slate-400 sm:text-sm">
              Root cause: {verdict.rootCause}
            </p>
          </div>

          <div className={`shrink-0 rounded border px-3 py-2 font-mono text-xs font-bold uppercase ${severityBadge(severity)}`}>
            {severity}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <SummaryList title="Top risks" items={risks} />
          <SummaryList
            title="Predicted failures"
            items={failures.map((failure) => `${failure.title} (${failure.probability}%)`)}
          />
        </div>
      </motion.div>
    </section>
  );
}

function verdictHeadline(severity: RiskSeverity) {
  if (severity === "critical") {
    return "Critical instability detected";
  }

  if (severity === "high") {
    return "High-risk architecture detected";
  }

  if (severity === "medium") {
    return "Moderate risk under review";
  }

  return "System currently stable";
}

function compactSentence(value: string) {
  const cleaned = value.replace(/^GHOST TRACE VERDICT:\s*/i, "").trim();
  const firstSentence = cleaned.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();

  if (!firstSentence) {
    return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
  }

  return firstSentence.length > 220 ? `${firstSentence.slice(0, 217)}...` : firstSentence;
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  const normalized = items.length > 0 ? items : ["No critical signal detected"];

  return (
    <div className="rounded border border-white/10 bg-slate-950/58 p-4">
      <h3 className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {normalized.slice(0, 3).map((item) => (
          <div key={item} className="flex gap-2 text-sm leading-5 text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span className="line-clamp-2">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-y border-cyan-300/15 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.22em] text-cyan-200">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="inline-flex w-fit items-center gap-2 rounded border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200">
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

function severityBadge(severity: RiskSeverity) {
  if (severity === "critical") {
    return "border-red-300/30 bg-red-300/10 text-red-200";
  }

  if (severity === "high") {
    return "border-orange-300/30 bg-orange-300/10 text-orange-200";
  }

  if (severity === "medium") {
    return "border-violet-300/30 bg-violet-300/10 text-violet-200";
  }

  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-200";
}

function severityBar(severity: RiskSeverity) {
  if (severity === "critical") {
    return "bg-gradient-to-r from-red-300 via-red-400 to-orange-300";
  }

  if (severity === "high") {
    return "bg-gradient-to-r from-orange-300 via-amber-300 to-red-300";
  }

  if (severity === "medium") {
    return "bg-gradient-to-r from-blue-300 via-violet-300 to-cyan-300";
  }

  return "bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300";
}

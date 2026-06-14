"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Cpu,
  Database,
  Eye,
  GitBranch,
  Gauge,
  Lock,
  Network,
  Radar,
  Radio,
  Rocket,
  Shield,
  Terminal,
  Upload,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Metric = {
  label: string;
  value: string;
  detail: string;
  progress: number;
  icon: LucideIcon;
  tone: "cyan" | "violet" | "danger" | "blue";
};

type Agent = {
  name: string;
  role: string;
  status: string;
  confidence: number;
  icon: LucideIcon;
  signal: string;
  response: string;
  tone: "cyan" | "violet" | "danger" | "blue" | "orange";
};

const metrics: Metric[] = [
  {
    label: "Risk Score",
    value: "87",
    detail: "Critical systemic exposure detected",
    progress: 87,
    icon: AlertTriangle,
    tone: "danger",
  },
  {
    label: "Stability Index",
    value: "42",
    detail: "Runtime resilience below mission threshold",
    progress: 42,
    icon: Gauge,
    tone: "cyan",
  },
  {
    label: "Architecture Integrity",
    value: "61",
    detail: "Fragmented service boundaries mapped",
    progress: 61,
    icon: Network,
    tone: "violet",
  },
  {
    label: "Failure Probability",
    value: "73%",
    detail: "Projected escalation across release windows",
    progress: 73,
    icon: Activity,
    tone: "blue",
  },
];

const timelineEvents = [
  {
    time: "00:03:12",
    title: "Auth duplication",
    detail:
      "Parallel identity modules found issuing overlapping session authority.",
    icon: Lock,
  },
  {
    time: "00:08:44",
    title: "Architecture drift",
    detail:
      "Service contracts diverged from documented topology after release 4.8.",
    icon: GitBranch,
  },
  {
    time: "00:12:06",
    title: "Dependency instability",
    detail:
      "Transitive packages show brittle version pinning and unbounded upgrade paths.",
    icon: Database,
  },
  {
    time: "00:17:29",
    title: "Missing validation",
    detail:
      "Input validation absent across three boundary layers and two queue consumers.",
    icon: Shield,
  },
  {
    time: "00:22:51",
    title: "Scaling degradation",
    detail:
      "Traffic simulation predicts cascading queue saturation under peak load.",
    icon: Zap,
  },
];

const agents: Agent[] = [
  {
    name: "ARCHITECT",
    role: "Topology reconstruction",
    status: "Mapping dependency fault lines",
    confidence: 94,
    icon: Network,
    signal: "NODEGRAPH_SYNC",
    response:
      "Core service boundaries are recoverable, but ownership is split across competing abstractions.",
    tone: "cyan",
  },
  {
    name: "FORENSIC ANALYST",
    role: "Root-cause excavation",
    status: "Correlating commits with incident drift",
    confidence: 91,
    icon: Eye,
    signal: "EVIDENCE_LOCK",
    response:
      "Regression signature begins at the authentication adapter and propagates into billing retries.",
    tone: "violet",
  },
  {
    name: "SECURITY AGENT",
    role: "Threat surface scan",
    status: "Tracing validation gaps",
    confidence: 88,
    icon: Shield,
    signal: "BOUNDARY_ALERT",
    response:
      "Privilege checks are present, but enforcement is inconsistent at internal API ingress points.",
    tone: "danger",
  },
  {
    name: "FAILURE PREDICTOR",
    role: "Collapse simulation",
    status: "Projecting service saturation",
    confidence: 86,
    icon: Brain,
    signal: "SCENARIO_RUN",
    response:
      "A three-node latency spike can trigger retries fast enough to exhaust queue workers in 11 minutes.",
    tone: "orange",
  },
  {
    name: "TIMELINE RECONSTRUCTOR",
    role: "Incident chronology",
    status: "Rebuilding event sequence",
    confidence: 97,
    icon: Terminal,
    signal: "TRACE_STITCH",
    response:
      "The collapse path is chronological, not random: drift, duplication, instability, then overload.",
    tone: "blue",
  },
];

const architectureNodes = [
  { label: "AUTH", x: "18%", y: "28%", tone: "danger" },
  { label: "API", x: "44%", y: "18%", tone: "cyan" },
  { label: "BILLING", x: "71%", y: "31%", tone: "violet" },
  { label: "QUEUE", x: "29%", y: "68%", tone: "blue" },
  { label: "DATA", x: "61%", y: "72%", tone: "cyan" },
];

const toneStyles = {
  cyan: {
    text: "text-[#22D3EE]",
    bg: "bg-[#22D3EE]",
    softBg: "bg-[#22D3EE]/10",
    border: "border-[#22D3EE]/35",
    shadow: "shadow-[0_0_42px_rgba(34,211,238,0.22)]",
    gradient: "from-[#22D3EE] to-[#3B82F6]",
  },
  blue: {
    text: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]",
    softBg: "bg-[#3B82F6]/10",
    border: "border-[#3B82F6]/35",
    shadow: "shadow-[0_0_42px_rgba(59,130,246,0.2)]",
    gradient: "from-[#3B82F6] to-[#22D3EE]",
  },
  violet: {
    text: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]",
    softBg: "bg-[#8B5CF6]/10",
    border: "border-[#8B5CF6]/35",
    shadow: "shadow-[0_0_42px_rgba(139,92,246,0.22)]",
    gradient: "from-[#8B5CF6] to-[#A855F7]",
  },
  danger: {
    text: "text-[#EF4444]",
    bg: "bg-[#EF4444]",
    softBg: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/35",
    shadow: "shadow-[0_0_42px_rgba(239,68,68,0.24)]",
    gradient: "from-[#EF4444] to-[#F97316]",
  },
  orange: {
    text: "text-[#F97316]",
    bg: "bg-[#F97316]",
    softBg: "bg-[#F97316]/10",
    border: "border-[#F97316]/35",
    shadow: "shadow-[0_0_42px_rgba(249,115,22,0.2)]",
    gradient: "from-[#F97316] to-[#EF4444]",
  },
};

const terminalLines = [
  "ingesting repository topology",
  "indexing 48,912 symbols",
  "replaying failed deploy sequence",
  "isolating duplicated auth authority",
  "constructing collapse probability model",
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.12 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-[#F8FAFC] selection:bg-[#22D3EE]/25 selection:text-white">
      <AmbientField />
      <HeroSection />
      <SystemOverview />
      <ArchitectureInvestigation />
      <FailureTimeline />
      <WarRoom />
      <FinalVerdict />
    </main>
  );
}

function AmbientField() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "64px 64px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_14%_72%,rgba(59,130,246,0.15),transparent_32%)]" />
      <motion.div
        className="absolute left-0 top-0 h-28 w-full bg-gradient-to-b from-[#22D3EE]/10 to-transparent blur-xl"
        animate={{ y: ["-20%", "92vh", "-20%"], opacity: [0.08, 0.22, 0.08] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 0, transparent 6px, rgba(248,250,252,0.32) 7px)",
          backgroundSize: "100% 8px",
        }}
      />
      {Array.from({ length: 24 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[#22D3EE] shadow-[0_0_18px_rgba(34,211,238,0.9)]"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0.12, 0.75, 0.12],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 4 + (index % 5),
            repeat: Infinity,
            delay: index * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative z-10 min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-between">
        <motion.nav
          className="flex items-center justify-between rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.65)] px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="grid h-10 w-10 place-items-center rounded-md border border-[#22D3EE]/30 bg-[#0B1020] shadow-[0_0_32px_rgba(34,211,238,0.25)]"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Radar className="h-5 w-5 text-[#22D3EE]" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold tracking-[0.34em] text-[#F8FAFC]">
                GHOST TRACE
              </p>
              <p className="text-xs text-[#64748B]">Forensic intelligence mesh</p>
            </div>
          </div>
          <div className="hidden items-center gap-5 text-xs uppercase tracking-[0.24em] text-[#94A3B8] md:flex">
            <StatusPill label="Core online" tone="cyan" />
            <StatusPill label="Trace active" tone="violet" />
            <StatusPill label="Risk high" tone="danger" />
          </div>
        </motion.nav>

        <div className="grid items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-5xl"
          >
            <motion.div
              variants={item}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.32em] text-[#22D3EE] shadow-[0_0_32px_rgba(34,211,238,0.16)]"
            >
              <Radio className="h-4 w-4" />
              AI Forensic Intelligence for Software Systems
            </motion.div>
            <motion.h1
              variants={item}
              className="text-balance text-6xl font-black leading-[0.82] tracking-normal text-[#F8FAFC] sm:text-8xl lg:text-[8.7rem]"
            >
              GHOST
              <span className="block bg-gradient-to-r from-[#22D3EE] via-[#3B82F6] to-[#A855F7] bg-clip-text text-transparent drop-shadow-[0_0_34px_rgba(34,211,238,0.28)]">
                TRACE
              </span>
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-7 max-w-2xl text-lg leading-8 text-[#94A3B8] sm:text-xl"
            >
              A cinematic AI investigation system that reconstructs hidden
              architecture, debates evidence, and predicts software collapse
              before production feels the impact.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <PrimaryButton icon={Upload}>Upload Repository</PrimaryButton>
              <SecondaryButton icon={Rocket}>Launch Investigation</SecondaryButton>
            </motion.div>
            <motion.div
              variants={item}
              className="mt-10 grid gap-3 text-sm text-[#94A3B8] sm:grid-cols-3"
            >
              {["Symbolic trace engine", "Autonomous agent debate", "Failure projection"].map(
                (label) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(17,24,39,0.72)] px-4 py-3 backdrop-blur-xl"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
                    {label}
                  </div>
                ),
              )}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-xl"
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          >
            <div className="absolute -inset-10 rounded-full bg-[#22D3EE]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#64748B]">
                    Mission control
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#22D3EE]">
                    TRACE_SESSION_09F-ACTIVE
                  </p>
                </div>
                <motion.div
                  className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1 text-xs font-semibold text-[#EF4444]"
                  animate={{ boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 28px rgba(239,68,68,0.35)", "0 0 0 rgba(239,68,68,0)"] }}
                  transition={{ duration: 2.1, repeat: Infinity }}
                >
                  ANOMALY
                </motion.div>
              </div>
              <div className="grid gap-3">
                {terminalLines.map((line, index) => (
                  <motion.div
                    key={line}
                    className="flex items-center gap-3 rounded-md border border-[rgba(148,163,184,0.15)] bg-[#0B1020]/70 px-4 py-3 font-mono text-sm text-[#94A3B8]"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.18, duration: 0.45 }}
                  >
                    <Terminal className="h-4 w-4 text-[#22D3EE]" />
                    <span className="text-[#64748B]">&gt;</span>
                    <span>{line}</span>
                    <motion.span
                      className="ml-auto h-2 w-9 rounded-full bg-gradient-to-r from-[#22D3EE] to-transparent"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.1 }}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 h-40 overflow-hidden rounded-md border border-[#22D3EE]/15 bg-[#050816]/80 p-4">
                <motion.div
                  className="h-full rounded-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0 8%, rgba(34,211,238,0.35) 8% 9%, transparent 9% 20%, rgba(139,92,246,0.3) 20% 21%, transparent 21% 100%)",
                    backgroundSize: "46px 100%",
                  }}
                  animate={{ backgroundPositionX: ["0px", "460px"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SystemOverview() {
  return (
    <SectionShell
      kicker="System overview"
      title="The platform reads the organism, not just the logs."
      copy="Ghost Trace scores the software system as a living operational body: risk, resilience, architecture integrity, and failure pressure are evaluated together."
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </motion.div>
    </SectionShell>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const tone = toneStyles[metric.tone];

  return (
    <motion.article
      variants={item}
      whileHover={{ y: -8, scale: 1.015 }}
      className={`group relative overflow-hidden rounded-lg border ${tone.border} bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition-shadow duration-300 ${tone.shadow}`}
    >
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full ${tone.softBg} blur-3xl transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-md border ${tone.border} bg-[#0B1020]`}>
          <Icon className={`h-6 w-6 ${tone.text}`} />
        </div>
        <motion.span
          className={`h-3 w-3 rounded-full ${tone.bg} shadow-[0_0_18px_currentColor]`}
          animate={{ scale: [1, 1.55, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </div>
      <p className="mt-8 text-sm uppercase tracking-[0.24em] text-[#64748B]">
        {metric.label}
      </p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-black tracking-normal text-[#F8FAFC]">
          {metric.value}
        </span>
        <span className="pb-2 text-sm text-[#94A3B8]">/ 100</span>
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-[#94A3B8]">
        {metric.detail}
      </p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#111827]">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${tone.gradient}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${metric.progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </motion.article>
  );
}

function ArchitectureInvestigation() {
  return (
    <SectionShell
      kicker="Architecture investigation"
      title="AI reconstructs the infrastructure hiding under drift."
      copy="A live topology pass links modules, runtime pressure, ownership cracks, and dependency vectors into one forensic map."
    >
      <motion.div
        className="relative overflow-hidden rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(17,24,39,0.72)] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.48)] backdrop-blur-2xl lg:p-8"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_42%,rgba(34,211,238,0.15),transparent_25%),radial-gradient(circle_at_64%_56%,rgba(139,92,246,0.13),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-[#22D3EE]/15 bg-[#050816]/70">
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
              animate={{ backgroundPosition: ["0px 0px", "36px 36px"] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[
                ["18", "28", "44", "18"],
                ["44", "18", "71", "31"],
                ["18", "28", "29", "68"],
                ["29", "68", "61", "72"],
                ["71", "31", "61", "72"],
                ["44", "18", "61", "72"],
              ].map(([x1, y1, x2, y2], index) => (
                <motion.line
                  key={`${x1}-${y1}-${x2}-${y2}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={index % 2 ? "rgba(139,92,246,0.48)" : "rgba(34,211,238,0.55)"}
                  strokeWidth="0.45"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: index * 0.16, ease: "easeInOut" }}
                />
              ))}
            </svg>
            {architectureNodes.map((node, index) => {
              const tone = toneStyles[node.tone as keyof typeof toneStyles];

              return (
                <motion.div
                  key={node.label}
                  className={`absolute grid h-24 w-24 place-items-center rounded-full border ${tone.border} bg-[#0B1020]/90 text-sm font-bold tracking-[0.18em] ${tone.text} shadow-[0_0_34px_rgba(34,211,238,0.12)] backdrop-blur-xl`}
                  style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.12 }}
                  animate={{ y: [0, -8, 0] }}
                >
                  <motion.span
                    className={`absolute inset-0 rounded-full border ${tone.border}`}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
                    transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.25 }}
                  />
                  {node.label}
                </motion.div>
              );
            })}
          </div>
          <div className="grid content-between gap-5">
            {[
              ["Topology variance", "23.7%", "Unauthorized module gravity detected"],
              ["Hidden coupling", "14 links", "Cross-domain calls bypass intended adapters"],
              ["Runtime pressure", "High", "Queue workers approaching saturation band"],
            ].map(([label, value, detail], index) => (
              <motion.div
                key={label}
                className="rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.65)] p-5 backdrop-blur-xl"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.13 }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[#64748B]">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-black text-[#F8FAFC]">{value}</p>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}

function FailureTimeline() {
  return (
    <SectionShell
      kicker="Failure timeline"
      title="The incident was not sudden. It left a trail."
      copy="Ghost Trace aligns architectural symptoms into a time-coded collapse narrative for engineering review."
    >
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-[#22D3EE] via-[#8B5CF6] to-[#EF4444] md:left-1/2" />
        {timelineEvents.map((event, index) => {
          const Icon = event.icon;
          const isRight = index % 2 === 1;

          return (
            <motion.article
              key={event.title}
              className={`relative mb-8 grid gap-5 md:grid-cols-2 ${isRight ? "" : "md:text-right"}`}
              initial={{ opacity: 0, y: 42 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.65, delay: index * 0.08 }}
            >
              <div className={`${isRight ? "md:col-start-2" : ""} pl-14 md:pl-0`}>
                <div className="group relative overflow-hidden rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.65)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/70 to-transparent opacity-70" />
                  <div className={`flex items-center gap-3 ${isRight ? "" : "md:flex-row-reverse"}`}>
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-[#22D3EE]/25 bg-[#0B1020]">
                      <Icon className="h-5 w-5 text-[#22D3EE]" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#8B5CF6]">{event.time}</p>
                      <h3 className="mt-1 text-xl font-bold text-[#F8FAFC]">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#94A3B8]">
                    {event.detail}
                  </p>
                </div>
              </div>
              <motion.div
                className="absolute left-2.5 top-8 h-5 w-5 rounded-full border border-[#22D3EE] bg-[#050816] shadow-[0_0_24px_rgba(34,211,238,0.8)] md:left-1/2 md:-translate-x-1/2"
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              />
            </motion.article>
          );
        })}
      </div>
    </SectionShell>
  );
}

function WarRoom() {
  return (
    <SectionShell
      kicker="Live AI war room"
      title="Five agents debate the collapse path in real time."
      copy="The war room is an active forensic council: each agent contributes evidence, challenges assumptions, and synchronizes a final risk model."
    >
      <motion.div
        className="relative overflow-hidden rounded-lg border border-[#22D3EE]/20 bg-[rgba(15,23,42,0.65)] p-4 shadow-[0_44px_150px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.13),transparent_24%)]" />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[
            ["50", "50", "18", "24"],
            ["50", "50", "82", "24"],
            ["50", "50", "19", "76"],
            ["50", "50", "82", "76"],
            ["50", "50", "50", "18"],
          ].map(([x1, y1, x2, y2], index) => (
            <motion.line
              key={`${x2}-${y2}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={index === 2 ? "rgba(239,68,68,0.44)" : "rgba(34,211,238,0.42)"}
              strokeWidth="0.28"
              strokeDasharray="2 3"
              animate={{ strokeDashoffset: [0, -20], opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 3.2 + index * 0.2, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </svg>

        <div className="relative grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <div className="space-y-5">
            <AgentCard agent={agents[0]} index={0} />
            <AgentCard agent={agents[2]} index={2} />
          </div>
          <div className="flex flex-col justify-center gap-5">
            <CommandCore />
            <AgentCard agent={agents[4]} index={4} />
          </div>
          <div className="space-y-5">
            <AgentCard agent={agents[1]} index={1} />
            <AgentCard agent={agents[3]} index={3} />
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const Icon = agent.icon;
  const tone = toneStyles[agent.tone];

  return (
    <motion.article
      className={`relative overflow-hidden rounded-lg border ${tone.border} bg-[rgba(17,24,39,0.72)] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl`}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay: index * 0.08 }}
    >
      <motion.div
        className={`absolute -right-16 -top-16 h-36 w-36 rounded-full ${tone.softBg} blur-3xl`}
        animate={{ opacity: [0.25, 0.75, 0.25], scale: [1, 1.18, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-md border ${tone.border} bg-[#0B1020]`}>
            <Icon className={`h-6 w-6 ${tone.text}`} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-[0.18em] text-[#F8FAFC]">
              {agent.name}
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">{agent.role}</p>
          </div>
        </div>
        <motion.span
          className={`mt-1 h-3 w-3 rounded-full ${tone.bg}`}
          animate={{ boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 20px currentColor", "0 0 0 rgba(34,211,238,0)"] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.1 }}
        />
      </div>
      <div className="relative mt-5 rounded-md border border-[rgba(148,163,184,0.15)] bg-[#050816]/70 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className={`font-mono text-xs ${tone.text}`}>{agent.signal}</p>
          <p className="font-mono text-xs text-[#94A3B8]">
            {agent.confidence}% CONF
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#111827]">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${tone.gradient}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${agent.confidence}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#64748B]">
          {agent.status}
        </p>
        <p className="mt-3 min-h-20 text-sm leading-6 text-[#94A3B8]">
          {agent.response}
        </p>
        <TypingIndicator tone={agent.tone} />
      </div>
    </motion.article>
  );
}

function CommandCore() {
  return (
    <motion.div
      className="relative mx-auto grid aspect-square w-full max-w-[300px] place-items-center rounded-full border border-[#22D3EE]/20 bg-[#050816]/70 shadow-[0_0_80px_rgba(34,211,238,0.18)] backdrop-blur-2xl"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-[#22D3EE]/25"
          style={{ inset: `${18 + ring * 15}%` }}
          animate={{ rotate: ring % 2 ? -360 : 360, scale: [1, 1.04, 1] }}
          transition={{
            rotate: { duration: 12 + ring * 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2.4, repeat: Infinity },
          }}
        />
      ))}
      <div className="relative text-center">
        <Cpu className="mx-auto h-12 w-12 text-[#22D3EE]" />
        <p className="mt-4 text-xs uppercase tracking-[0.34em] text-[#64748B]">
          Ghost core
        </p>
        <p className="mt-2 text-3xl font-black text-[#F8FAFC]">LIVE</p>
      </div>
    </motion.div>
  );
}

function FinalVerdict() {
  return (
    <section className="relative z-10 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <motion.div
        className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-[#EF4444]/30 bg-[rgba(17,24,39,0.72)] shadow-[0_40px_160px_rgba(239,68,68,0.16)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 38 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(239,68,68,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.15),transparent_24%)]" />
          <motion.div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#EF4444] to-transparent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#EF4444]">
                <AlertTriangle className="h-4 w-4" />
                Final forensic verdict
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-normal text-[#F8FAFC] sm:text-5xl lg:text-6xl">
                Engineering collapse is probable without structural intervention.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#94A3B8]">
                Ghost Trace concludes the system is carrying accumulated
                architectural debt across authentication, validation,
                dependency stability, and scale behavior. The failure vector is
                compounding, not isolated.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                ["Risk verdict", "SEV-1 / CRITICAL", "Immediate remediation required before next release train."],
                ["Projected failure", "Retry storm + authorization conflict", "Likely path begins under elevated traffic and spreads through queue workers."],
                ["Primary correction", "Consolidate trust boundaries", "Unify session authority and enforce validation at every ingress point."],
              ].map(([label, value, detail], index) => (
                <motion.div
                  key={label}
                  className="rounded-lg border border-[#EF4444]/20 bg-[#050816]/70 p-5"
                  initial={{ opacity: 0, x: 26 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.12 }}
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[#F97316]">
                    {label}
                  </p>
                  <p className="mt-3 text-2xl font-black text-[#F8FAFC]">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{detail}</p>
                </motion.div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {["Auth", "Data", "Scale"].map((label, index) => (
                  <motion.div
                    key={label}
                    className="rounded-lg border border-[#EF4444]/25 bg-[#EF4444]/10 p-4 text-center"
                    animate={{ boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 24px rgba(239,68,68,0.2)", "0 0 0 rgba(239,68,68,0)"] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.25 }}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]">
                      {label}
                    </p>
                    <p className="mt-2 text-xl font-black text-[#EF4444]">HIGH</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SectionShell({
  kicker,
  title,
  copy,
  children,
}: {
  kicker: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-10 max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#22D3EE]">
            {kicker}
          </p>
          <h2 className="text-3xl font-black leading-tight tracking-normal text-[#F8FAFC] sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-base leading-7 text-[#94A3B8] sm:text-lg">
            {copy}
          </p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof toneStyles;
}) {
  const style = toneStyles[tone];

  return (
    <div className="flex items-center gap-2">
      <motion.span
        className={`h-2 w-2 rounded-full ${style.bg}`}
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.7, repeat: Infinity }}
      />
      {label}
    </div>
  );
}

function PrimaryButton({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-md border border-[#22D3EE]/30 bg-gradient-to-r from-[#22D3EE] to-[#3B82F6] px-6 text-sm font-black uppercase tracking-[0.18em] text-[#050816] shadow-[0_0_40px_rgba(34,211,238,0.28)]"
    >
      <Icon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
      {children}
    </motion.button>
  );
}

function SecondaryButton({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-md border border-[#8B5CF6]/35 bg-[rgba(15,23,42,0.65)] px-6 text-sm font-black uppercase tracking-[0.18em] text-[#F8FAFC] shadow-[0_0_36px_rgba(139,92,246,0.16)] backdrop-blur-xl"
    >
      <Icon className="h-5 w-5 text-[#8B5CF6] transition-transform group-hover:translate-x-0.5" />
      {children}
      <ArrowUpRight className="h-4 w-4 text-[#64748B]" />
    </motion.button>
  );
}

function TypingIndicator({ tone }: { tone: keyof typeof toneStyles }) {
  const style = toneStyles[tone];

  return (
    <div className="mt-4 flex items-center gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#64748B]">
        streaming
      </span>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className={`h-1.5 w-1.5 rounded-full ${style.bg}`}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
        />
      ))}
    </div>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Brain,
  CircuitBoard,
  Clock3,
  Cpu,
  DatabaseZap,
  Eye,
  Fingerprint,
  GitBranch,
  MessageSquareWarning,
  Network,
  Radio,
  Radar,
  ScanLine,
  ShieldAlert,
  Terminal,
  type LucideIcon,
} from "lucide-react";

type Tone = "cyan" | "blue" | "violet" | "red" | "amber" | "emerald";

type Agent = {
  name: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  status: string;
  confidence: number;
  stance: "correlating" | "challenging" | "predicting" | "verifying" | "rebuilding";
  messages: string[];
  evidence: string[];
  position: string;
};

type Signal = {
  from: string;
  to: string;
  tone: Tone;
  delay: number;
  label: string;
};

const tones: Record<
  Tone,
  {
    text: string;
    bg: string;
    border: string;
    borderStrong: string;
    shadow: string;
    fill: string;
    gradient: string;
    line: string;
    soft: string;
  }
> = {
  cyan: {
    text: "text-cyan-300",
    bg: "bg-cyan-300",
    border: "border-cyan-300/25",
    borderStrong: "border-cyan-300/45",
    shadow: "shadow-[0_0_42px_rgba(34,211,238,0.22)]",
    fill: "bg-cyan-300/10",
    gradient: "from-cyan-300 via-sky-400 to-blue-500",
    line: "rgba(34,211,238,0.66)",
    soft: "rgba(34,211,238,0.16)",
  },
  blue: {
    text: "text-blue-300",
    bg: "bg-blue-400",
    border: "border-blue-400/25",
    borderStrong: "border-blue-400/45",
    shadow: "shadow-[0_0_42px_rgba(59,130,246,0.2)]",
    fill: "bg-blue-400/10",
    gradient: "from-blue-300 via-cyan-300 to-violet-400",
    line: "rgba(96,165,250,0.58)",
    soft: "rgba(59,130,246,0.15)",
  },
  violet: {
    text: "text-violet-300",
    bg: "bg-violet-400",
    border: "border-violet-400/25",
    borderStrong: "border-violet-400/45",
    shadow: "shadow-[0_0_46px_rgba(139,92,246,0.22)]",
    fill: "bg-violet-400/10",
    gradient: "from-violet-300 via-fuchsia-400 to-cyan-300",
    line: "rgba(167,139,250,0.6)",
    soft: "rgba(139,92,246,0.16)",
  },
  red: {
    text: "text-red-300",
    bg: "bg-red-400",
    border: "border-red-400/25",
    borderStrong: "border-red-400/45",
    shadow: "shadow-[0_0_44px_rgba(248,113,113,0.2)]",
    fill: "bg-red-400/10",
    gradient: "from-red-300 via-orange-400 to-cyan-300",
    line: "rgba(248,113,113,0.58)",
    soft: "rgba(248,113,113,0.14)",
  },
  amber: {
    text: "text-amber-300",
    bg: "bg-amber-300",
    border: "border-amber-300/25",
    borderStrong: "border-amber-300/45",
    shadow: "shadow-[0_0_42px_rgba(251,191,36,0.18)]",
    fill: "bg-amber-300/10",
    gradient: "from-amber-200 via-orange-400 to-red-400",
    line: "rgba(251,191,36,0.56)",
    soft: "rgba(251,191,36,0.13)",
  },
  emerald: {
    text: "text-emerald-300",
    bg: "bg-emerald-300",
    border: "border-emerald-300/25",
    borderStrong: "border-emerald-300/45",
    shadow: "shadow-[0_0_42px_rgba(52,211,153,0.18)]",
    fill: "bg-emerald-300/10",
    gradient: "from-emerald-300 via-cyan-300 to-blue-400",
    line: "rgba(52,211,153,0.58)",
    soft: "rgba(52,211,153,0.13)",
  },
};

const agents: Agent[] = [
  {
    name: "ARCHITECT",
    title: "System topology arbitrator",
    icon: Network,
    tone: "cyan",
    status: "Mapping dependency fractures",
    confidence: 94,
    stance: "correlating",
    position: "lg:col-start-1 lg:row-start-1",
    messages: [
      "Authentication drift detected.",
      "Ownership boundary conflicts with runtime call graph.",
      "Service topology is recoverable, but adapter authority is split.",
    ],
    evidence: ["AUTH-17", "API-GW", "EDGE-04"],
  },
  {
    name: "FORENSIC ANALYST",
    title: "Root-cause evidence engine",
    icon: Eye,
    tone: "violet",
    status: "Correlating commits with incident telemetry",
    confidence: 91,
    stance: "verifying",
    position: "lg:col-start-3 lg:row-start-1",
    messages: [
      "Deployment anomaly aligns with session adapter rewrite.",
      "Dependency instability increasing.",
      "Trace evidence contradicts the rollback hypothesis.",
    ],
    evidence: ["COMMIT-A9", "LOG-338", "SPAN-71"],
  },
  {
    name: "SECURITY INVESTIGATOR",
    title: "Threat boundary examiner",
    icon: ShieldAlert,
    tone: "red",
    status: "Testing privilege assumptions",
    confidence: 88,
    stance: "challenging",
    position: "lg:col-start-1 lg:row-start-3",
    messages: [
      "Internal ingress bypasses validation on two routes.",
      "Authentication verdict is inconsistent across workers.",
      "I disagree: this is not a pure scaling event.",
    ],
    evidence: ["ACL-09", "JWT-22", "ROUTE-5"],
  },
  {
    name: "FAILURE PREDICTOR",
    title: "Collapse simulation model",
    icon: Brain,
    tone: "amber",
    status: "Projecting future deploy risk",
    confidence: 86,
    stance: "predicting",
    position: "lg:col-start-3 lg:row-start-3",
    messages: [
      "Scaling risk projected within future deployments.",
      "Retry pressure breaches queue tolerance in 11 minutes.",
      "Three-node latency spike can cascade into worker exhaustion.",
    ],
    evidence: ["SIM-12", "QUEUE-8", "LOAD-X"],
  },
  {
    name: "TIMELINE RECONSTRUCTOR",
    title: "Incident chronology weaver",
    icon: Clock3,
    tone: "blue",
    status: "Rebuilding collapse sequence",
    confidence: 97,
    stance: "rebuilding",
    position: "lg:col-start-2 lg:row-start-4",
    messages: [
      "Sequence confirmed: drift, duplication, instability, overload.",
      "The first failure was architectural, not operational.",
      "Causal chain locked for final verdict synthesis.",
    ],
    evidence: ["T+00:03", "T+00:11", "T+00:18"],
  },
];

const signals: Signal[] = [
  { from: "18", to: "50", tone: "cyan", delay: 0, label: "topology" },
  { from: "82", to: "50", tone: "violet", delay: 0.35, label: "evidence" },
  { from: "18", to: "50", tone: "red", delay: 0.7, label: "challenge" },
  { from: "82", to: "50", tone: "amber", delay: 1.05, label: "forecast" },
  { from: "50", to: "50", tone: "blue", delay: 1.4, label: "timeline" },
];

const terminalLines = [
  "[mesh] ingesting repository topology",
  "[trace] replaying failed deployment sequence",
  "[debate] security investigator disputes scale-only cause",
  "[model] collapse probability recalculated: 87.4%",
  "[sync] evidence packet transferred to timeline reconstructor",
  "[core] verdict synthesis awaiting cross-agent quorum",
];

const riskChannels = [
  { label: "Auth Drift", value: 87, tone: "red" as Tone },
  { label: "Dependency Flux", value: 73, tone: "violet" as Tone },
  { label: "Queue Pressure", value: 81, tone: "amber" as Tone },
  { label: "Topology Confidence", value: 94, tone: "cyan" as Tone },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

export function WarRoom() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-20 text-slate-100 sm:px-6 lg:px-10 lg:py-28">
      <WarRoomAtmosphere />

      <motion.div
        className="relative mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
      >
        <motion.div
          variants={riseVariants}
          className="mb-7 flex flex-col gap-5 border-y border-cyan-300/15 bg-slate-950/30 px-0 py-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <motion.span
                className="relative grid h-11 w-11 place-items-center border border-cyan-300/35 bg-cyan-300/10 text-cyan-200 shadow-[0_0_34px_rgba(34,211,238,0.22)]"
                animate={{
                  boxShadow: [
                    "0 0 22px rgba(34,211,238,0.2)",
                    "0 0 48px rgba(34,211,238,0.42)",
                    "0 0 22px rgba(34,211,238,0.2)",
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                <Radio className="h-5 w-5" />
                <motion.span
                  className="absolute inset-0 border border-cyan-200/40"
                  animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200">
                  LIVE AI WAR ROOM
                </p>
                <h2 className="mt-2 text-3xl font-black leading-none tracking-normal text-white sm:text-5xl">
                  Agents conducting a live forensic investigation
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:min-w-[440px]">
            <StatusReadout
              icon={Activity}
              label="System Status"
              value="ONLINE"
              tone="emerald"
            />
            <StatusReadout
              icon={Radar}
              label="Investigation"
              value="ACTIVE"
              tone="cyan"
            />
            <StatusReadout
              icon={Cpu}
              label="Live Agents"
              value="05"
              tone="violet"
            />
          </div>
        </motion.div>

        <motion.div
          variants={riseVariants}
          className="relative overflow-hidden border border-cyan-300/18 bg-slate-950/55 shadow-[0_40px_160px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(34,211,238,0.15), transparent 30%), radial-gradient(circle at 76% 18%, rgba(139,92,246,0.11), transparent 24%), radial-gradient(circle at 20% 78%, rgba(248,113,113,0.09), transparent 22%)",
            }}
            animate={{ opacity: [0.38, 0.7, 0.38], scale: [1, 1.02, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(248,250,252,0.035)_0,rgba(248,250,252,0.035)_1px,transparent_1px,transparent_7px)] opacity-50 mix-blend-screen" />
          <motion.div
            className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
            animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-7 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="relative min-h-[860px] overflow-hidden border border-white/10 bg-slate-950/38 p-4 sm:min-h-[780px] sm:p-5 lg:min-h-[760px]">
              <ConnectionField />

              <div className="relative grid h-full gap-4 lg:grid-cols-3 lg:grid-rows-[1fr_96px_1fr_1fr]">
                {agents.map((agent, index) => (
                  <AgentPanel key={agent.name} agent={agent} index={index} />
                ))}

                <CommandCore />
              </div>
            </div>

            <aside className="grid gap-5">
              <RadarPanel />
              <TerminalStream />
              <RiskMatrix />
            </aside>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function WarRoomAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.16) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "72px 72px"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-x-0 top-8 h-64 bg-cyan-300/8 blur-3xl"
        animate={{ y: [0, 120, 0], opacity: [0.14, 0.28, 0.14] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_84%_78%,rgba(139,92,246,0.12),transparent_30%),radial-gradient(circle_at_10%_68%,rgba(248,113,113,0.08),transparent_28%)]" />
      {Array.from({ length: 30 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 bg-cyan-200/80 shadow-[0_0_18px_rgba(34,211,238,0.8)]"
          style={{
            left: `${(index * 31 + 7) % 100}%`,
            top: `${(index * 17 + 11) % 100}%`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.08, 0.72, 0.08],
            scale: [1, 1.7, 1],
          }}
          transition={{
            duration: 3.8 + (index % 6),
            delay: index * 0.11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function StatusReadout({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
}) {
  const style = tones[tone];

  return (
    <div className={`border ${style.border} bg-slate-950/62 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
      <div className="flex items-center justify-between gap-3">
        <Icon className={`h-4 w-4 ${style.text}`} />
        <motion.span
          className={`h-2 w-2 ${style.bg}`}
          animate={{ scale: [1, 1.8, 1], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <p className="mt-3 text-[0.63rem] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 font-mono text-sm font-bold ${style.text}`}>{value}</p>
    </div>
  );
}

function AgentPanel({ agent, index }: { agent: Agent; index: number }) {
  const Icon = agent.icon;
  const style = tones[agent.tone];

  return (
    <motion.article
      variants={riseVariants}
      whileHover={{ y: -8, scale: 1.012 }}
      animate={{ y: [0, -7, 0] }}
      transition={{
        y: {
          duration: 5.4 + index * 0.35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.18,
        },
      }}
      className={`group relative min-h-[250px] overflow-hidden border ${style.border} bg-slate-950/72 p-4 ${style.shadow} ${agent.position}`}
    >
      <motion.div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${style.text}`}
        animate={{ opacity: [0.3, 1, 0.3], x: ["-18%", "18%", "-18%"] }}
        transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.22 }}
      />
      <motion.div
        className="absolute -right-20 -top-20 h-44 w-44 blur-3xl"
        style={{ backgroundColor: style.soft }}
        animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.18, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, delay: index * 0.2 }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_34%,rgba(34,211,238,0.04))] opacity-70" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`relative grid h-12 w-12 shrink-0 place-items-center border ${style.borderStrong} bg-slate-950`}>
            <Icon className={`h-6 w-6 ${style.text}`} />
            <motion.span
              className={`absolute inset-0 border ${style.borderStrong}`}
              animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.2 }}
            />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-[0.18em] text-white">
              {agent.name}
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">{agent.title}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <motion.span
            className={`h-2.5 w-2.5 ${style.bg}`}
            animate={{
              boxShadow: [
                "0 0 0 rgba(255,255,255,0)",
                `0 0 24px ${style.line}`,
                "0 0 0 rgba(255,255,255,0)",
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.15 }}
          />
          <p className="mt-2 font-mono text-[0.65rem] uppercase text-slate-500">
            {agent.stance}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className={`font-mono text-[0.68rem] uppercase tracking-[0.12em] ${style.text}`}>
            {agent.status}
          </p>
          <p className="font-mono text-xs text-slate-300">{agent.confidence}%</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden bg-slate-900">
          <motion.div
            className={`h-full bg-gradient-to-r ${style.gradient}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${agent.confidence}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.12 + index * 0.08 }}
          />
        </div>
      </div>

      <div className="relative mt-4 space-y-2">
        {agent.messages.map((message, messageIndex) => (
          <motion.div
            key={message}
            className="flex gap-2 border border-white/8 bg-slate-950/60 px-3 py-2"
            initial={{ opacity: 0, x: messageIndex % 2 ? 14 : -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.28 + index * 0.08 + messageIndex * 0.12 }}
          >
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 ${style.bg}`} />
            <p className="text-xs leading-5 text-slate-300">{message}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {agent.evidence.map((item, evidenceIndex) => (
          <motion.span
            key={item}
            className={`border ${style.border} bg-slate-950/70 px-2 py-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] ${style.text}`}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: index * 0.2 + evidenceIndex * 0.14,
            }}
          >
            {item}
          </motion.span>
        ))}
        <TypingDots tone={agent.tone} />
      </div>
    </motion.article>
  );
}

function CommandCore() {
  return (
    <motion.div
      variants={riseVariants}
      className="relative z-10 flex min-h-[260px] items-center justify-center border border-cyan-300/25 bg-slate-950/72 shadow-[0_0_70px_rgba(34,211,238,0.16)] lg:col-start-2 lg:row-start-2 lg:row-span-2"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_58%)]" />
      <div className="absolute inset-5 border border-cyan-300/16" />
      <div className="absolute inset-10 border border-violet-300/14" />
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-cyan-300/18"
          style={{ inset: `${12 + ring * 13}%` }}
          animate={{ rotate: ring % 2 ? -360 : 360, scale: [1, 1.04, 1] }}
          transition={{
            rotate: { duration: 12 + ring * 5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
      <motion.div
        className="absolute inset-8 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.34) 30deg, transparent 72deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative text-center">
        <motion.div
          className="mx-auto grid h-20 w-20 place-items-center border border-cyan-300/40 bg-cyan-300/10"
          animate={{
            boxShadow: [
              "0 0 24px rgba(34,211,238,0.18)",
              "0 0 58px rgba(34,211,238,0.42)",
              "0 0 24px rgba(34,211,238,0.18)",
            ],
          }}
          transition={{ duration: 2.1, repeat: Infinity }}
        >
          <CircuitBoard className="h-10 w-10 text-cyan-200" />
        </motion.div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.32em] text-cyan-200">
          Ghost Core
        </p>
        <p className="mt-2 text-3xl font-black text-white">QUORUM</p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          evidence fusion active
        </p>
      </div>
    </motion.div>
  );
}

function ConnectionField() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-80"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="war-room-glow">
          <feGaussianBlur stdDeviation="0.7" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {signals.map((signal, index) => {
        const y = index < 2 ? "21" : index < 4 ? "62" : "79";
        const startX = signal.from;
        const endX = "50";
        const startY = signal.label === "timeline" ? "82" : y;
        const endY = "50";
        const style = tones[signal.tone];

        return (
          <g key={signal.label} filter="url(#war-room-glow)">
            <motion.path
              d={`M ${startX} ${startY} C ${startX} ${endY}, ${endX} ${startY}, ${endX} ${endY}`}
              stroke={style.line}
              strokeWidth="0.28"
              strokeDasharray="1.8 2.4"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.75 }}
              viewport={{ once: true }}
              animate={{ strokeDashoffset: [0, -18], opacity: [0.24, 0.8, 0.24] }}
              transition={{
                pathLength: { duration: 1.2, delay: signal.delay },
                strokeDashoffset: { duration: 3.4, repeat: Infinity, ease: "linear" },
                opacity: { duration: 2.6, repeat: Infinity, delay: signal.delay },
              }}
            />
            <motion.circle
              r="0.85"
              fill={style.line}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                offsetDistance: ["0%", "100%"],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: signal.delay,
                ease: "easeInOut",
              }}
              style={{
                offsetPath: `path("M ${startX} ${startY} C ${startX} ${endY}, ${endX} ${startY}, ${endX} ${endY}")`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function RadarPanel() {
  return (
    <motion.div
      variants={riseVariants}
      className="relative min-h-[300px] overflow-hidden border border-cyan-300/20 bg-slate-950/70 p-5 shadow-[0_0_48px_rgba(34,211,238,0.12)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">
            Investigation Radar
          </p>
          <p className="mt-2 text-sm text-slate-400">live evidence sweep</p>
        </div>
        <ScanLine className="h-5 w-5 text-cyan-200" />
      </div>

      <div className="relative mx-auto mt-7 aspect-square max-w-[230px] rounded-full border border-cyan-300/25">
        {[18, 35, 50].map((inset) => (
          <div
            key={inset}
            className="absolute rounded-full border border-cyan-300/12"
            style={{ inset: `${inset}%` }}
          />
        ))}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-300/12" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-300/12" />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(34,211,238,0.34), rgba(34,211,238,0.08) 34deg, transparent 74deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
        />
        {[
          ["18%", "34%", "red"],
          ["66%", "28%", "violet"],
          ["42%", "72%", "amber"],
          ["70%", "67%", "cyan"],
        ].map(([left, top, tone], index) => {
          const style = tones[tone as Tone];

          return (
            <motion.span
              key={`${left}-${top}`}
              className={`absolute h-2.5 w-2.5 ${style.bg}`}
              style={{ left, top }}
              animate={{ scale: [1, 1.85, 1], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.22 }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

function TerminalStream() {
  return (
    <motion.div
      variants={riseVariants}
      className="relative overflow-hidden border border-violet-300/18 bg-slate-950/72 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-violet-300" />
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-violet-200">
            Live Terminal
          </p>
        </div>
        <TypingDots tone="violet" />
      </div>

      <div className="space-y-2">
        {terminalLines.map((line, index) => (
          <motion.div
            key={line}
            className="flex items-center gap-3 border border-white/8 bg-slate-950/70 px-3 py-2 font-mono text-[0.72rem] text-slate-300"
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
          >
            <span className="text-cyan-300">&gt;</span>
            <span className="min-w-0 flex-1 truncate">{line}</span>
            <motion.span
              className="h-px w-8 bg-gradient-to-r from-violet-300 to-transparent"
              animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.65, 1, 0.65] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.12 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function RiskMatrix() {
  return (
    <motion.div
      variants={riseVariants}
      className="relative overflow-hidden border border-red-300/18 bg-slate-950/72 p-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300/70 to-transparent" />
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-red-200">
            Risk Debate
          </p>
          <p className="mt-2 text-sm text-slate-400">agent consensus pressure</p>
        </div>
        <MessageSquareWarning className="h-5 w-5 text-red-300" />
      </div>

      <div className="mt-5 space-y-4">
        {riskChannels.map((risk, index) => {
          const style = tones[risk.tone];

          return (
            <div key={risk.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  {risk.label}
                </p>
                <p className={`font-mono text-xs ${style.text}`}>{risk.value}%</p>
              </div>
              <div className="h-2 overflow-hidden bg-slate-900">
                <motion.div
                  className={`h-full bg-gradient-to-r ${style.gradient}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${risk.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: index * 0.12 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Evidence", icon: DatabaseZap, tone: "cyan" as Tone },
          { label: "Identity", icon: Fingerprint, tone: "red" as Tone },
          { label: "Branch", icon: GitBranch, tone: "violet" as Tone },
        ].map((item, index) => {
          const Icon = item.icon;
          const style = tones[item.tone];

          return (
            <motion.div
              key={item.label}
              className={`border ${style.border} bg-slate-950/70 p-3 text-center`}
              animate={{ opacity: [0.62, 1, 0.62] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.18 }}
            >
              <Icon className={`mx-auto h-4 w-4 ${style.text}`} />
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.12em] text-slate-500">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function TypingDots({ tone }: { tone: Tone }) {
  const style = tones[tone];

  return (
    <span className="inline-flex items-center gap-1" aria-label="streaming">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className={`h-1.5 w-1.5 ${style.bg}`}
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.14 }}
        />
      ))}
    </span>
  );
}

export default WarRoom;

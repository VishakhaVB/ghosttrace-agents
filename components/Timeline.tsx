"use client";

import { motion, type Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  DatabaseZap,
  Eye,
  GitBranch,
  GitCompareArrows,
  Network,
  Radar,
  Radio,
  ScanLine,
  ShieldAlert,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface TimelineEvent {
  timestamp: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
}

type Severity = TimelineEvent["severity"];

type SeverityStyle = {
  label: string;
  icon: LucideIcon;
  text: string;
  mutedText: string;
  border: string;
  borderStrong: string;
  bg: string;
  nodeBg: string;
  shadow: string;
  glow: string;
  badge: string;
  gradient: string;
  line: string;
  soft: string;
};

const severityStyles: Record<Severity, SeverityStyle> = {
  low: {
    label: "Low",
    icon: Eye,
    text: "text-cyan-300",
    mutedText: "text-cyan-100/70",
    border: "border-cyan-300/20",
    borderStrong: "border-cyan-300/45",
    bg: "bg-cyan-300/10",
    nodeBg: "bg-cyan-300",
    shadow: "shadow-[0_0_42px_rgba(34,211,238,0.22)]",
    glow: "rgba(34,211,238,0.75)",
    badge: "border-cyan-300/35 bg-cyan-300/10 text-cyan-200",
    gradient: "from-cyan-300 via-sky-400 to-blue-500",
    line: "rgba(34,211,238,0.72)",
    soft: "rgba(34,211,238,0.16)",
  },
  medium: {
    label: "Medium",
    icon: GitCompareArrows,
    text: "text-violet-300",
    mutedText: "text-violet-100/70",
    border: "border-violet-300/20",
    borderStrong: "border-violet-300/45",
    bg: "bg-violet-300/10",
    nodeBg: "bg-violet-300",
    shadow: "shadow-[0_0_46px_rgba(139,92,246,0.24)]",
    glow: "rgba(139,92,246,0.78)",
    badge: "border-violet-300/35 bg-violet-300/10 text-violet-200",
    gradient: "from-blue-300 via-violet-400 to-fuchsia-400",
    line: "rgba(139,92,246,0.72)",
    soft: "rgba(139,92,246,0.16)",
  },
  high: {
    label: "High",
    icon: Zap,
    text: "text-orange-300",
    mutedText: "text-orange-100/70",
    border: "border-orange-300/20",
    borderStrong: "border-orange-300/45",
    bg: "bg-orange-300/10",
    nodeBg: "bg-orange-300",
    shadow: "shadow-[0_0_46px_rgba(249,115,22,0.24)]",
    glow: "rgba(249,115,22,0.78)",
    badge: "border-orange-300/35 bg-orange-300/10 text-orange-200",
    gradient: "from-orange-200 via-orange-400 to-red-400",
    line: "rgba(249,115,22,0.72)",
    soft: "rgba(249,115,22,0.16)",
  },
  critical: {
    label: "Critical",
    icon: ShieldAlert,
    text: "text-red-300",
    mutedText: "text-red-100/70",
    border: "border-red-300/25",
    borderStrong: "border-red-300/55",
    bg: "bg-red-300/10",
    nodeBg: "bg-red-400",
    shadow: "shadow-[0_0_52px_rgba(239,68,68,0.3)]",
    glow: "rgba(239,68,68,0.86)",
    badge: "border-red-300/40 bg-red-400/10 text-red-200",
    gradient: "from-red-300 via-rose-500 to-orange-400",
    line: "rgba(239,68,68,0.78)",
    soft: "rgba(239,68,68,0.18)",
  },
};

const defaultTimelineEvents: TimelineEvent[] = [
  {
    timestamp: "T+00:03:12",
    title: "Authentication duplication introduced",
    severity: "medium",
    description:
      "Parallel identity modules began issuing overlapping session authority, splitting trust decisions across two runtime paths.",
  },
  {
    timestamp: "T+00:08:44",
    title: "Validation layer fragmented",
    severity: "high",
    description:
      "Boundary checks diverged between API ingress, queue consumers, and internal worker calls, allowing malformed states to survive deeper.",
  },
  {
    timestamp: "T+00:12:06",
    title: "Dependency instability detected",
    severity: "medium",
    description:
      "Transitive packages showed brittle pinning, mismatched peer expectations, and upgrade paths capable of shifting behavior silently.",
  },
  {
    timestamp: "T+00:17:29",
    title: "Architecture drift escalated",
    severity: "critical",
    description:
      "Service ownership no longer matched the call graph; recovery logic crossed domains and amplified every retry decision.",
  },
  {
    timestamp: "T+00:22:51",
    title: "Scaling degradation projected",
    severity: "high",
    description:
      "Load simulation forecast queue saturation and retry storms under peak traffic, exposing a narrowing resilience window.",
  },
  {
    timestamp: "T+00:29:18",
    title: "Error propagation increased",
    severity: "critical",
    description:
      "Unhandled failure signatures began cascading across workers, collapsing observability into repeated symptoms instead of root causes.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.12,
    },
  },
};

const eventVariants: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

const particlePositions = [
  ["7%", "14%"],
  ["18%", "62%"],
  ["28%", "33%"],
  ["41%", "78%"],
  ["52%", "18%"],
  ["63%", "49%"],
  ["74%", "84%"],
  ["86%", "28%"],
  ["93%", "66%"],
  ["12%", "88%"],
  ["36%", "8%"],
  ["67%", "9%"],
];

const eventIcons = [
  GitBranch,
  ShieldAlert,
  DatabaseZap,
  Network,
  Activity,
  AlertTriangle,
] as const;

export const sampleTimelineEvents = defaultTimelineEvents;

export function Timeline({ events }: TimelineProps) {
  const resolvedEvents = events.length > 0 ? events : defaultTimelineEvents;

  return (
    <section className="relative isolate overflow-hidden rounded-lg border border-cyan-300/15 bg-[#050816]/85 px-4 py-8 shadow-[0_36px_140px_rgba(0,0,0,0.56)] backdrop-blur-2xl sm:px-6 lg:px-8">
      <ForensicBackground />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.14)]">
              <Radar className="h-4 w-4" />
              Collapse chronology locked
            </div>
            <h2 className="text-3xl font-black tracking-normal text-slate-50 sm:text-4xl lg:text-5xl">
              Software collapse timeline
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Ghost Trace reconstructs the hidden sequence of architectural drift,
              runtime pressure, and degraded control points that made the system
              unstable over time.
            </p>
          </div>

          <motion.div
            className="grid min-w-52 gap-3 rounded-lg border border-slate-400/15 bg-slate-950/60 p-4 backdrop-blur-xl"
            animate={{
              boxShadow: [
                "0 0 22px rgba(34,211,238,0.1)",
                "0 0 42px rgba(139,92,246,0.18)",
                "0 0 22px rgba(34,211,238,0.1)",
              ],
            }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate-500">
                Reconstruction
              </span>
              <Radio className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-50">
                {resolvedEvents.length}
              </span>
              <span className="pb-1 font-mono text-xs uppercase tracking-[0.16em] text-cyan-200">
                events
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-red-400"
                initial={{ width: "18%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <TimelinePath events={resolvedEvents} />

          <div className="relative space-y-8 md:space-y-10">
            {resolvedEvents.map((event, index) => (
              <TimelineEventCard
                key={`${event.timestamp}-${event.title}`}
                event={event}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ForensicBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_84%_22%,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_14%_78%,rgba(239,68,68,0.12),transparent_30%)]" />
      <motion.div
        className="absolute inset-0 opacity-[0.24]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.12) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "54px 54px"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -left-1/4 top-0 h-28 w-[150%] bg-gradient-to-b from-cyan-300/10 via-cyan-300/5 to-transparent blur-sm"
        animate={{ y: ["-20%", "900%", "-20%"], opacity: [0.08, 0.24, 0.08] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
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
            x: [0, index % 2 ? 18 : -18, 0],
            y: [0, -22, 0],
            opacity: [0.16, 0.82, 0.16],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 4.4 + (index % 4),
            repeat: Infinity,
            delay: index * 0.21,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function TimelinePath({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="pointer-events-none absolute bottom-0 left-5 top-0 md:left-1/2 md:-translate-x-1/2">
      <div className="absolute left-0 top-0 h-full w-px bg-slate-700/50" />
      <motion.div
        className="absolute left-0 top-0 w-px bg-gradient-to-b from-cyan-300 via-violet-400 to-red-400 shadow-[0_0_26px_rgba(34,211,238,0.55)]"
        initial={{ height: 0 }}
        whileInView={{ height: "100%" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute left-[-3px] h-24 w-2 rounded-full bg-gradient-to-b from-transparent via-cyan-200 to-transparent blur-[1px]"
        animate={{ top: ["0%", "92%", "0%"], opacity: [0.16, 0.9, 0.16] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[-16px] top-8 h-8 w-8 rounded-full border border-cyan-300/40"
        animate={{ y: [0, Math.max(events.length - 1, 1) * 120, 0], opacity: [0, 0.7, 0] }}
        transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function TimelineEventCard({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  const severity = severityStyles[event.severity];
  const SeverityIcon = severity.icon;
  const EventIcon = eventIcons[index % eventIcons.length];
  const isRight = index % 2 === 1;
  const evidenceId = `EV-${String(index + 1).padStart(2, "0")}`;

  return (
    <motion.article
      className={`relative grid gap-5 md:grid-cols-2 ${isRight ? "" : "md:text-right"}`}
      variants={eventVariants}
    >
      <div className={`${isRight ? "md:col-start-2" : ""} pl-14 md:pl-0`}>
        <motion.div
          className={`group relative overflow-hidden rounded-lg border ${severity.border} bg-slate-950/68 p-5 backdrop-blur-2xl ${severity.shadow}`}
          whileHover={{
            y: -8,
            scale: 1.012,
            boxShadow: `0 28px 100px rgba(0,0,0,0.42), 0 0 48px ${severity.soft}`,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
          <motion.div
            className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${severity.text}`}
            animate={{ x: ["-80%", "80%"], opacity: [0.18, 0.9, 0.18] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 0, transparent 5px, rgba(248,250,252,0.35) 6px)",
              backgroundSize: "100% 7px",
            }}
          />
          <div
            className="absolute -right-20 -top-20 h-44 w-44 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundColor: severity.soft }}
          />

          <div className="relative">
            <div
              className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${isRight ? "" : "md:flex-row-reverse"}`}
            >
              <div
                className={`flex items-start gap-3 ${isRight ? "" : "md:flex-row-reverse"}`}
              >
                <motion.div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-md border ${severity.borderStrong} bg-[#0B1020]`}
                  animate={{
                    boxShadow: [
                      `0 0 18px ${severity.soft}`,
                      `0 0 34px ${severity.glow}`,
                      `0 0 18px ${severity.soft}`,
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.13 }}
                >
                  <EventIcon className={`h-5 w-5 ${severity.text}`} />
                </motion.div>
                <div>
                  <div
                    className={`flex items-center gap-2 ${isRight ? "" : "md:justify-end"}`}
                  >
                    <Terminal className={`h-3.5 w-3.5 ${severity.text}`} />
                    <p className={`font-mono text-xs uppercase tracking-[0.16em] ${severity.text}`}>
                      {event.timestamp}
                    </p>
                  </div>
                  <h3 className="mt-2 text-xl font-bold leading-tight tracking-normal text-slate-50 sm:text-2xl">
                    {event.title}
                  </h3>
                </div>
              </div>

              <motion.div
                className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] ${severity.badge}`}
                animate={{ opacity: [0.76, 1, 0.76] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.11 }}
              >
                <SeverityIcon className="h-3.5 w-3.5" />
                {severity.label}
              </motion.div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              {event.description}
            </p>

            <div
              className={`mt-5 flex flex-wrap items-center gap-3 ${isRight ? "" : "md:justify-end"}`}
            >
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-500/15 bg-slate-900/70 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                <ScanLine className={`h-3.5 w-3.5 ${severity.text}`} />
                {evidenceId}
              </div>
              <motion.div
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] ${severity.borderStrong} ${severity.bg} ${severity.mutedText}`}
                animate={{
                  boxShadow: [
                    `0 0 0 ${severity.soft}`,
                    `0 0 24px ${severity.soft}`,
                    `0 0 0 ${severity.soft}`,
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.17 }}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Propagation marker
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <EventNode severity={severity} index={index} isRight={isRight} />
    </motion.article>
  );
}

function EventNode({
  severity,
  index,
  isRight,
}: {
  severity: SeverityStyle;
  index: number;
  isRight: boolean;
}) {
  return (
    <div className="absolute left-0 top-6 md:left-1/2 md:-translate-x-1/2">
      <motion.div
        className={`relative grid h-10 w-10 place-items-center rounded-full border ${severity.borderStrong} bg-[#050816]`}
        initial={{ scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        animate={{
          boxShadow: [
            `0 0 16px ${severity.soft}`,
            `0 0 36px ${severity.glow}`,
            `0 0 16px ${severity.soft}`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.16 }}
      >
        <motion.span
          className={`absolute inset-0 rounded-full border ${severity.borderStrong}`}
          animate={{ scale: [1, 1.7, 1], opacity: [0.62, 0, 0.62] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.2 }}
        />
        <motion.span
          className={`h-3 w-3 rounded-full ${severity.nodeBg}`}
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.1 }}
        />
        <motion.span
          className={`absolute top-1/2 h-px w-12 bg-gradient-to-r from-transparent via-current to-transparent md:w-16 ${
            isRight ? "left-full" : "left-full md:left-auto md:right-full"
          }`}
          style={{
            color: severity.line,
          }}
          animate={{ opacity: [0.2, 0.9, 0.2], scaleX: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.12 }}
        />
      </motion.div>
    </div>
  );
}

export default Timeline;

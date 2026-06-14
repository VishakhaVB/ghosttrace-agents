"use client";

import { motion, type Variants } from "framer-motion";
import {
  AlertOctagon,
  AlertTriangle,
  BrainCircuit,
  CircuitBoard,
  FileWarning,
  Gauge,
  GitBranch,
  LockKeyhole,
  Radio,
  ScanLine,
  ShieldAlert,
  Siren,
  Terminal,
  TimerReset,
  Zap,
} from "lucide-react";

export interface VerdictPanelProps {
  verdict: string;
  rootCause: string;
  risks: string[];
  predictedFailures: string[];
  severity: "low" | "medium" | "high" | "critical";
}

type SeverityStyle = {
  badge: string;
  status: string;
  authority: string;
  text: string;
  dot: string;
  border: string;
  softBorder: string;
  fill: string;
  halo: string;
  glow: string;
  line: string;
  gradient: string;
  warningShadow: string;
};

const severityStyles: Record<VerdictPanelProps["severity"], SeverityStyle> = {
  low: {
    badge: "LOW",
    status: "VERDICT STABLE",
    authority: "AI forensic review board",
    text: "text-cyan-200",
    dot: "bg-cyan-300",
    border: "border-cyan-300/40",
    softBorder: "border-cyan-300/18",
    fill: "bg-cyan-300/10",
    halo: "rgba(34,211,238,0.15)",
    glow: "rgba(34,211,238,0.42)",
    line: "rgba(34,211,238,0.82)",
    gradient: "from-cyan-300 via-sky-400 to-blue-500",
    warningShadow: "shadow-[0_0_52px_rgba(34,211,238,0.18)]",
  },
  medium: {
    badge: "MEDIUM",
    status: "VERDICT ESCALATED",
    authority: "AI instability tribunal",
    text: "text-violet-200",
    dot: "bg-violet-300",
    border: "border-violet-300/40",
    softBorder: "border-violet-300/18",
    fill: "bg-violet-300/10",
    halo: "rgba(139,92,246,0.16)",
    glow: "rgba(167,139,250,0.44)",
    line: "rgba(167,139,250,0.82)",
    gradient: "from-blue-300 via-violet-300 to-cyan-300",
    warningShadow: "shadow-[0_0_56px_rgba(139,92,246,0.2)]",
  },
  high: {
    badge: "HIGH",
    status: "VERDICT DANGEROUS",
    authority: "AI collapse assessment cell",
    text: "text-amber-200",
    dot: "bg-amber-300",
    border: "border-amber-300/42",
    softBorder: "border-amber-300/20",
    fill: "bg-amber-300/10",
    halo: "rgba(251,191,36,0.15)",
    glow: "rgba(251,146,60,0.48)",
    line: "rgba(251,191,36,0.84)",
    gradient: "from-amber-200 via-orange-400 to-red-400",
    warningShadow: "shadow-[0_0_62px_rgba(251,146,60,0.24)]",
  },
  critical: {
    badge: "CRITICAL",
    status: "FINAL COLLAPSE WARNING",
    authority: "AI mission-critical verdict authority",
    text: "text-red-200",
    dot: "bg-red-300",
    border: "border-red-300/48",
    softBorder: "border-red-300/22",
    fill: "bg-red-300/10",
    halo: "rgba(248,113,113,0.18)",
    glow: "rgba(248,113,113,0.62)",
    line: "rgba(248,113,113,0.92)",
    gradient: "from-red-200 via-red-400 to-orange-400",
    warningShadow: "shadow-[0_0_78px_rgba(248,113,113,0.3)]",
  },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 42, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
};

const streamVariants: Variants = {
  hidden: { opacity: 0, x: 18 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

export function VerdictPanel({
  verdict,
  rootCause,
  risks,
  predictedFailures,
  severity,
}: VerdictPanelProps) {
  const style = severityStyles[severity];
  const normalizedRisks = risks.length > 0 ? risks : ["No active risk packets supplied"];
  const normalizedFailures =
    predictedFailures.length > 0
      ? predictedFailures
      : ["No future failure projections supplied"];
  const terminalId = `VERDICT-${severity.toUpperCase()}-${String(
    normalizedRisks.length + normalizedFailures.length,
  ).padStart(2, "0")}`;

  return (
    <motion.section
      className="relative isolate w-full overflow-hidden px-4 py-20 text-slate-100 sm:px-6 lg:px-10 lg:py-28"
      variants={panelVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      aria-label={`Final forensic verdict, ${severity} severity`}
    >
      <VerdictAtmosphere style={style} critical={severity === "critical"} />

      <motion.div
        className={`relative mx-auto max-w-7xl overflow-hidden border ${style.border} bg-slate-950/76 ${style.warningShadow} backdrop-blur-2xl`}
        variants={revealVariants}
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            `0 38px 140px rgba(0,0,0,0.58), 0 0 28px ${style.halo}`,
            `0 48px 170px rgba(0,0,0,0.66), 0 0 70px ${style.glow}`,
            `0 38px 140px rgba(0,0,0,0.58), 0 0 28px ${style.halo}`,
          ],
        }}
        transition={{
          y: { duration: 7.5, repeat: Infinity, ease: "easeInOut" },
          boxShadow: {
            duration: severity === "critical" ? 1.8 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:38px_38px] opacity-45" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(248,250,252,0.04)_0,rgba(248,250,252,0.04)_1px,transparent_1px,transparent_7px)] opacity-45 mix-blend-screen" />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-130%", skewX: -12 }}
          animate={{ x: ["-130%", "130%"] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${style.text}`}
          animate={{ x: ["-38%", "38%", "-38%"], opacity: [0.26, 1, 0.26] }}
          transition={{
            duration: severity === "critical" ? 1.6 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-10">
          <VerdictHeader style={style} severity={severity} terminalId={terminalId} />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(360px,0.97fr)]">
            <motion.div
              className={`relative overflow-hidden border ${style.softBorder} bg-slate-950/62 p-5 sm:p-6 lg:p-7`}
              variants={revealVariants}
            >
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: `radial-gradient(circle at 20% 12%, ${style.halo}, transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.075), transparent 38%, rgba(255,255,255,0.025))`,
                }}
              />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`grid h-12 w-12 place-items-center border ${style.border} ${style.fill}`}
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <FileWarning className={`h-6 w-6 ${style.text}`} />
                    </motion.div>
                    <div>
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">
                        collapse assessment
                      </p>
                      <h3 className="mt-1 text-xl font-black uppercase tracking-[0.12em] text-white sm:text-2xl">
                        Engineering Verdict
                      </h3>
                    </div>
                  </div>
                  <TypingDots className={style.dot} />
                </div>

                <motion.p
                  className="text-pretty text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl"
                  variants={revealVariants}
                >
                  {verdict}
                </motion.p>

                <motion.div
                  className={`mt-6 border-l-2 px-4 py-4 ${style.softBorder} bg-slate-950/58`}
                  variants={revealVariants}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <CircuitBoard className={`h-4 w-4 ${style.text}`} />
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">
                      root cause analysis
                    </p>
                  </div>
                  <p className="text-sm leading-7 text-slate-300 sm:text-base">
                    {rootCause}
                  </p>
                </motion.div>

                <motion.div className="mt-6 grid gap-3 sm:grid-cols-3" variants={revealVariants}>
                  <VerdictStat
                    icon="gauge"
                    label="severity"
                    value={style.badge}
                    style={style}
                  />
                  <VerdictStat
                    icon="timer"
                    label="forecast"
                    value="ACTIVE"
                    style={style}
                  />
                  <VerdictStat
                    icon="radio"
                    label="authority"
                    value="AI"
                    style={style}
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.aside
              className={`relative overflow-hidden border ${style.softBorder} bg-slate-950/62 p-5 sm:p-6`}
              variants={revealVariants}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,113,113,0.1),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_34%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">
                      forensic terminal
                    </p>
                    <p className={`mt-2 font-mono text-sm font-black ${style.text}`}>
                      {terminalId}
                    </p>
                  </div>
                  <Terminal className={`h-5 w-5 ${style.text}`} />
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "AI council reached cross-agent quorum.",
                    "Evidence confidence exceeds verdict threshold.",
                    "Failure projection attached to remediation queue.",
                    "Final report sealed for engineering command.",
                  ].map((line, index) => (
                    <motion.div
                      key={line}
                      className="flex items-start gap-3 border border-white/8 bg-slate-950/64 px-3 py-3"
                      variants={streamVariants}
                      animate={{ opacity: [0.72, 1, 0.72] }}
                      transition={{
                        opacity: {
                          duration: 2.4,
                          repeat: Infinity,
                          delay: index * 0.18,
                        },
                      }}
                    >
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 ${style.dot}`} />
                      <p className="text-xs leading-5 text-slate-300 sm:text-sm">{line}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <VerdictList
              title="Detected Risk Packets"
              eyebrow="current instability"
              icon="risk"
              items={normalizedRisks}
              style={style}
            />
            <VerdictList
              title="Predicted Failure Cascade"
              eyebrow="future catastrophe model"
              icon="failure"
              items={normalizedFailures}
              style={style}
            />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

function VerdictAtmosphere({
  style,
  critical,
}: {
  style: SeverityStyle;
  critical: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at 50% 34%, ${style.halo}, transparent 34%), radial-gradient(circle at 78% 14%, rgba(248,113,113,0.12), transparent 28%), radial-gradient(circle at 12% 82%, rgba(251,146,60,0.1), transparent 30%)`,
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,113,113,0.26) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.16) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "76px 76px"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: style.halo }}
        animate={{ opacity: [0.28, critical ? 0.88 : 0.58, 0.28], scale: [1, 1.2, 1] }}
        transition={{ duration: critical ? 1.7 : 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-44 w-full bg-gradient-to-t from-red-500/10 to-transparent blur-xl"
        animate={{ opacity: [0.12, 0.42, 0.12], y: [20, -12, 20] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function VerdictHeader({
  style,
  severity,
  terminalId,
}: {
  style: SeverityStyle;
  severity: VerdictPanelProps["severity"];
  terminalId: string;
}) {
  return (
    <motion.header
      className="relative flex flex-col gap-5 border-y border-white/10 py-5 lg:flex-row lg:items-center lg:justify-between"
      variants={revealVariants}
    >
      <div className="flex items-start gap-4">
        <motion.div
          className={`relative grid h-14 w-14 shrink-0 place-items-center border ${style.border} ${style.fill}`}
          animate={{
            boxShadow: [
              `0 0 22px ${style.halo}`,
              `0 0 54px ${style.glow}`,
              `0 0 22px ${style.halo}`,
            ],
          }}
          transition={{
            duration: severity === "critical" ? 1.35 : 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <SeverityGlyph severity={severity} className={`h-7 w-7 ${style.text}`} />
          <motion.span
            className={`absolute inset-0 border ${style.border}`}
            animate={{ scale: [1, 1.42, 1], opacity: [0.52, 0, 0.52] }}
            transition={{ duration: severity === "critical" ? 1.1 : 2.1, repeat: Infinity }}
          />
        </motion.div>
        <div>
          <p className={`font-mono text-xs font-black uppercase tracking-[0.32em] ${style.text}`}>
            FINAL FORENSIC VERDICT
          </p>
          <h2 className="mt-2 text-3xl font-black leading-none tracking-normal text-white sm:text-5xl lg:text-6xl">
            AI collapse assessment sealed
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Official engineering intelligence report generated from cross-agent
            evidence, risk projection, and forensic timeline reconstruction.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[470px]">
        <HeaderBadge icon="status" label="status" value={style.status} style={style} />
        <HeaderBadge icon="severity" label="severity" value={style.badge} style={style} />
        <HeaderBadge icon="authority" label="authority" value={style.authority} style={style} />
      </div>

      <span className="sr-only">{terminalId}</span>
    </motion.header>
  );
}

function HeaderBadge({
  icon,
  label,
  value,
  style,
}: {
  icon: "status" | "severity" | "authority";
  label: string;
  value: string;
  style: SeverityStyle;
}) {
  return (
    <motion.div
      className={`border ${style.softBorder} bg-slate-950/64 px-3 py-3`}
      variants={revealVariants}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-center justify-between gap-3">
        <HeaderIcon icon={icon} className={`h-4 w-4 ${style.text}`} />
        <motion.span
          className={`h-2 w-2 ${style.dot}`}
          animate={{
            opacity: [0.35, 1, 0.35],
            scale: [1, 1.6, 1],
            boxShadow: [
              "0 0 0 rgba(255,255,255,0)",
              `0 0 20px ${style.glow}`,
              "0 0 0 rgba(255,255,255,0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <p className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 break-words font-mono text-xs font-black uppercase ${style.text}`}>
        {value}
      </p>
    </motion.div>
  );
}

function VerdictList({
  title,
  eyebrow,
  icon,
  items,
  style,
}: {
  title: string;
  eyebrow: string;
  icon: "risk" | "failure";
  items: string[];
  style: SeverityStyle;
}) {
  return (
    <motion.section
      className={`relative overflow-hidden border ${style.softBorder} bg-slate-950/62 p-5 sm:p-6`}
      variants={revealVariants}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 85% 0%, ${style.halo}, transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent 42%)`,
        }}
      />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-11 w-11 place-items-center border ${style.softBorder} ${style.fill}`}>
              <ListIcon icon={icon} className={`h-5 w-5 ${style.text}`} />
            </div>
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-slate-500">
                {eyebrow}
              </p>
              <h3 className="mt-1 text-xl font-black uppercase tracking-[0.1em] text-white">
                {title}
              </h3>
            </div>
          </div>
          <ScanLine className={`h-5 w-5 ${style.text}`} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              className={`group/item relative overflow-hidden border ${style.softBorder} bg-slate-950/68 p-4`}
              variants={streamVariants}
              whileHover={{ y: -5, scale: 1.012 }}
            >
              <motion.div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent"
                style={{ color: style.line }}
                animate={{ x: ["-30%", "30%", "-30%"], opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.12 }}
              />
              <div className="relative flex items-start gap-3">
                <motion.span
                  className={`mt-1 grid h-7 w-7 shrink-0 place-items-center border ${style.softBorder} ${style.fill}`}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.1 }}
                >
                  <AlertTriangle className={`h-4 w-4 ${style.text}`} />
                </motion.span>
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function VerdictStat({
  icon,
  label,
  value,
  style,
}: {
  icon: "gauge" | "timer" | "radio";
  label: string;
  value: string;
  style: SeverityStyle;
}) {
  return (
    <motion.div
      className={`border ${style.softBorder} bg-slate-950/62 p-4`}
      variants={streamVariants}
      whileHover={{ y: -4 }}
    >
      <StatIcon icon={icon} className={`h-4 w-4 ${style.text}`} />
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 break-words font-mono text-xs font-black uppercase ${style.text}`}>
        {value}
      </p>
    </motion.div>
  );
}

function TypingDots({ className }: { className: string }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className={`h-1.5 w-1.5 ${className}`}
          animate={{ y: [0, -3, 0], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.14 }}
        />
      ))}
    </span>
  );
}

function SeverityGlyph({
  severity,
  className,
}: {
  severity: VerdictPanelProps["severity"];
  className: string;
}) {
  if (severity === "critical") {
    return <Siren className={className} />;
  }

  if (severity === "high") {
    return <AlertOctagon className={className} />;
  }

  if (severity === "medium") {
    return <ShieldAlert className={className} />;
  }

  return <ShieldAlert className={className} />;
}

function HeaderIcon({
  icon,
  className,
}: {
  icon: "status" | "severity" | "authority";
  className: string;
}) {
  if (icon === "status") {
    return <Radio className={className} />;
  }

  if (icon === "severity") {
    return <Siren className={className} />;
  }

  return <BrainCircuit className={className} />;
}

function ListIcon({
  icon,
  className,
}: {
  icon: "risk" | "failure";
  className: string;
}) {
  if (icon === "risk") {
    return <LockKeyhole className={className} />;
  }

  return <GitBranch className={className} />;
}

function StatIcon({
  icon,
  className,
}: {
  icon: "gauge" | "timer" | "radio";
  className: string;
}) {
  if (icon === "gauge") {
    return <Gauge className={className} />;
  }

  if (icon === "timer") {
    return <TimerReset className={className} />;
  }

  return <Zap className={className} />;
}

export default VerdictPanel;

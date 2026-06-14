"use client";

import { motion, type Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Brain,
  Clock3,
  Eye,
  Network,
  Radio,
  ScanLine,
  ShieldAlert,
  Terminal,
} from "lucide-react";

export interface AgentCardProps {
  role: string;
  message: string;
  confidence: number;
  status: "active" | "analyzing" | "warning";
  evidence: string[];
}

type StatusStyle = {
  label: string;
  accent: string;
  text: string;
  dot: string;
  border: string;
  softBorder: string;
  glow: string;
  halo: string;
  gradient: string;
  signal: string;
  scan: string;
};

const statusStyles: Record<AgentCardProps["status"], StatusStyle> = {
  active: {
    label: "ACTIVE",
    accent: "cyan",
    text: "text-cyan-200",
    dot: "bg-cyan-300",
    border: "border-cyan-300/40",
    softBorder: "border-cyan-300/18",
    glow: "rgba(34,211,238,0.42)",
    halo: "rgba(34,211,238,0.16)",
    gradient: "from-cyan-300 via-sky-400 to-blue-500",
    signal: "bg-cyan-300/12",
    scan: "rgba(34,211,238,0.28)",
  },
  analyzing: {
    label: "ANALYZING",
    accent: "violet",
    text: "text-violet-200",
    dot: "bg-violet-300",
    border: "border-violet-300/40",
    softBorder: "border-violet-300/18",
    glow: "rgba(167,139,250,0.42)",
    halo: "rgba(139,92,246,0.16)",
    gradient: "from-violet-300 via-fuchsia-400 to-cyan-300",
    signal: "bg-violet-300/12",
    scan: "rgba(167,139,250,0.28)",
  },
  warning: {
    label: "WARNING",
    accent: "red",
    text: "text-red-200",
    dot: "bg-red-300",
    border: "border-red-300/40",
    softBorder: "border-red-300/18",
    glow: "rgba(248,113,113,0.44)",
    halo: "rgba(248,113,113,0.15)",
    gradient: "from-red-300 via-orange-400 to-amber-200",
    signal: "bg-red-300/12",
    scan: "rgba(248,113,113,0.3)",
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.22 },
  },
};

export function AgentCard({
  role,
  message,
  confidence,
  status,
  evidence,
}: AgentCardProps) {
  const style = statusStyles[status];
  const confidenceValue = Math.max(0, Math.min(100, Math.round(confidence)));
  const normalizedEvidence = evidence.length > 0 ? evidence : ["no evidence linked"];
  const words = message.trim().length > 0 ? message.trim().split(/\s+/) : ["Awaiting", "forensic", "signal."];

  return (
    <motion.article
      className={`group relative isolate overflow-hidden border ${style.border} bg-slate-950/70 p-4 text-slate-100 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-5`}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -8, scale: 1.015 }}
      animate={{
        y: [0, -7, 0],
        boxShadow: [
          `0 24px 80px rgba(0,0,0,0.42), 0 0 20px ${style.halo}`,
          `0 32px 100px rgba(0,0,0,0.52), 0 0 46px ${style.glow}`,
          `0 24px 80px rgba(0,0,0,0.42), 0 0 20px ${style.halo}`,
        ],
      }}
      transition={{
        y: { duration: 6.2, repeat: Infinity, ease: "easeInOut" },
        boxShadow: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
      }}
      aria-label={`${role} AI investigator card`}
    >
      <div
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          background: `radial-gradient(circle at 82% 12%, ${style.halo}, transparent 30%), radial-gradient(circle at 12% 85%, rgba(34,211,238,0.08), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.075), transparent 32%, rgba(255,255,255,0.025))`,
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:26px_26px] opacity-45" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.18)_0_1px,transparent_1px),radial-gradient(circle_at_76%_38%,rgba(34,211,238,0.16)_0_1px,transparent_1px),radial-gradient(circle_at_48%_74%,rgba(167,139,250,0.14)_0_1px,transparent_1px)] bg-[size:23px_29px,31px_37px,43px_47px] opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(248,250,252,0.038)_0,rgba(248,250,252,0.038)_1px,transparent_1px,transparent_6px)] opacity-45 mix-blend-screen" />

      <motion.div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${style.text}`}
        animate={{ x: ["-40%", "40%", "-40%"], opacity: [0.28, 1, 0.28] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-current to-transparent"
        style={{ color: style.scan }}
        animate={{ y: ["-35%", "35%", "-35%"], opacity: [0.2, 0.9, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-130%", skewX: -12 }}
        animate={{ x: ["-130%", "130%"] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.header
        className="relative flex items-start justify-between gap-4"
        variants={childVariants}
      >
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            className={`relative grid h-12 w-12 shrink-0 place-items-center border ${style.border} bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-14 sm:w-14`}
            animate={{ rotate: [0, 1.5, -1.5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <AgentGlyph role={role} className={`h-6 w-6 ${style.text} sm:h-7 sm:w-7`} />
            <motion.span
              className={`absolute inset-0 border ${style.border}`}
              animate={{ scale: [1, 1.36, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          </motion.div>

          <div className="min-w-0">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-slate-500">
              AI Investigation Agent
            </p>
            <h3 className="mt-1 break-words text-base font-black uppercase tracking-[0.16em] text-white sm:text-lg">
              {role}
            </h3>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className={`inline-flex items-center gap-2 border ${style.softBorder} bg-slate-950/72 px-2.5 py-1.5`}>
            <motion.span
              className={`h-2 w-2 ${style.dot}`}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.45, 1, 0.45],
                boxShadow: [
                  "0 0 0 rgba(255,255,255,0)",
                  `0 0 22px ${style.glow}`,
                  "0 0 0 rgba(255,255,255,0)",
                ],
              }}
              transition={{ duration: 1.45, repeat: Infinity }}
            />
            <StatusGlyph status={status} className={`h-3.5 w-3.5 ${style.text}`} />
            <span className={`font-mono text-[0.63rem] font-bold tracking-[0.14em] ${style.text}`}>
              {style.label}
            </span>
          </div>
          <p className="mt-2 font-mono text-xl font-black leading-none text-white">
            {confidenceValue}
            <span className={`ml-1 text-xs ${style.text}`}>%</span>
          </p>
        </div>
      </motion.header>

      <motion.div className="relative mt-5" variants={childVariants}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">
            confidence signal
          </p>
          <p className={`font-mono text-xs ${style.text}`}>LOCK {confidenceValue}</p>
        </div>
        <div className="h-2 overflow-hidden bg-slate-900/92 shadow-[inset_0_1px_6px_rgba(0,0,0,0.55)]">
          <motion.div
            className={`h-full bg-gradient-to-r ${style.gradient}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${confidenceValue}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>

      <motion.section
        className={`relative mt-5 border ${style.softBorder} bg-slate-950/62 p-4`}
        variants={childVariants}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className={`h-4 w-4 ${style.text}`} />
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-slate-500">
              streaming analysis
            </p>
          </div>
          <TypingDots className={style.dot} />
        </div>

        <motion.p
          className="min-h-[4.75rem] text-sm leading-7 text-slate-200 sm:text-[0.95rem]"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.035,
              },
            },
          }}
        >
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              className="inline-block pr-1.5"
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            className={`ml-1 inline-block h-5 w-2 translate-y-1 ${style.dot}`}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
        </motion.p>
      </motion.section>

      <motion.section className="relative mt-4" variants={childVariants}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className={`h-4 w-4 ${style.text}`} />
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-slate-500">
              forensic observations
            </p>
          </div>
          <Activity className={`h-4 w-4 ${style.text}`} />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {buildObservations(confidenceValue, status, normalizedEvidence).map((observation, index) => (
            <motion.div
              key={observation.label}
              className={`border ${style.softBorder} bg-slate-950/54 p-3`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42, delay: index * 0.08 }}
            >
              <p className={`font-mono text-xs font-black ${style.text}`}>
                {observation.value}
              </p>
              <p className="mt-1 text-[0.64rem] uppercase tracking-[0.12em] text-slate-500">
                {observation.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section className="relative mt-4" variants={childVariants}>
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert className={`h-4 w-4 ${style.text}`} />
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-slate-500">
            evidence packets
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {normalizedEvidence.map((item, index) => (
            <motion.span
              key={`${item}-${index}`}
              className={`max-w-full break-words border ${style.softBorder} ${style.signal} px-2.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-slate-200`}
              initial={{ opacity: 0, scale: 0.86, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              animate={{
                boxShadow: [
                  "0 0 0 rgba(255,255,255,0)",
                  `0 0 18px ${style.halo}`,
                  "0 0 0 rgba(255,255,255,0)",
                ],
              }}
              transition={{
                opacity: { duration: 0.35, delay: index * 0.06 },
                scale: { duration: 0.35, delay: index * 0.06 },
                y: { duration: 0.35, delay: index * 0.06 },
                boxShadow: { duration: 2.1, repeat: Infinity, delay: index * 0.16 },
              }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </motion.section>
    </motion.article>
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

function AgentGlyph({ role, className }: { role: string; className: string }) {
  const normalized = role.toLowerCase();

  if (normalized.includes("security") || normalized.includes("threat")) {
    return <ShieldAlert className={className} />;
  }

  if (normalized.includes("timeline") || normalized.includes("reconstruct")) {
    return <Clock3 className={className} />;
  }

  if (normalized.includes("architect") || normalized.includes("system")) {
    return <Network className={className} />;
  }

  if (normalized.includes("forensic") || normalized.includes("analyst")) {
    return <Eye className={className} />;
  }

  if (normalized.includes("failure") || normalized.includes("predict")) {
    return <Brain className={className} />;
  }

  return <Brain className={className} />;
}

function StatusGlyph({
  status,
  className,
}: {
  status: AgentCardProps["status"];
  className: string;
}) {
  if (status === "active") {
    return <Radio className={className} />;
  }

  if (status === "analyzing") {
    return <ScanLine className={className} />;
  }

  return <AlertTriangle className={className} />;
}

function buildObservations(
  confidence: number,
  status: AgentCardProps["status"],
  evidence: string[],
) {
  const risk =
    status === "warning" ? "HIGH" : status === "analyzing" ? "ELEVATED" : "STABLE";

  return [
    {
      label: "risk pressure",
      value: risk,
    },
    {
      label: "evidence linked",
      value: evidence.length.toString().padStart(2, "0"),
    },
    {
      label: "model trust",
      value: `${confidence}%`,
    },
  ];
}

export default AgentCard;

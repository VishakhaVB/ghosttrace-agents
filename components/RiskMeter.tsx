"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Gauge,
  Radar,
  ScanLine,
  ShieldCheck,
  Siren,
  Waves,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface RiskMeterProps {
  score: number;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
}

type SeverityStyle = {
  badge: string;
  state: string;
  text: string;
  dot: string;
  border: string;
  softBorder: string;
  fill: string;
  halo: string;
  glow: string;
  arc: string;
  arcDim: string;
  gradientId: string;
  gradientStops: [string, string, string];
  ringShadow: string;
};

const severityStyles: Record<RiskMeterProps["severity"], SeverityStyle> = {
  low: {
    badge: "LOW",
    state: "stable telemetry",
    text: "text-cyan-200",
    dot: "bg-cyan-300",
    border: "border-cyan-300/40",
    softBorder: "border-cyan-300/18",
    fill: "bg-cyan-300/10",
    halo: "rgba(34,211,238,0.16)",
    glow: "rgba(34,211,238,0.42)",
    arc: "rgba(34,211,238,0.95)",
    arcDim: "rgba(34,211,238,0.16)",
    gradientId: "risk-low-gradient",
    gradientStops: ["#67e8f9", "#38bdf8", "#3b82f6"],
    ringShadow: "drop-shadow(0 0 16px rgba(34,211,238,0.72))",
  },
  medium: {
    badge: "MEDIUM",
    state: "drift under analysis",
    text: "text-violet-200",
    dot: "bg-violet-300",
    border: "border-violet-300/40",
    softBorder: "border-violet-300/18",
    fill: "bg-violet-300/10",
    halo: "rgba(139,92,246,0.16)",
    glow: "rgba(167,139,250,0.44)",
    arc: "rgba(167,139,250,0.95)",
    arcDim: "rgba(139,92,246,0.16)",
    gradientId: "risk-medium-gradient",
    gradientStops: ["#93c5fd", "#a78bfa", "#22d3ee"],
    ringShadow: "drop-shadow(0 0 16px rgba(167,139,250,0.7))",
  },
  high: {
    badge: "HIGH",
    state: "failure pressure rising",
    text: "text-amber-200",
    dot: "bg-amber-300",
    border: "border-amber-300/40",
    softBorder: "border-amber-300/18",
    fill: "bg-amber-300/10",
    halo: "rgba(251,191,36,0.15)",
    glow: "rgba(251,146,60,0.48)",
    arc: "rgba(251,191,36,0.98)",
    arcDim: "rgba(251,191,36,0.16)",
    gradientId: "risk-high-gradient",
    gradientStops: ["#fde68a", "#fb923c", "#ef4444"],
    ringShadow: "drop-shadow(0 0 18px rgba(251,146,60,0.74))",
  },
  critical: {
    badge: "CRITICAL",
    state: "collapse vector active",
    text: "text-red-200",
    dot: "bg-red-300",
    border: "border-red-300/45",
    softBorder: "border-red-300/20",
    fill: "bg-red-300/10",
    halo: "rgba(248,113,113,0.17)",
    glow: "rgba(248,113,113,0.56)",
    arc: "rgba(248,113,113,1)",
    arcDim: "rgba(248,113,113,0.18)",
    gradientId: "risk-critical-gradient",
    gradientStops: ["#fecaca", "#f87171", "#f97316"],
    ringShadow: "drop-shadow(0 0 20px rgba(248,113,113,0.86))",
  },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.78,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const diagnosticsBySeverity: Record<RiskMeterProps["severity"], string[]> = {
  low: [
    "Architectural signal remains coherent.",
    "No collapse cascade detected.",
    "AI model maintaining passive watch.",
  ],
  medium: [
    "Boundary drift requires active correlation.",
    "Dependency pressure entering analysis band.",
    "AI scanner tracking instability vectors.",
  ],
  high: [
    "Runtime pressure approaching breach threshold.",
    "Scaling bottleneck may amplify future deploy risk.",
    "AI model recommends immediate engineering review.",
  ],
  critical: [
    "System collapse vector is actively compounding.",
    "Authentication and dependency risk require intervention.",
    "AI scanner flags mission-critical instability.",
  ],
};

export function RiskMeter({ score, label, severity }: RiskMeterProps) {
  const style = severityStyles[severity];
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const [displayedScore, setDisplayedScore] = useState(0);
  const scoreMotion = useMotionValue(0);
  const smoothScore = useSpring(scoreMotion, { stiffness: 74, damping: 18, mass: 0.7 });
  const circumference = 2 * Math.PI * 82;
  const strokeDashoffset = useTransform(
    smoothScore,
    (value) => circumference - (value / 100) * circumference,
  );
  const diagnostics = diagnosticsBySeverity[severity];

  useEffect(() => {
    scoreMotion.set(normalizedScore);
  }, [normalizedScore, scoreMotion]);

  useMotionValueEvent(smoothScore, "change", (latest) => {
    setDisplayedScore(Math.round(latest));
  });

  return (
    <motion.article
      className={`group relative isolate overflow-hidden border ${style.border} bg-slate-950/72 p-4 text-slate-100 shadow-[0_30px_110px_rgba(0,0,0,0.52)] backdrop-blur-2xl sm:p-5 lg:p-6`}
      variants={panelVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -8, scale: 1.012 }}
      animate={{
        y: [0, -8, 0],
        boxShadow: [
          `0 28px 88px rgba(0,0,0,0.46), 0 0 22px ${style.halo}`,
          `0 36px 118px rgba(0,0,0,0.58), 0 0 56px ${style.glow}`,
          `0 28px 88px rgba(0,0,0,0.46), 0 0 22px ${style.halo}`,
        ],
      }}
      transition={{
        y: { duration: 6.8, repeat: Infinity, ease: "easeInOut" },
        boxShadow: {
          duration: severity === "critical" ? 1.55 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      aria-label={`${label} risk meter at ${normalizedScore} percent ${severity} severity`}
    >
      <BackgroundEffects style={style} critical={severity === "critical"} />

      <motion.header
        className="relative z-10 flex items-start justify-between gap-4"
        variants={childVariants}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BrainCircuit className={`h-4 w-4 ${style.text}`} />
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-slate-500">
              AI Risk Analysis Active
            </p>
          </div>
          <h3 className="mt-2 break-words text-xl font-black uppercase tracking-[0.12em] text-white sm:text-2xl">
            {label}
          </h3>
          <p className="mt-2 text-sm capitalize text-slate-400">{style.state}</p>
        </div>

        <div className={`shrink-0 border ${style.softBorder} ${style.fill} px-3 py-2 text-right`}>
          <div className="flex items-center justify-end gap-2">
            <motion.span
              className={`h-2 w-2 ${style.dot}`}
              animate={{
                scale: [1, 1.9, 1],
                opacity: [0.42, 1, 0.42],
                boxShadow: [
                  "0 0 0 rgba(255,255,255,0)",
                  `0 0 24px ${style.glow}`,
                  "0 0 0 rgba(255,255,255,0)",
                ],
              }}
              transition={{
                duration: severity === "critical" ? 1.05 : 1.55,
                repeat: Infinity,
              }}
            />
            <SeverityGlyph severity={severity} className={`h-4 w-4 ${style.text}`} />
          </div>
          <p className={`mt-2 font-mono text-xs font-black tracking-[0.18em] ${style.text}`}>
            {style.badge}
          </p>
        </div>
      </motion.header>

      <motion.div
        className="relative z-10 mt-6 grid gap-6 md:grid-cols-[minmax(240px,0.95fr)_minmax(0,1.05fr)] md:items-center"
        variants={childVariants}
      >
        <div className="relative mx-auto aspect-square w-full max-w-[310px]">
          <MeterSvg
            style={style}
            circumference={circumference}
            strokeDashoffset={strokeDashoffset}
            critical={severity === "critical"}
          />

          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <motion.div
                className={`mx-auto mb-3 grid h-12 w-12 place-items-center border ${style.softBorder} bg-slate-950/78`}
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Gauge className={`h-6 w-6 ${style.text}`} />
              </motion.div>
              <motion.p className="font-mono text-6xl font-black leading-none text-white sm:text-7xl">
                {displayedScore}
                <span className={`ml-1 text-2xl ${style.text}`}>%</span>
              </motion.p>
              <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-slate-500">
                live threat index
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <motion.div
            className={`mb-4 border ${style.softBorder} bg-slate-950/60 p-4`}
            variants={childVariants}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className={`h-4 w-4 ${style.text}`} />
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-slate-500">
                  diagnostic stream
                </p>
              </div>
              <TypingDots className={style.dot} />
            </div>

            <div className="mt-4 space-y-3">
              {diagnostics.map((line, index) => (
                <motion.div
                  key={line}
                  className="flex items-start gap-3 border border-white/8 bg-slate-950/58 px-3 py-2"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: index * 0.1 }}
                >
                  <motion.span
                    className={`mt-2 h-1.5 w-1.5 shrink-0 ${style.dot}`}
                    animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.45, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.16 }}
                  />
                  <p className="text-xs leading-5 text-slate-300 sm:text-sm">{line}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid gap-3 sm:grid-cols-3" variants={childVariants}>
            <DiagnosticTile
              icon="radar"
              label="scan mode"
              value="LIVE"
              style={style}
            />
            <DiagnosticTile
              icon="waves"
              label="instability"
              value={severity === "critical" ? "SPIKE" : severity === "low" ? "LOW" : "RISING"}
              style={style}
            />
            <DiagnosticTile
              icon="shield"
              label="state"
              value={style.badge}
              style={style}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function BackgroundEffects({
  style,
  critical,
}: {
  style: SeverityStyle;
  critical: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          background: `radial-gradient(circle at 50% 38%, ${style.halo}, transparent 34%), radial-gradient(circle at 88% 10%, rgba(34,211,238,0.08), transparent 24%), radial-gradient(circle at 12% 86%, rgba(167,139,250,0.08), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 34%, rgba(255,255,255,0.025))`,
        }}
      />
      <motion.div
        className="absolute -right-16 -top-16 -z-10 h-52 w-52 rounded-full blur-3xl"
        style={{ backgroundColor: style.halo }}
        animate={{ opacity: [0.34, critical ? 0.9 : 0.68, 0.34], scale: [1, 1.18, 1] }}
        transition={{ duration: critical ? 1.8 : 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 left-8 -z-10 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ opacity: [0.18, 0.48, 0.18], x: [0, 18, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:30px_30px] opacity-45" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(248,250,252,0.04)_0,rgba(248,250,252,0.04)_1px,transparent_1px,transparent_6px)] opacity-45 mix-blend-screen" />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-130%", skewX: -12 }}
        animate={{ x: ["-130%", "130%"] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent ${style.text}`}
        animate={{ x: ["-40%", "40%", "-40%"], opacity: [0.24, 1, 0.24] }}
        transition={{ duration: critical ? 1.7 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function MeterSvg({
  style,
  circumference,
  strokeDashoffset,
  critical,
}: {
  style: SeverityStyle;
  circumference: number;
  strokeDashoffset: ReturnType<typeof useTransform<number, number>>;
  critical: boolean;
}) {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <linearGradient id={style.gradientId} x1="24" x2="196" y1="24" y2="196">
          <stop offset="0%" stopColor={style.gradientStops[0]} />
          <stop offset="48%" stopColor={style.gradientStops[1]} />
          <stop offset="100%" stopColor={style.gradientStops[2]} />
        </linearGradient>
        <filter id={`${style.gradientId}-blur`}>
          <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.circle
        cx="110"
        cy="110"
        r="98"
        fill="none"
        stroke={style.arcDim}
        strokeWidth="1"
        strokeDasharray="4 8"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "110px 110px" }}
      />
      <motion.circle
        cx="110"
        cy="110"
        r="70"
        fill="none"
        stroke={style.arcDim}
        strokeWidth="1"
        strokeDasharray="2 7"
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "110px 110px" }}
      />

      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
        <motion.line
          key={angle}
          x1="110"
          y1="18"
          x2="110"
          y2="28"
          stroke={index % 2 === 0 ? style.arc : style.arcDim}
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{
            transformOrigin: "110px 110px",
            transform: `rotate(${angle}deg)`,
          }}
          animate={{ opacity: [0.28, 1, 0.28] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.08 }}
        />
      ))}

      <circle
        cx="110"
        cy="110"
        r="82"
        fill="none"
        stroke="rgba(15,23,42,0.92)"
        strokeWidth="14"
      />
      <circle
        cx="110"
        cy="110"
        r="82"
        fill="none"
        stroke={style.arcDim}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
      <motion.circle
        cx="110"
        cy="110"
        r="82"
        fill="none"
        stroke={`url(#${style.gradientId})`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        style={{
          strokeDashoffset,
          rotate: -90,
          transformOrigin: "110px 110px",
          filter: style.ringShadow,
        }}
        initial={{ strokeDashoffset: circumference }}
        filter={`url(#${style.gradientId}-blur)`}
      />

      <motion.path
        d="M110 16 A94 94 0 0 1 204 110"
        fill="none"
        stroke={style.arc}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="20 16"
        animate={{ rotate: 360, opacity: [0.32, 0.95, 0.32] }}
        transition={{
          rotate: { duration: 6.5, repeat: Infinity, ease: "linear" },
          opacity: { duration: critical ? 1.2 : 2.4, repeat: Infinity },
        }}
        style={{ transformOrigin: "110px 110px", filter: style.ringShadow }}
      />

      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "110px 110px" }}
      >
        <path
          d="M110 110 L110 18 A92 92 0 0 1 157 31 Z"
          fill={style.arc}
          opacity="0.16"
        />
        <line x1="110" y1="110" x2="110" y2="18" stroke={style.arc} strokeWidth="1.4" />
      </motion.g>

      <motion.circle
        cx="110"
        cy="110"
        r="46"
        fill="rgba(2,6,23,0.74)"
        stroke={style.arcDim}
        strokeWidth="1"
        animate={{ opacity: [0.72, 1, 0.72] }}
        transition={{ duration: critical ? 1.15 : 2.5, repeat: Infinity }}
      />
    </svg>
  );
}

function DiagnosticTile({
  icon,
  label,
  value,
  style,
}: {
  icon: "radar" | "waves" | "shield";
  label: string;
  value: string;
  style: SeverityStyle;
}) {
  return (
    <motion.div
      className={`border ${style.softBorder} bg-slate-950/58 p-3`}
      whileHover={{ y: -3 }}
      animate={{ opacity: [0.76, 1, 0.76] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <DiagnosticIcon icon={icon} className={`h-4 w-4 ${style.text}`} />
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 font-mono text-xs font-black ${style.text}`}>{value}</p>
    </motion.div>
  );
}

function DiagnosticIcon({
  icon,
  className,
}: {
  icon: "radar" | "waves" | "shield";
  className: string;
}) {
  if (icon === "radar") {
    return <Radar className={className} />;
  }

  if (icon === "waves") {
    return <Waves className={className} />;
  }

  return <ShieldCheck className={className} />;
}

function SeverityGlyph({
  severity,
  className,
}: {
  severity: RiskMeterProps["severity"];
  className: string;
}) {
  if (severity === "critical") {
    return <Siren className={className} />;
  }

  if (severity === "high") {
    return <AlertTriangle className={className} />;
  }

  if (severity === "medium") {
    return <ScanLine className={className} />;
  }

  return <ShieldCheck className={className} />;
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

export default RiskMeter;

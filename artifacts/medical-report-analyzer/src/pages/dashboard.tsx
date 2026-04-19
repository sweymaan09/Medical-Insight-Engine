import { useGetReportsSummary, useListReports } from "@workspace/api-client-react";
import { FileUpload } from "@/components/file-upload";
import { ReportCard } from "@/components/report-card";
import { Activity, AlertCircle, FileText, HeartPulse, CheckCircle2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const ORBS = [
  { size: 420, top: "-10%", left: "-8%", color: "radial-gradient(circle, rgba(20,184,166,0.28) 0%, transparent 70%)", dur: 12 },
  { size: 340, top: "30%", right: "-12%", color: "radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 70%)", dur: 16 },
  { size: 300, bottom: "10%", left: "20%", color: "radial-gradient(circle, rgba(52,211,153,0.20) 0%, transparent 70%)", dur: 14 },
  { size: 200, top: "55%", left: "60%", color: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)", dur: 10 },
];

function FloatingOrb({ orb, index }: { orb: typeof ORBS[0]; index: number }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: orb.size,
        height: orb.size,
        background: orb.color,
        borderRadius: "50%",
        top: orb.top,
        left: "left" in orb ? orb.left : undefined,
        right: "right" in orb ? (orb as any).right : undefined,
        bottom: "bottom" in orb ? (orb as any).bottom : undefined,
        filter: "blur(2px)",
        pointerEvents: "none",
      }}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{
        duration: orb.dur,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 1.5,
      }}
    />
  );
}

function HeartbeatLine() {
  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: 56 }}>
      <svg viewBox="0 0 600 56" className="w-full max-w-2xl" style={{ height: 56 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(20,184,166,0)" />
            <stop offset="30%" stopColor="rgba(20,184,166,0.8)" />
            <stop offset="70%" stopColor="rgba(34,211,238,0.8)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <motion.path
          d="M0,28 L80,28 L100,28 L115,8 L130,48 L145,14 L158,42 L168,28 L200,28 L280,28 L300,28 L315,8 L330,48 L345,14 L358,42 L368,28 L400,28 L480,28 L500,28 L515,8 L530,48 L545,14 L558,42 L568,28 L600,28"
          fill="none"
          stroke="url(#ecgGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.g
          animate={{ x: [0, 600] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 2 }}
        >
          <circle r="5" cx={0} cy={28} fill="rgba(52,211,153,0.9)" filter="url(#glow)" />
        </motion.g>
      </svg>
    </div>
  );
}

function FloatingParticle({ delay, startX, startY }: { delay: number; startX: string; startY: string }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: "rgba(52,211,153,0.7)",
        boxShadow: "0 0 8px rgba(52,211,153,0.8)",
        pointerEvents: "none",
      }}
      animate={{
        y: [0, -120],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 0.8, 0],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: "easeOut",
        delay,
      }}
    />
  );
}

const PARTICLES = [
  { delay: 0, startX: "10%", startY: "90%" },
  { delay: 1.2, startX: "25%", startY: "85%" },
  { delay: 2.4, startX: "40%", startY: "92%" },
  { delay: 0.8, startX: "55%", startY: "88%" },
  { delay: 1.9, startX: "70%", startY: "91%" },
  { delay: 3.1, startX: "82%", startY: "86%" },
  { delay: 0.4, startX: "90%", startY: "93%" },
  { delay: 2.7, startX: "5%", startY: "87%" },
];

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetReportsSummary();
  const { data: reports, isLoading: isReportsLoading } = useListReports();

  return (
    <div className="min-h-[100dvh] pb-20" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2137 30%, #0a2a2a 60%, #0d1f1f 100%)" }}>

      {/* Animated background orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {ORBS.map((orb, i) => <FloatingOrb key={i} orb={orb} index={i} />)}
        {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(16px)", background: "rgba(10,22,40,0.7)", borderBottom: "1px solid rgba(20,184,166,0.2)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
            style={{ color: "#2dd4bf" }}
          >
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartPulse className="w-6 h-6" style={{ color: "#f43f5e", filter: "drop-shadow(0 0 8px rgba(244,63,94,0.7))" }} />
            </motion.div>
            <span style={{ textShadow: "0 0 20px rgba(45,212,191,0.5)" }}>ClearHealth</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-medium"
            style={{ color: "rgba(45,212,191,0.6)" }}
          >
            Health Report Reader
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-12 relative" style={{ zIndex: 1 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="show">

          {/* Hero Section */}
          <motion.div variants={itemVariants} className="mb-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.3)", color: "#5eead4" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Health Explanation
            </motion.div>

            <h1
              className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #5eead4 40%, #22d3ee 70%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
              }}
            >
              Understand Your
              <br />
              Health Report
            </h1>

            <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(186,230,253,0.75)" }}>
              Upload your medical report photo or file. We will explain what each number means, what may have caused any problems, and what you can do at home.
            </p>
          </motion.div>

          {/* Heartbeat line */}
          <motion.div variants={itemVariants} className="mb-8">
            <HeartbeatLine />
          </motion.div>

          {/* Upload */}
          <motion.div variants={itemVariants} className="mb-12">
            <UploadWrapper>
              <FileUpload />
            </UploadWrapper>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            <NeonStatCard
              icon={FileText}
              glow="rgba(45,212,191,0.4)"
              border="rgba(45,212,191,0.25)"
              iconColor="#2dd4bf"
              label="Reports Uploaded"
              value={isSummaryLoading ? null : summary?.totalReports ?? 0}
            />
            <NeonStatCard
              icon={Activity}
              glow="rgba(251,146,60,0.4)"
              border="rgba(251,146,60,0.25)"
              iconColor="#fb923c"
              label="Reports with Issues"
              value={isSummaryLoading ? null : summary?.reportsWithAbnormal ?? 0}
            />
            <NeonStatCard
              icon={AlertCircle}
              glow="rgba(244,63,94,0.4)"
              border="rgba(244,63,94,0.25)"
              iconColor="#f43f5e"
              label="Reports with Urgent Values"
              value={isSummaryLoading ? null : summary?.reportsWithCritical ?? 0}
            />
          </motion.div>

          {/* Reports list */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold mb-6" style={{ color: "#e2e8f0" }}>Your Reports</h2>
            {isReportsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-36 w-full rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            ) : reports && reports.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {reports.map((report) => (
                  <motion.div key={report.id} variants={itemVariants}>
                    <ReportCard report={report} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(45,212,191,0.2)" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.3)" }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#2dd4bf" }} />
                </motion.div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#e2e8f0" }}>No reports yet</h3>
                <p style={{ color: "rgba(186,230,253,0.55)" }} className="max-w-xs mx-auto">
                  Upload your first medical report above to get started. We will explain it in simple words.
                </p>
              </motion.div>
            )}
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}

function UploadWrapper({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.4, scale: hovered ? 1.02 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", inset: -2, borderRadius: 20,
          background: "linear-gradient(135deg, rgba(20,184,166,0.4), rgba(34,211,238,0.3), rgba(167,139,250,0.3))",
          filter: "blur(8px)",
          zIndex: -1,
        }}
      />
      <div style={{
        borderRadius: 18,
        background: "rgba(10,22,40,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(45,212,191,0.25)",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </motion.div>
  );
}

function NeonStatCard({
  icon: Icon,
  glow,
  border,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType;
  glow: string;
  border: string;
  iconColor: string;
  label: string;
  value: number | null;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ position: "relative" }}
    >
      <motion.div
        animate={{ opacity: hovered ? 0.8 : 0.2 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", inset: -1, borderRadius: 18,
          background: `radial-gradient(circle at 50% 0%, ${glow}, transparent 70%)`,
          filter: "blur(6px)",
          zIndex: -1,
        }}
      />
      <div
        style={{
          padding: "1.25rem",
          borderRadius: 16,
          background: "rgba(10,22,40,0.75)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ boxShadow: hovered ? `0 0 16px ${glow}` : `0 0 0px transparent` }}
            transition={{ duration: 0.3 }}
            style={{
              padding: "0.6rem",
              borderRadius: 10,
              background: `${glow.replace("0.4", "0.1")}`,
              border: `1px solid ${border}`,
            }}
          >
            <Icon style={{ width: 18, height: 18, color: iconColor }} />
          </motion.div>
          <span className="text-sm font-medium" style={{ color: "rgba(186,230,253,0.7)" }}>{label}</span>
        </div>
        {value === null ? (
          <div style={{ height: 36, width: 64, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
        ) : (
          <motion.p
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-3xl font-black"
            style={{ color: iconColor, textShadow: `0 0 20px ${glow}` }}
          >
            {value}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

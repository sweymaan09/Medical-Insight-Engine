import { format } from "date-fns";
import { Link } from "wouter";
import { FileText, ChevronRight, Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Report } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function ReportCard({ report }: { report: Report }) {
  const isPending = report.status === "pending" || report.status === "analyzing";
  const hasCritical = (report.criticalCount || 0) > 0;
  const hasAbnormal = (report.abnormalCount || 0) > 0;
  const isError = report.status === "error";
  const [hovered, setHovered] = useState(false);

  const accentColor = hasCritical
    ? "#f43f5e"
    : hasAbnormal
    ? "#fb923c"
    : isPending
    ? "#2dd4bf"
    : isError
    ? "#94a3b8"
    : "#34d399";

  const accentGlow = hasCritical
    ? "rgba(244,63,94,0.35)"
    : hasAbnormal
    ? "rgba(251,146,60,0.35)"
    : isPending
    ? "rgba(45,212,191,0.35)"
    : isError
    ? "rgba(148,163,184,0.2)"
    : "rgba(52,211,153,0.35)";

  const statusLabel = isPending
    ? "Reading report..."
    : isError
    ? "Could not read file"
    : hasCritical
    ? `${report.criticalCount} Urgent`
    : hasAbnormal
    ? `${report.abnormalCount} Need attention`
    : "All looks good";

  return (
    <Link href={`/reports/${report.id}`} data-testid={`card-report-${report.id}`}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ position: "relative" }}
      >
        {/* Glow on hover */}
        <motion.div
          animate={{ opacity: hovered ? 0.7 : 0.15 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute", inset: -1, borderRadius: 18,
            background: `radial-gradient(circle at 50% 0%, ${accentGlow}, transparent 70%)`,
            filter: "blur(6px)",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderRadius: 16,
            padding: "1.25rem",
            background: "rgba(10,22,40,0.8)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${hovered ? accentColor + "50" : "rgba(255,255,255,0.08)"}`,
            cursor: "pointer",
            transition: "border-color 0.2s",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <motion.div
              animate={{
                boxShadow: hovered ? `0 0 16px ${accentGlow}` : `0 0 0 transparent`,
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {isPending ? (
                <Loader2 style={{ width: 18, height: 18, color: accentColor }} className="animate-spin" />
              ) : hasCritical ? (
                <AlertCircle style={{ width: 18, height: 18, color: accentColor }} />
              ) : hasAbnormal ? (
                <Activity style={{ width: 18, height: 18, color: accentColor }} />
              ) : isError ? (
                <FileText style={{ width: 18, height: 18, color: accentColor }} />
              ) : (
                <CheckCircle2 style={{ width: 18, height: 18, color: accentColor }} />
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate" style={{ color: "#e2e8f0" }}>
                {report.reportType || report.fileName}
              </h4>
              <p className="text-xs mt-0.5" style={{ color: "rgba(186,230,253,0.45)" }}>
                {format(new Date(report.uploadedAt), "d MMM yyyy")}
              </p>
            </div>

            <ChevronRight style={{ width: 16, height: 16, color: "rgba(186,230,253,0.3)", flexShrink: 0, marginTop: 2 }} />
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.3rem 0.9rem",
              borderRadius: 9999,
              width: "fit-content",
              color: accentColor,
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              animation: hasCritical ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" : undefined,
            }}
          >
            {statusLabel}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

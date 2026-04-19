import { LabValue } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, ChevronDown, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  normal: {
    icon: CheckCircle2,
    label: "All Good",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    barColor: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-500",
  },
  high: {
    icon: TrendingUp,
    label: "Too High",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    barColor: "bg-orange-400",
    pill: "bg-orange-100 text-orange-800",
    accent: "bg-orange-400",
  },
  low: {
    icon: TrendingDown,
    label: "Too Low",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    barColor: "bg-blue-400",
    pill: "bg-blue-100 text-blue-800",
    accent: "bg-blue-400",
  },
  critical: {
    icon: Zap,
    label: "Urgent",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    barColor: "bg-red-500",
    pill: "bg-red-100 text-red-800",
    accent: "bg-red-500",
  },
};

export function LabValueCard({ labValue, index = 0 }: { labValue: LabValue & { problem?: string; cause?: string; solution?: string }; index?: number }) {
  const [expanded, setExpanded] = useState(labValue.status === "critical");
  const config = STATUS_CONFIG[labValue.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.normal;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className={cn("rounded-2xl border overflow-hidden shadow-sm", config.border)}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full text-left transition-all duration-200",
          expanded ? config.bg : "bg-white hover:bg-slate-50"
        )}
        data-testid={`lab-card-${labValue.name}`}
      >
        <div className="p-4 flex items-center gap-4">
          {/* Left accent strip */}
          <div className={cn("w-1 self-stretch rounded-full min-h-[40px]", config.accent)} />

          {/* Icon */}
          <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", config.bg)}>
            <Icon
              className={cn("w-5 h-5", config.color, labValue.status === "critical" && "animate-pulse")}
            />
          </div>

          {/* Name and value */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm">{labValue.name}</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", config.pill)}>
                {config.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={cn("text-xl font-bold", config.color)}>{labValue.value}</span>
              <span className="text-xs text-slate-400">{labValue.unit}</span>
              <span className="text-xs text-slate-400 ml-1">Normal: {labValue.referenceRange}</span>
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 bg-white">
              {/* What does this test check */}
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">What is this test?</p>
                <p className="text-sm text-slate-700 leading-relaxed">{labValue.explanation}</p>
              </div>

              {labValue.status !== "normal" && (
                <>
                  {/* Problem */}
                  {labValue.problem && (
                    <div className={cn("rounded-xl p-3", config.bg)}>
                      <p className={cn("text-xs font-bold uppercase tracking-wide mb-1", config.color)}>
                        What is happening?
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">{labValue.problem}</p>
                    </div>
                  )}

                  {/* Cause */}
                  {labValue.cause && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                        Why did this happen?
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">{labValue.cause}</p>
                    </div>
                  )}

                  {/* Solution */}
                  {labValue.solution && (
                    <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                      <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1">
                        What can you do at home?
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">{labValue.solution}</p>
                    </div>
                  )}
                </>
              )}

              {labValue.status === "normal" && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Keep it up!</p>
                  <p className="text-sm text-slate-700">
                    {labValue.solution || "This value is healthy. Keep eating well and staying active."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

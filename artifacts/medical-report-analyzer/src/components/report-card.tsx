import { format } from "date-fns";
import { Link } from "wouter";
import { FileText, ChevronRight, Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Report } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ReportCard({ report }: { report: Report }) {
  const isPending = report.status === "pending" || report.status === "analyzing";
  const hasCritical = (report.criticalCount || 0) > 0;
  const hasAbnormal = (report.abnormalCount || 0) > 0;
  const isError = report.status === "error";

  return (
    <Link href={`/reports/${report.id}`} data-testid={`card-report-${report.id}`}>
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col h-full cursor-pointer"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            hasCritical ? "bg-red-50" : hasAbnormal ? "bg-orange-50" : isPending ? "bg-teal-50" : "bg-emerald-50"
          )}>
            {isPending ? (
              <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
            ) : hasCritical ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : hasAbnormal ? (
              <Activity className="w-5 h-5 text-orange-500" />
            ) : isError ? (
              <FileText className="w-5 h-5 text-slate-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm truncate">
              {report.reportType || report.fileName}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {format(new Date(report.uploadedAt), "d MMM yyyy")}
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
        </div>

        <div className={cn(
          "text-xs font-semibold px-3 py-1.5 rounded-full w-fit",
          isPending ? "bg-teal-50 text-teal-700" :
          isError ? "bg-slate-100 text-slate-500" :
          hasCritical ? "bg-red-50 text-red-700 animate-pulse" :
          hasAbnormal ? "bg-orange-50 text-orange-700" :
          "bg-emerald-50 text-emerald-700"
        )}>
          {isPending ? "Reading report..." :
           isError ? "Could not read file" :
           hasCritical ? `${report.criticalCount} Urgent` :
           hasAbnormal ? `${report.abnormalCount} Need attention` :
           "All looks good"}
        </div>
      </motion.div>
    </Link>
  );
}

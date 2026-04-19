import { useGetReportsSummary, useListReports } from "@workspace/api-client-react";
import { FileUpload } from "@/components/file-upload";
import { ReportCard } from "@/components/report-card";
import { Activity, AlertCircle, FileText, HeartPulse, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetReportsSummary();
  const { data: reports, isLoading: isReportsLoading } = useListReports();

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xl tracking-tight">
            <HeartPulse className="w-6 h-6" />
            <span>ClearHealth</span>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            Health Report Reader
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Hero */}
          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Understand Your Health Report
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Upload your medical report photo or file. We will explain what each number means, what may have caused any problems, and what you can do at home.
            </p>
          </motion.div>

          {/* Upload */}
          <motion.div variants={itemVariants} className="mb-12">
            <FileUpload />
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            <StatCard
              icon={FileText}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              label="Reports Uploaded"
              value={isSummaryLoading ? null : summary?.totalReports ?? 0}
            />
            <StatCard
              icon={Activity}
              iconBg="bg-orange-50"
              iconColor="text-orange-500"
              label="Reports with Issues"
              value={isSummaryLoading ? null : summary?.reportsWithAbnormal ?? 0}
            />
            <StatCard
              icon={AlertCircle}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              label="Reports with Urgent Values"
              value={isSummaryLoading ? null : summary?.reportsWithCritical ?? 0}
            />
          </motion.div>

          {/* Reports list */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Your Reports</h2>
            {isReportsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-36 w-full rounded-2xl" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl"
              >
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No reports yet</h3>
                <p className="text-slate-400 max-w-xs mx-auto">
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

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | null;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="font-medium text-slate-600 text-sm">{label}</h3>
      </div>
      {value === null ? (
        <Skeleton className="h-9 w-16" />
      ) : (
        <motion.p
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-3xl font-bold text-slate-900"
        >
          {value}
        </motion.p>
      )}
    </div>
  );
}

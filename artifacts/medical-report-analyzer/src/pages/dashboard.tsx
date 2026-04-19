import { useGetReportsSummary, useListReports } from "@workspace/api-client-react";
import { FileUpload } from "@/components/file-upload";
import { ReportCard } from "@/components/report-card";
import { Activity, AlertCircle, FileText, HeartPulse } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetReportsSummary();
  const { data: reports, isLoading: isReportsLoading } = useListReports();

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <HeartPulse className="w-6 h-6" />
            <span>ClearHealth</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Patient Portal
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-10">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight mb-3">
            Understand your health.
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Upload your lab results or medical reports. We'll explain them in simple English and highlight what needs your attention.
          </p>
        </div>

        <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
          <FileUpload />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-700">Total Reports</h3>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-10 w-20 mt-2" />
            ) : (
              <p className="text-3xl font-semibold text-slate-900">{summary?.totalReports || 0}</p>
            )}
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-700">Abnormal Findings</h3>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-10 w-20 mt-2" />
            ) : (
              <p className="text-3xl font-semibold text-slate-900">{summary?.reportsWithAbnormal || 0}</p>
            )}
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-700">Critical Alerts</h3>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-10 w-20 mt-2" />
            ) : (
              <p className="text-3xl font-semibold text-slate-900">{summary?.reportsWithCritical || 0}</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-slate-900 mb-6">Recent Reports</h2>
          {isReportsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report, index) => (
                <div key={report.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${index * 100}ms` }}>
                  <ReportCard report={report} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed rounded-xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No reports yet</h3>
              <p className="text-slate-500">Upload your first medical report to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
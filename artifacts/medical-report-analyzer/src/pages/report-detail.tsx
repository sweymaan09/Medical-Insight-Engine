import { useRoute, Link, useLocation } from "wouter";
import { useGetReport, getGetReportQueryKey, useDeleteReport, getListReportsQueryKey, getGetReportsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, HeartPulse, FileText, Calendar, User, Trash2, AlertCircle, Lightbulb, Apple, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabValueCard } from "@/components/lab-value-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const AnalyzingAnimation = () => (
  <div className="bg-white rounded-2xl border shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center">
        <HeartPulse className="w-10 h-10 text-teal-600" />
      </div>
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-teal-300"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-teal-200"
        animate={{ scale: [1, 1.7, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 mb-3">Reading your report...</h2>
    <p className="text-slate-500 max-w-sm mx-auto text-base leading-relaxed">
      We are looking at each number in your report and finding out what it means for your health. This takes about 15-20 seconds.
    </p>
    <div className="mt-8 flex gap-2 items-center">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-teal-500"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
    <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {["Finding numbers", "Checking levels", "Writing advice"].map((step, i) => (
        <motion.div
          key={step}
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 4, duration: 1, repeat: Infinity, repeatDelay: 12 - i }}
        >
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-1">
            <span className="text-teal-700 font-bold text-xs">{i + 1}</span>
          </div>
          <span className="text-xs text-slate-500">{step}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

export default function ReportDetail() {
  const [, params] = useRoute("/reports/:id");
  const id = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteReport = useDeleteReport();

  const { data: report, isLoading, isError } = useGetReport(id, {
    query: {
      enabled: !!id,
      queryKey: getGetReportQueryKey(id),
      refetchInterval: (data) => {
        const stateData = data as any;
        const status = stateData?.state?.data?.status || stateData?.status;
        return status === "analyzing" || status === "pending" ? 2000 : false;
      },
    }
  });

  const handleDelete = () => {
    deleteReport.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Report removed" });
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetReportsSummaryQueryKey() });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Could not remove report", variant: "destructive" });
      }
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-slate-800">Report Not Found</h2>
          <p className="text-slate-500 mb-6">This report was deleted or does not exist.</p>
          <Button asChild className="w-full">
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isProcessing = report?.status === "pending" || report?.status === "analyzing";

  const labValues = report?.labValues as Array<{
    name: string; value: string; unit: string; referenceRange: string;
    status: string; explanation: string; problem?: string; cause?: string; solution?: string;
  }> | null | undefined;

  const criticalValues = labValues?.filter(v => v.status === "critical") ?? [];
  const problemValues = labValues?.filter(v => v.status === "high" || v.status === "low") ?? [];
  const goodValues = labValues?.filter(v => v.status === "normal") ?? [];

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div className="flex items-center gap-2 text-teal-600 font-bold tracking-tight">
              <HeartPulse className="w-5 h-5" />
              <span className="hidden sm:inline">ClearHealth</span>
            </div>
          </div>

          {report && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete the report and all its results. You cannot undo this.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-48 w-full mt-8" />
          </div>
        ) : report ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* Title bar */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {report.reportType || "Medical Report"}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  {report.patientName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {report.patientName}
                    </div>
                  )}
                  {report.reportDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.reportDate}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Uploaded {format(new Date(report.uploadedAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>

              {/* Quick status pill */}
              {report.status === "done" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm",
                    report.criticalCount ? "bg-red-100 text-red-700 animate-pulse" :
                    report.abnormalCount ? "bg-orange-100 text-orange-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {report.criticalCount ? `⚡ ${report.criticalCount} Urgent` :
                   report.abnormalCount ? `${report.abnormalCount} Need Attention` :
                   "All Looks Good"}
                </motion.div>
              )}
            </div>

            {isProcessing ? (
              <AnalyzingAnimation />
            ) : report.status === "error" ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Could Not Read This File</h2>
                <p className="text-slate-500 mb-6">
                  The file may be blurry or not a medical report. Please try uploading a clearer image or a different file.
                </p>
                <Button onClick={handleDelete} variant="outline">Remove & Try Again</Button>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Overall Summary */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500 rounded-l-2xl" />
                  <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    What Your Report Says
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-base">
                    {report.simplifiedExplanation}
                  </p>
                </motion.section>

                {/* Health Advice */}
                {report.healthInsights && (
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-teal-50 rounded-2xl border border-teal-100 p-6 md:p-8"
                  >
                    <h3 className="text-base font-bold text-teal-800 mb-3 flex items-center gap-2">
                      <Apple className="w-4 h-4" />
                      What You Can Do to Feel Better
                    </h3>
                    <div className="space-y-2">
                      {report.healthInsights.split('\n').filter(Boolean).map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="text-slate-700 leading-relaxed text-sm"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Lab Values — critical first, then abnormal, then normal */}
                {labValues && labValues.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900">Your Test Results</h3>
                      <span className="text-sm text-slate-400">{labValues.length} tests checked</span>
                    </div>

                    <div className="space-y-3">
                      {/* Critical — shown open by default */}
                      {criticalValues.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Urgent Attention Needed</span>
                          </div>
                          {criticalValues.map((v, i) => (
                            <div key={v.name} className="mb-2">
                              <LabValueCard labValue={v as any} index={i} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Abnormal */}
                      {problemValues.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Needs Some Attention</span>
                          </div>
                          {problemValues.map((v, i) => (
                            <div key={v.name} className="mb-2">
                              <LabValueCard labValue={v as any} index={criticalValues.length + i} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Normal */}
                      {goodValues.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Healthy Values</span>
                          </div>
                          {goodValues.map((v, i) => (
                            <div key={v.name} className="mb-2">
                              <LabValueCard labValue={v as any} index={criticalValues.length + problemValues.length + i} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}

                {/* Reminder footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-slate-100 rounded-2xl p-5 flex gap-3 items-start"
                >
                  <Lightbulb className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-500 leading-relaxed">
                    This report explains your test results in simple words and gives home care tips. For serious illness or if you feel very unwell, please visit your nearest health center or government hospital.
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}

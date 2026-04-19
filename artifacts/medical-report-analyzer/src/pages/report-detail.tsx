import { useRoute, Link, useLocation } from "wouter";
import { useGetReport, getGetReportQueryKey, useDeleteReport, getListReportsQueryKey, getGetReportsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Loader2, HeartPulse, FileText, Calendar, User, Trash2, ShieldCheck, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabValueCard } from "@/components/lab-value-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
        const stateData = data as any; // Type cast due to generic return issues with orval sometimes
        // In react-query v5, refetchInterval receives the query state
        const status = stateData?.state?.data?.status || stateData?.status;
        return status === "analyzing" || status === "pending" ? 2000 : false;
      },
    }
  });

  const handleDelete = () => {
    deleteReport.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Report deleted" });
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetReportsSummaryQueryKey() });
        setLocation("/");
      },
      onError: (err) => {
        toast({ title: "Failed to delete", description: err.error || "Unknown error", variant: "destructive" });
      }
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-6">This report might have been deleted or doesn't exist.</p>
          <Button asChild className="w-full">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isProcessing = report?.status === "pending" || report?.status === "analyzing";

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
              <HeartPulse className="w-5 h-5" />
              <span className="hidden sm:inline">ClearHealth</span>
            </div>
          </div>
          
          {report && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the report and all its extracted data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
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
            <Skeleton className="h-12 w-3/4 max-w-lg" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-64 w-full mt-8" />
          </div>
        ) : report ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-slate-900 mb-3 flex items-center gap-3">
                  {report.reportType || "Medical Report"}
                  {report.status === "done" && (
                    <Badge variant={report.criticalCount ? "destructive" : report.abnormalCount ? "secondary" : "outline"} className={cn(
                      "text-sm px-3 py-1 ml-2 align-middle",
                      report.abnormalCount && !report.criticalCount ? "bg-amber-100 text-amber-800 border-amber-200" : "",
                      report.criticalCount ? "animate-pulse" : "",
                      !report.criticalCount && !report.abnormalCount ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
                    )}>
                      {report.criticalCount ? `${report.criticalCount} Critical` : 
                       report.abnormalCount ? `${report.abnormalCount} Abnormal` : "All Normal"}
                    </Badge>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  {report.patientName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" /> {report.patientName}
                    </div>
                  )}
                  {report.reportDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {format(new Date(report.reportDate), "MMMM d, yyyy")}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Uploaded {format(new Date(report.uploadedAt), "MMM d")}
                  </div>
                </div>
              </div>
            </div>

            {isProcessing ? (
              <div className="bg-white rounded-2xl border shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                </div>
                <h2 className="text-2xl font-serif text-slate-900 mb-2">Analyzing your results</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  Our secure AI is reading your document, extracting lab values, and preparing a simple explanation. This usually takes about 10-20 seconds.
                </p>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            ) : report.status === "error" ? (
              <div className="bg-destructive/5 rounded-2xl border border-destructive/20 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-medium text-slate-900 mb-2">Analysis Failed</h2>
                <p className="text-slate-600 mb-6">We couldn't read this document. It might be blurry, password protected, or not a standard medical report.</p>
                <Button onClick={handleDelete} variant="outline">Delete & Try Another</Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Simplified Explanation */}
                <section className="bg-white rounded-2xl border shadow-sm p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Plain English Summary
                  </h3>
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                    <p>{report.simplifiedExplanation}</p>
                  </div>
                </section>

                {/* Health Insights */}
                {report.healthInsights && (
                  <section className="bg-primary/5 rounded-2xl border border-primary/10 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-primary-foreground mb-4">
                      Key Takeaways & Next Steps
                    </h3>
                    <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed">
                      {report.healthInsights.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-3 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                  </section>
                )}

                {/* Lab Values */}
                {report.labValues && report.labValues.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900">Extracted Lab Results</h3>
                      <span className="text-sm text-slate-500 font-medium">{report.labValues.length} values found</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {report.labValues
                        // Sort so critical and high/low are at top
                        .sort((a, b) => {
                          const score = { critical: 3, high: 2, low: 2, normal: 0 };
                          return (score[b.status as keyof typeof score] || 0) - (score[a.status as keyof typeof score] || 0);
                        })
                        .map((value, i) => (
                          <LabValueCard key={i} labValue={value} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
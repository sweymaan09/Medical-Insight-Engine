import { format } from "date-fns";
import { Link } from "wouter";
import { FileText, ChevronRight, Activity, AlertCircle } from "lucide-react";
import { Report } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ReportCard({ report }: { report: Report }) {
  const isPending = report.status === "pending" || report.status === "analyzing";
  const hasCritical = (report.criticalCount || 0) > 0;
  const hasAbnormal = (report.abnormalCount || 0) > 0;

  return (
    <Link href={`/reports/${report.id}`} className="block group">
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30 h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {report.reportType || report.fileName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(report.uploadedAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <Badge 
              variant={isPending ? "secondary" : "outline"} 
              className="capitalize whitespace-nowrap"
            >
              {report.status}
            </Badge>
          </div>

          {!isPending && report.status === "done" && (
            <div className="mt-auto pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                {hasCritical ? (
                  <span className="flex items-center gap-1.5 text-destructive font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {report.criticalCount} Critical
                  </span>
                ) : hasAbnormal ? (
                  <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                    <Activity className="w-4 h-4" />
                    {report.abnormalCount} Abnormal
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">All normal</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
          
          {isPending && (
            <div className="mt-auto pt-4 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground animate-pulse">Analyzing results...</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
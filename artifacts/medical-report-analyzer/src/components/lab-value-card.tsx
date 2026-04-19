import { LabValue } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Activity, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function LabValueCard({ labValue }: { labValue: LabValue }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "normal":
        return {
          icon: CheckCircle2,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          badgeVariant: "outline" as const,
        };
      case "high":
      case "low":
        return {
          icon: Activity,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          badgeVariant: "secondary" as const,
        };
      case "critical":
        return {
          icon: AlertCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/5",
          borderColor: "border-destructive/30",
          badgeVariant: "destructive" as const,
        };
      default:
        return {
          icon: Activity,
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
          borderColor: "border-border",
          badgeVariant: "outline" as const,
        };
    }
  };

  const config = getStatusConfig(labValue.status);
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-200",
        config.borderColor,
        expanded ? "shadow-sm" : ""
      )}
    >
      <button 
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full text-left p-4 flex items-center justify-between hover:bg-accent/30 transition-colors",
          expanded ? config.bgColor : "bg-card"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-full", config.bgColor, config.color)}>
            <Icon className={cn("w-5 h-5", labValue.status === "critical" && "animate-pulse")} />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{labValue.name}</h4>
            <div className="flex items-baseline gap-2 mt-1 text-sm text-muted-foreground">
              <span className={cn("font-semibold text-base", config.color)}>
                {labValue.value}
              </span>
              <span>{labValue.unit}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={config.badgeVariant} className={cn("capitalize hidden sm:inline-flex", labValue.status === 'critical' ? 'animate-pulse' : '')}>
            {labValue.status}
          </Badge>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 bg-card border-t border-border/50 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                Your Result
              </span>
              <span className={cn("font-semibold text-lg", config.color)}>
                {labValue.value} {labValue.unit}
              </span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                Reference Range
              </span>
              <span className="font-medium text-foreground">
                {labValue.referenceRange}
              </span>
            </div>
          </div>
          <div className="bg-primary/5 p-4 rounded-lg text-sm text-foreground/90 leading-relaxed border border-primary/10">
            <strong>What this means:</strong> {labValue.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
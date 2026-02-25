import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: {
    /** Current value for the progress bar */
    current: number;
    /** Maximum value for the progress bar */
    max: number;
    /** Optional label shown below the bar, e.g. "67,432 / 100,000 events used" */
    label?: string;
  };
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MetricCard({
  label,
  value,
  subtitle,
  progress,
  className,
}: MetricCardProps) {
  const progressPercent = progress
    ? Math.min((progress.current / (progress.max || 1)) * 100, 100)
    : undefined;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        {/* Label */}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {/* Value */}
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}

        {/* Progress bar */}
        {progress && progressPercent !== undefined && (
          <div className="mt-4 space-y-1.5">
            <Progress value={progressPercent} className="h-2" />
            {progress.label && (
              <p className="text-xs text-muted-foreground">{progress.label}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

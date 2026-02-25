"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FunnelStep {
  name: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  title?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function conversionRate(current: number, previous: number): string {
  if (previous === 0) return "0%";
  return `${((current / previous) * 100).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Funnel chart component
// ---------------------------------------------------------------------------

export function FunnelChart({
  steps,
  title = "Funnel Analysis",
  className,
}: FunnelChartProps) {
  if (steps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No funnel steps to display.
        </CardContent>
      </Card>
    );
  }

  const maxValue = steps[0]?.value ?? 1;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        <TooltipProvider delayDuration={150}>
          {steps.map((step, index) => {
            const widthPercent = maxValue > 0
              ? Math.max((step.value / maxValue) * 100, 4)
              : 4;
            const overallPercent = maxValue > 0
              ? ((step.value / maxValue) * 100).toFixed(1)
              : "0.0";
            const stepConversion = index > 0
              ? conversionRate(step.value, steps[index - 1].value)
              : null;

            return (
              <div key={step.name}>
                {/* Conversion rate between steps */}
                {stepConversion && (
                  <div className="flex items-center gap-2 py-1.5 pl-3">
                    <svg
                      width="12"
                      height="16"
                      viewBox="0 0 12 16"
                      className="shrink-0 text-muted-foreground/50"
                    >
                      <path
                        d="M6 0 L6 12 L2 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs font-medium text-muted-foreground">
                      {stepConversion} conversion
                    </span>
                  </div>
                )}

                {/* Funnel bar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group flex items-center gap-3">
                      {/* Step label */}
                      <div className="w-28 shrink-0 text-right">
                        <p className="truncate text-sm font-medium">
                          {step.name}
                        </p>
                      </div>

                      {/* Bar container */}
                      <div className="relative flex-1">
                        <div
                          className={cn(
                            "relative h-10 rounded-lg transition-all duration-300 group-hover:opacity-90",
                          )}
                          style={{
                            width: `${widthPercent}%`,
                            background: `linear-gradient(90deg, ${step.color}, ${step.color}dd)`,
                          }}
                        >
                          {/* Value label inside bar */}
                          <span className="absolute inset-0 flex items-center px-3 text-sm font-semibold text-white">
                            {formatNumber(step.value)}
                          </span>
                        </div>
                      </div>

                      {/* Percentage */}
                      <div className="w-14 shrink-0 text-right">
                        <span className="text-sm font-medium text-muted-foreground">
                          {overallPercent}%
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">
                      <span className="font-semibold">{step.name}:</span>{" "}
                      {step.value.toLocaleString()} users ({overallPercent}% of
                      total)
                    </p>
                    {stepConversion && (
                      <p className="text-xs text-muted-foreground">
                        {stepConversion} from previous step
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>

        {/* Summary row */}
        <div className="flex items-center justify-between border-t pt-4 mt-3">
          <p className="text-sm text-muted-foreground">
            Overall conversion
          </p>
          <p className="text-sm font-semibold">
            {steps.length >= 2
              ? conversionRate(steps[steps.length - 1].value, steps[0].value)
              : "100%"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

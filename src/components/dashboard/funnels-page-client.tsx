"use client";

import { useState } from "react";
import { ArrowDown, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Funnel, FunnelStep } from "@/types";

// ---------------------------------------------------------------------------
// Helper: step color based on index
// ---------------------------------------------------------------------------

const STEP_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
];

function stepColor(idx: number): string {
  return STEP_COLORS[idx % STEP_COLORS.length];
}

// ---------------------------------------------------------------------------
// Helper: conversion rate between two consecutive steps
// ---------------------------------------------------------------------------

function stepConversion(current: FunnelStep, previous: FunnelStep): string {
  if (previous.count === 0) return "0%";
  return ((current.count / previous.count) * 100).toFixed(1) + "%";
}

// ---------------------------------------------------------------------------
// Funnel analysis client component
// ---------------------------------------------------------------------------

interface FunnelsPageClientProps {
  funnels: Funnel[];
}

export function FunnelsPageClient({ funnels }: FunnelsPageClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<string>("0");

  const funnel = funnels[parseInt(selectedIndex, 10)] ?? funnels[0];

  if (!funnel) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No funnels configured yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Funnel Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize user conversion through multi-step funnels.
          </p>
        </div>

        <Select value={selectedIndex} onValueChange={setSelectedIndex}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {funnels.map((f, i) => (
              <SelectItem key={f.id} value={String(i)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Funnel description card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {funnel.name}
            <Badge variant="secondary" className="ml-1">
              {funnel.totalEntries.toLocaleString()} entries
            </Badge>
          </CardTitle>
          <CardDescription>{funnel.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {funnel.steps.map((step, idx) => {
            const isLast = idx === funnel.steps.length - 1;
            const prevStep = idx > 0 ? funnel.steps[idx - 1] : null;

            return (
              <div key={step.name}>
                {/* Conversion arrow between steps */}
                {prevStep && (
                  <div className="flex items-center gap-2 py-2 pl-4">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {stepConversion(step, prevStep)} conversion
                    </span>
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs text-muted-foreground">
                      ({(prevStep.count - step.count).toLocaleString()} dropped)
                    </span>
                  </div>
                )}

                {/* Step bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {idx + 1}. {step.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-muted-foreground">
                        {step.count.toLocaleString()}
                      </span>
                      <Badge
                        variant={step.percentage === 100 ? "default" : "outline"}
                        className="w-14 justify-center tabular-nums"
                      >
                        {step.percentage}%
                      </Badge>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
                    <div
                      className={cn(
                        "flex h-full items-center rounded-md px-3 transition-all duration-700",
                        stepColor(idx)
                      )}
                      style={{ width: `${step.percentage}%` }}
                    >
                      {step.percentage > 15 && (
                        <span className="text-xs font-medium text-white">
                          {step.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isLast && <Separator className="my-1 opacity-0" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Overall stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Overall Conversion
            </p>
            <p className="mt-1 text-2xl font-bold">
              {funnel.steps[funnel.steps.length - 1].percentage}%
            </p>
            <p className="text-xs text-muted-foreground">
              {funnel.steps[0].name} &rarr;{" "}
              {funnel.steps[funnel.steps.length - 1].name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Biggest Drop-off</p>
            <p className="mt-1 text-2xl font-bold">
              {funnel.steps[0].name} &rarr; {funnel.steps[1].name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(
                ((funnel.steps[0].count - funnel.steps[1].count) /
                  funnel.steps[0].count) *
                100
              ).toFixed(1)}
              % drop
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Conversions</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {funnel.steps[funnel.steps.length - 1].count.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              in the selected period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

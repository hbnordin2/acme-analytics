"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { useWebSocket } from "@/hooks/use-websocket";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Animated number component
// ---------------------------------------------------------------------------

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;

    if (prev === value) return;

    const diff = value - prev;
    const steps = 20;
    const stepDuration = 300 / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(prev + diff * eased));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}

// ---------------------------------------------------------------------------
// Live visitors card
// ---------------------------------------------------------------------------

export function LiveVisitors({ className }: { className?: string }) {
  // Connect to the WebSocket for live updates
  useWebSocket();

  const liveVisitorCount = useAppStore((s) => s.liveVisitorCount);

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Pulsing green dot */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            Live Visitors
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            <AnimatedNumber value={liveVisitorCount} />
          </p>
        </div>

        <Eye className="h-5 w-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

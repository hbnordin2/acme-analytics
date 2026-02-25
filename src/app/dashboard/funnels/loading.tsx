import { Skeleton } from "@/components/ui/skeleton";

const FUNNEL_STEP_HEIGHTS = [100, 82, 60, 40, 24];

export default function FunnelsLoading() {
  return (
    <div className="space-y-6">
      {/* Heading + select */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Funnel steps */}
      <div className="rounded-xl border bg-card p-6 shadow">
        <div className="flex items-end justify-center gap-6 h-80">
          {FUNNEL_STEP_HEIGHTS.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton
                className="w-full rounded-t-md"
                style={{ height: `${h}%` }}
              />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

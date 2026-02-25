import { CardSkeleton } from "@/components/shared/loading-skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* 6 report cards in a grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

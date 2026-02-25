import { CardSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-6">
      {/* 3 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Events table */}
      <TableSkeleton rows={20} columns={7} />
    </div>
  );
}

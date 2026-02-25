import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function FilesLoading() {
  return (
    <div className="space-y-6">
      {/* Heading + toolbar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Files table */}
      <TableSkeleton rows={10} columns={4} />
    </div>
  );
}

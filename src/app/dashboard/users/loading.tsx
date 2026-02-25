import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Users table */}
      <TableSkeleton rows={15} columns={6} />
    </div>
  );
}

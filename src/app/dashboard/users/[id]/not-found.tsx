import Link from "next/link";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <UserX className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-sm text-muted-foreground">
          The user you are looking for does not exist or has been removed.
        </p>
      </div>
      <Button asChild variant="default">
        <Link href="/dashboard/users">Back to Users</Link>
      </Button>
    </div>
  );
}

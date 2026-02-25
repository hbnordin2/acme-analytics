import { DashboardLayout } from "@/components/layout/dashboard-layout";

// ---------------------------------------------------------------------------
// Dashboard layout – wraps all /dashboard/* routes in the shell with sidebar
// and header. Auth is enforced by Clerk middleware (src/middleware.ts).
//
// This is a Server Component that passes `children` into the client-side
// DashboardLayout shell (the "donut pattern"). Because `children` are
// resolved on the server, every dashboard page can be a Server Component
// while the surrounding chrome (sidebar, header, mobile sheet) stays client.
// ---------------------------------------------------------------------------

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

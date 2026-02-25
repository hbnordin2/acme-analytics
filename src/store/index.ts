import { create } from "zustand";
import type { Notification } from "@/types";

// -----------------------------------------------------------------------------
// Store shape
// -----------------------------------------------------------------------------

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Active project
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  // Date range filter (defaults to last 30 days)
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;

  // Live visitor count (updated via WebSocket)
  liveVisitorCount: number;
  setLiveVisitorCount: (count: number) => void;

  // In-app notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

let notificationCounter = 0;

function generateNotificationId(): string {
  notificationCounter += 1;
  return `notif_${Date.now()}_${notificationCounter}`;
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useAppStore = create<AppState>()((set) => ({
  // Sidebar -----------------------------------------------------------------
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Project -----------------------------------------------------------------
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  // Date range --------------------------------------------------------------
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  },
  setDateRange: (range) => set({ dateRange: range }),

  // Live visitors -----------------------------------------------------------
  liveVisitorCount: 0,
  setLiveVisitorCount: (count) => set({ liveVisitorCount: count }),

  // Notifications -----------------------------------------------------------
  notifications: [],
  addNotification: (notification) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        {
          ...notification,
          id: generateNotificationId(),
          createdAt: new Date(),
        },
      ],
    })),
  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

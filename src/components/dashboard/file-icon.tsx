import {
  File,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FolderOpen,
  Image,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileIconProps {
  mimeType?: string;
  isFolder?: boolean;
  className?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// MIME type to icon mapping
// ---------------------------------------------------------------------------

const MIME_ICON_MAP: Array<{ test: (mime: string) => boolean; icon: LucideIcon }> = [
  {
    test: (mime) => mime === "application/pdf",
    icon: FileText,
  },
  {
    test: (mime) => mime.startsWith("image/"),
    icon: Image,
  },
  {
    test: (mime) => mime === "text/csv" || mime === "application/vnd.ms-excel" || mime.includes("spreadsheet"),
    icon: FileSpreadsheet,
  },
  {
    test: (mime) => mime.startsWith("video/"),
    icon: FileVideo,
  },
  {
    test: (mime) =>
      mime === "application/json" ||
      mime === "application/xml" ||
      mime === "text/xml" ||
      mime === "text/html" ||
      mime === "text/javascript" ||
      mime === "application/javascript" ||
      mime === "application/typescript",
    icon: FileCode,
  },
  {
    test: (mime) =>
      mime.startsWith("text/") ||
      mime === "application/rtf" ||
      mime.includes("document"),
    icon: FileText,
  },
];

function resolveIcon(mimeType: string | undefined, isFolder: boolean | undefined): LucideIcon {
  if (isFolder) return FolderOpen;
  if (!mimeType) return File;

  const match = MIME_ICON_MAP.find((entry) => entry.test(mimeType));
  return match?.icon ?? File;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FileIcon({
  mimeType,
  isFolder,
  className,
  size = 20,
}: FileIconProps) {
  const Icon = resolveIcon(mimeType, isFolder);

  return (
    <Icon
      size={size}
      className={cn(
        isFolder ? "text-amber-500" : "text-muted-foreground",
        className,
      )}
    />
  );
}

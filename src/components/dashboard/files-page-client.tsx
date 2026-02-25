"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Folder,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  ChevronRight,
  Grid3X3,
  List,
  Trash2,
  Home,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFiles } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import type { FileItem, PaginatedResponse } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFileIcon(mimeType: string, isFolder?: boolean) {
  if (isFolder) return Folder;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("tar") ||
    mimeType.includes("gzip") ||
    mimeType.includes("rar")
  )
    return Archive;
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet")
  )
    return FileText;
  return File;
}

function getFileIconColor(mimeType: string, isFolder?: boolean): string {
  if (isFolder) return "text-blue-500";
  if (mimeType.startsWith("image/")) return "text-pink-500";
  if (mimeType.startsWith("video/")) return "text-purple-500";
  if (mimeType.startsWith("audio/")) return "text-amber-500";
  if (mimeType.includes("pdf")) return "text-red-500";
  if (mimeType.includes("zip") || mimeType.includes("tar"))
    return "text-orange-500";
  if (
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet")
  )
    return "text-emerald-500";
  return "text-muted-foreground";
}

function formatFileSize(sizeBytes: string): string {
  const bytes = Number(sizeBytes);
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function isFolderItem(file: FileItem): boolean {
  return file.isFolder;
}

// ---------------------------------------------------------------------------
// Breadcrumb type
// ---------------------------------------------------------------------------

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface FolderEntry {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FilesPageClientProps {
  initialData: PaginatedResponse<FileItem>;
  initialParentId: string | null;
}

// ---------------------------------------------------------------------------
// Files page client component
//
// Receives server-fetched initialData for the first render. Subsequent
// folder navigation and interactions use the client-side React Query hook
// with `initialData` so there is no flash of loading state on first paint.
// ---------------------------------------------------------------------------

export function FilesPageClient({
  initialData,
  initialParentId,
}: FilesPageClientProps) {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showTrash, setShowTrash] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [folderStack, setFolderStack] = useState<FolderEntry[]>([]);

  const currentFolderId = folderStack.length > 0
    ? folderStack[folderStack.length - 1].id
    : initialParentId;

  // Build breadcrumbs from the folder stack
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: "Files", path: "" }];
    for (const folder of folderStack) {
      items.push({ label: folder.name, path: folder.id });
    }
    return items;
  }, [folderStack]);

  const params = useMemo(
    () => ({
      ...(currentFolderId ? { parent_id: currentFolderId } : {}),
    }),
    [currentFolderId]
  );

  // Use initialData for the hook so the first render is instant
  const isInitialParams =
    folderStack.length === 0 &&
    (currentFolderId === initialParentId);

  const { data, isLoading, isError, refetch } = useFiles(params, {
    initialData: isInitialParams ? initialData : undefined,
  });

  const rawFiles = data?.data ?? [];

  // Client-side search filter (backend doesn't support search on files)
  const files = useMemo(() => {
    if (!searchQuery.trim()) return rawFiles;
    const q = searchQuery.toLowerCase();
    return rawFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [rawFiles, searchQuery]);

  const total = data?.total ?? files.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Navigate into a folder
  const navigateToFolder = useCallback((folderId: string, folderName: string) => {
    setFolderStack((prev) => [...prev, { id: folderId, name: folderName }]);
    setSearchQuery("");
    setPage(1);
  }, []);

  // Navigate to a specific breadcrumb level
  const navigateToBreadcrumb = useCallback((index: number) => {
    setFolderStack((prev) => prev.slice(0, index));
    setSearchQuery("");
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          {!isLoading && (
            <Badge variant="secondary" className="tabular-nums">
              {total.toLocaleString()} files
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Trash toggle */}
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="trash-toggle" className="text-sm">
              Trash
            </Label>
            <Switch
              id="trash-toggle"
              checked={showTrash}
              onCheckedChange={setShowTrash}
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={crumb.path} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {idx === 0 && <Home className="mr-1 h-3.5 w-3.5" />}
              <button
                onClick={() => navigateToBreadcrumb(idx)}
                className={cn(
                  "rounded-md px-1.5 py-0.5 hover:bg-muted",
                  isLast
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
                disabled={isLast}
              >
                {crumb.label}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* File listing */}
      {isLoading ? (
        <TableSkeleton rows={10} columns={5} />
      ) : isError ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Failed to load files. Please try again.
          </CardContent>
        </Card>
      ) : files.length === 0 ? (
        <EmptyState
          icon={showTrash ? Trash2 : Folder}
          title={showTrash ? "Trash is empty" : "No files found"}
          description={
            showTrash
              ? "There are no files in the trash."
              : searchQuery
                ? `No files match "${searchQuery}".`
                : "This folder is empty. Upload files to get started."
          }
          actionLabel={searchQuery ? "Clear Search" : undefined}
          onAction={
            searchQuery
              ? () => {
                  setSearchQuery("");
                  setPage(1);
                }
              : undefined
          }
        />
      ) : viewMode === "list" ? (
        /* ---- List view ---- */
        <Card>
          <CardContent className="px-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Modified
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="pr-6 text-right">
                    Created By
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => {
                  const mime = file.mimeType ?? "";
                  const folder = isFolderItem(file);
                  const IconComponent = getFileIcon(mime, folder);
                  const iconColor = getFileIconColor(mime, folder);

                  return (
                    <TableRow
                      key={file.id}
                      className={cn(
                        folder && "cursor-pointer hover:bg-muted/50"
                      )}
                      onClick={() => {
                        if (folder) navigateToFolder(file.id, file.name);
                      }}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={cn("h-5 w-5 shrink-0", iconColor)}
                          />
                          <span
                            className={cn(
                              "truncate",
                              folder && "font-medium"
                            )}
                          >
                            {file.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                        {folder ? "--" : formatFileSize(file.sizeBytes)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDistanceToNow(new Date(file.updatedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {folder
                          ? "Folder"
                          : mime.split("/").pop() ?? mime}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="font-mono text-xs text-muted-foreground">
                          {file.createdBy.slice(0, 8)}...
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ---- Grid view ---- */
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {files.map((file) => {
              const mime = file.mimeType ?? "";
              const folder = isFolderItem(file);
              const IconComponent = getFileIcon(mime, folder);
              const iconColor = getFileIconColor(mime, folder);

              return (
                <button
                  key={file.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:bg-muted/50",
                    folder && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (folder) navigateToFolder(file.id, file.name);
                  }}
                >
                  <IconComponent
                    className={cn("h-10 w-10", iconColor)}
                  />
                  <span
                    className={cn(
                      "w-full truncate text-sm",
                      folder && "font-medium"
                    )}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {folder ? "Folder" : formatFileSize(file.sizeBytes)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid view pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page >= totalPages}
              >
                Next
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

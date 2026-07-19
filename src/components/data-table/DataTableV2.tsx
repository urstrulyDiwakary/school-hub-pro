import { ReactNode, useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Download, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/app/feedback/Skeletons";
import { EmptyState } from "@/components/app/feedback/EmptyState";
import { ErrorState } from "@/components/app/feedback/ErrorState";

export interface BulkAction<T> {
  label: string;
  onClick: (rows: T[]) => void;
  destructive?: boolean;
  icon?: ReactNode;
}

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  destructive?: boolean;
  hidden?: (row: T) => boolean;
}

interface DataTableV2Props<T> {
  /** Stable id used for saved views / column state persistence. */
  tableId?: string;
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Global search across all string columns. */
  onGlobalSearch?: (value: string) => void;
  bulkActions?: BulkAction<T>[];
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  /** Enable sticky first column (useful for wide tables). */
  stickyFirstColumn?: boolean;
  pageSize?: number;
  className?: string;
  toolbarRight?: ReactNode;
  onExportCsv?: (rows: T[]) => void;
}

/**
 * Enterprise data table built on TanStack Table.
 *
 * Ships with: sticky header, optional sticky first column, sorting,
 * column visibility, global search, multi-select with bulk actions,
 * row context menu, pagination, and loading/empty/error states.
 */
export function DataTableV2<T>({
  tableId,
  data,
  columns,
  loading,
  error,
  onRetry,
  searchable = true,
  searchPlaceholder = "Search…",
  bulkActions = [],
  rowActions = [],
  onRowClick,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your search or filters.",
  emptyAction,
  stickyFirstColumn,
  pageSize = 20,
  className,
  toolbarRight,
  onExportCsv,
}: DataTableV2Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const persistKey = tableId ? `edutrack.table.${tableId}` : null;
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (!persistKey) return {};
    try {
      return JSON.parse(localStorage.getItem(`${persistKey}.visibility`) ?? "{}");
    } catch {
      return {};
    }
  });
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    if (!persistKey) return [];
    try {
      return JSON.parse(localStorage.getItem(`${persistKey}.order`) ?? "[]");
    } catch {
      return [];
    }
  });

  const enrichedColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const cols: ColumnDef<T, unknown>[] = [];
    if (bulkActions.length > 0) {
      cols.push({
        id: "__select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 36,
        enableSorting: false,
        enableHiding: false,
      });
    }
    cols.push(...columns);
    if (rowActions.length > 0) {
      cols.push({
        id: "__actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Row actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {rowActions
                .filter((a) => !a.hidden?.(row.original))
                .map((a) => (
                  <DropdownMenuItem
                    key={a.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      a.onClick(row.original);
                    }}
                    className={cn(a.destructive && "text-destructive focus:text-destructive")}
                  >
                    {a.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 48,
        enableSorting: false,
        enableHiding: false,
      });
    }
    return cols;
  }, [columns, bulkActions.length, rowActions]);

  const table = useReactTable({
    data,
    columns: enrichedColumns,
    state: { sorting, columnFilters, rowSelection, columnVisibility, columnOrder, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (persistKey) localStorage.setItem(`${persistKey}.visibility`, JSON.stringify(next));
        return next;
      });
    },
    onColumnOrderChange: (updater) => {
      setColumnOrder((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (persistKey) localStorage.setItem(`${persistKey}.order`, JSON.stringify(next));
        return next;
      });
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  if (loading) return <TableSkeleton rows={pageSize} cols={columns.length + 1} />;
  if (error) return <ErrorState description={error} onRetry={onRetry} />;

  const hasData = data.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-64 pl-8"
                aria-label="Search table"
              />
            </div>
          )}
          {selectedRows.length > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-sm">
              <span className="text-caption">{selectedRows.length} selected</span>
              {bulkActions.map((a) => (
                <Button
                  key={a.label}
                  size="sm"
                  variant={a.destructive ? "destructive" : "secondary"}
                  onClick={() => a.onClick(selectedRows)}
                  className="h-7"
                >
                  {a.icon}
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {toolbarRight}
          {onExportCsv && (
            <Button size="sm" variant="outline" onClick={() => onExportCsv(table.getFilteredRowModel().rows.map((r) => r.original))}>
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" aria-label="Configure columns">
                <Columns3 className="mr-1.5 h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllLeafColumns().filter((c) => c.getCanHide()).map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={c.getIsVisible()}
                  onCheckedChange={(v) => c.toggleVisibility(!!v)}
                >
                  {typeof c.columnDef.header === "string" ? c.columnDef.header : c.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="scroll-x-mobile max-h-[70vh] overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h, colIdx) => {
                    const canSort = h.column.getCanSort();
                    const sort = h.column.getIsSorted();
                    return (
                      <th
                        key={h.id}
                        style={{ width: h.getSize() }}
                        className={cn(
                          "border-b border-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                          stickyFirstColumn && colIdx === 0 && "sticky left-0 z-20 bg-muted/60",
                        )}
                      >
                        {h.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={cn(
                              "inline-flex items-center gap-1",
                              canSort && "cursor-pointer hover:text-foreground",
                            )}
                            onClick={h.column.getToggleSortingHandler()}
                            disabled={!canSort}
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {canSort &&
                              (sort === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : sort === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                              ))}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {!hasData || table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={enrichedColumns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      primaryAction={emptyAction}
                      className="rounded-none border-0"
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      onRowClick && "cursor-pointer",
                      row.getIsSelected() && "bg-primary/5",
                    )}
                  >
                    {row.getVisibleCells().map((cell, colIdx) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "border-b border-border px-3 py-3",
                          stickyFirstColumn && colIdx === 0 && "sticky left-0 z-10 bg-card",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {hasData && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-caption">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1} ·{" "}
            {table.getFilteredRowModel().rows.length} rows
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { ColumnOrderState, SortingState, VisibilityState } from "@tanstack/react-table";

export interface SavedView {
  id: string;
  name: string;
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  sorting: SortingState;
  filters?: Record<string, unknown>;
}

const key = (tableId: string) => `edutrack.table.${tableId}.views`;
const activeKey = (tableId: string) => `edutrack.table.${tableId}.active-view`;

export function useSavedViews(tableId: string) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setViews(JSON.parse(localStorage.getItem(key(tableId)) ?? "[]"));
      setActiveId(localStorage.getItem(activeKey(tableId)));
    } catch {
      /* ignore */
    }
  }, [tableId]);

  const persist = useCallback(
    (next: SavedView[]) => {
      setViews(next);
      localStorage.setItem(key(tableId), JSON.stringify(next));
    },
    [tableId],
  );

  const save = useCallback(
    (view: Omit<SavedView, "id"> & { id?: string }) => {
      const id = view.id ?? `v_${Date.now()}`;
      const next = [...views.filter((v) => v.id !== id), { ...view, id }];
      persist(next);
      setActiveId(id);
      localStorage.setItem(activeKey(tableId), id);
      return id;
    },
    [views, persist, tableId],
  );

  const remove = useCallback(
    (id: string) => {
      persist(views.filter((v) => v.id !== id));
      if (activeId === id) {
        setActiveId(null);
        localStorage.removeItem(activeKey(tableId));
      }
    },
    [views, activeId, persist, tableId],
  );

  const activate = useCallback(
    (id: string | null) => {
      setActiveId(id);
      if (id) localStorage.setItem(activeKey(tableId), id);
      else localStorage.removeItem(activeKey(tableId));
    },
    [tableId],
  );

  return { views, activeId, save, remove, activate };
}

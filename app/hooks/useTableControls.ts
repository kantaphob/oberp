/**
 * useTableControls — Reusable hook for paginated data tables.
 * Provides: search filtering, page-size selection, and pagination.
 *
 * @example
 * const { paged, tableProps } = useTableControls(myData, {
 *   searchKeys: ["name", "email"],
 *   defaultPerPage: 10,
 * });
 */

import { useState, useMemo, useCallback } from "react";

export interface TableControlOptions<T> {
  /** Keys of T to match against the search term (dot-notation not supported). */
  searchKeys?: (keyof T)[];
  /** Custom filter function, applied after searchKeys filter. */
  filterFn?: (item: T, search: string) => boolean;
  /** Initial page size. Default: 10 */
  defaultPerPage?: number;
}

export interface TableControlsState {
  search: string;
  perPage: number;
  page: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setSearch: (v: string) => void;
  setPerPage: (v: number) => void;
  setPage: (v: number) => void;
  prevPage: () => void;
  nextPage: () => void;
}

export interface UseTableControlsResult<T> {
  /** Current page items after filtering and pagination. */
  paged: T[];
  /** Filtered (but not paginated) items — useful for aggregate stats. */
  filtered: T[];
  /** State + setters, pass directly to <TableControls> component. */
  tableProps: TableControlsState;
}

export function useTableControls<T>(
  data: T[],
  options: TableControlOptions<T> = {}
): UseTableControlsResult<T> {
  const { searchKeys, filterFn, defaultPerPage = 10 } = options;

  const [search, setSearchRaw] = useState("");
  const [perPage, setPerPageRaw] = useState(defaultPerPage);
  const [page, setPageRaw] = useState(1);

  const setSearch = useCallback((v: string) => {
    setSearchRaw(v);
    setPageRaw(1);
  }, []);

  const setPerPage = useCallback((v: number) => {
    setPerPageRaw(v);
    setPageRaw(1);
  }, []);

  const setPage = useCallback((v: number) => setPageRaw(v), []);
  const prevPage = useCallback(() => setPageRaw(p => Math.max(1, p - 1)), []);
  const nextPage = useCallback(
    () => setPageRaw(p => p + 1), // capped in the memo below
    []
  );

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return data;
    return data.filter(item => {
      if (filterFn) return filterFn(item, term);
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some(key => {
          const val = item[key];
          return String(val ?? "").toLowerCase().includes(term);
        });
      }
      // Fallback: stringify whole item
      return JSON.stringify(item).toLowerCase().includes(term);
    });
  }, [data, search, searchKeys, filterFn]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(page, totalPages);

  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const endIndex = Math.min(safePage * perPage, totalItems);

  const paged = useMemo(
    () => filtered.slice((safePage - 1) * perPage, safePage * perPage),
    [filtered, safePage, perPage]
  );

  return {
    paged,
    filtered,
    tableProps: {
      search,
      perPage,
      page: safePage,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      setSearch,
      setPerPage,
      setPage,
      prevPage,
      nextPage,
    },
  };
}

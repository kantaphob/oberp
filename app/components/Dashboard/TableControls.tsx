"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { TableControlsState } from "@/app/hooks/useTableControls";

interface TableControlsProps {
  /** Pass directly from useTableControls().tableProps */
  table: TableControlsState;
  /** Label shown next to the total, e.g. "รายการ" or "พนักงาน". Default: "รายการ" */
  entityLabel?: string;
  /** Page-size options. Default: [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Search input placeholder. */
  searchPlaceholder?: string;
  /** Extra content to render between Search and Pagination (e.g. Export button) */
  actions?: React.ReactNode;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function TableControls({
  table,
  entityLabel = "รายการ",
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  searchPlaceholder = "ค้นหา...",
  actions,
  className = "",
}: TableControlsProps) {
  const {
    search,
    perPage,
    page,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    setSearch,
    setPerPage,
    setPage,
    prevPage,
    nextPage,
  } = table;

  /* ── Compact page buttons (max 5 visible) ── */
  const pageButtons = buildPageButtons(page, totalPages);

  return (
    <div className={`tc-wrapper ${className}`}>
      {/* ── Top Row: Show Entries + Search + Actions ── */}
      <div className="tc-top-row">
        {/* Show [N] Entries */}
        <div className="tc-show-entries">
          <span className="tc-soft-label">แสดง</span>
          <select
            className="tc-select"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="tc-soft-label">{entityLabel}</span>
        </div>

        <div className="tc-right-cluster">
          {/* Custom action slot */}
          {actions && <div className="tc-actions">{actions}</div>}

          {/* Search */}
          <div className="tc-search-wrap">
            <Search size={13} className="tc-search-icon" />
            <input
              type="text"
              className="tc-search-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Info + Pagination ── */}
      <div className="tc-bottom-row">
        {/* Showing X to Y of Z entries */}
        <span className="tc-info">
          {totalItems === 0 ? (
            <span>ไม่พบข้อมูล</span>
          ) : (
            <>
              แสดง <strong>{startIndex}</strong> – <strong>{endIndex}</strong>{" "}
              จากทั้งหมด <strong>{totalItems}</strong> {entityLabel}
            </>
          )}
        </span>

        {/* Pagination */}
        <div className="tc-pagination">
          <button
            className="tc-pg-btn"
            disabled={page <= 1}
            onClick={prevPage}
            aria-label="ก่อนหน้า"
          >
            <ChevronLeft size={14} />
          </button>

          {pageButtons.map((btn, i) =>
            btn === "..." ? (
              <span key={`ellipsis-${i}`} className="tc-pg-ellipsis">
                …
              </span>
            ) : (
              <button
                key={btn}
                className={`tc-pg-btn ${btn === page ? "tc-pg-active" : ""}`}
                onClick={() => setPage(btn as number)}
              >
                {btn}
              </button>
            ),
          )}

          <button
            className="tc-pg-btn"
            disabled={page >= totalPages}
            onClick={nextPage}
            aria-label="ถัดไป"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Build visible page numbers with ellipsis collapsing. */
function buildPageButtons(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

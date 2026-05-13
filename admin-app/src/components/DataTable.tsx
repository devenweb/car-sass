"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  pageSize: initialPageSize = 10,
  searchPlaceholder = "Search...",
  onRowClick,
  emptyMessage = "No data found."
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        let aValue = sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a);
        let bValue = sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b);

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return sortedData.filter((item: any) => {
      const searchStr = searchTerm.toLowerCase();
      return columns.some(col => {
        if (!col.accessorKey) return false;
        const val = col.accessorKey.toString().split('.').reduce((obj, key) => obj?.[key], item);
        return val?.toString().toLowerCase().includes(searchStr);
      });
    });
  }, [sortedData, searchTerm, columns]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rows:</span>
            <select 
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black focus:outline-none"
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={cn(
                      "px-6 py-4",
                      col.sortable && "cursor-pointer hover:bg-slate-100/50 transition-colors group",
                      col.className
                    )}
                    onClick={() => col.sortable && col.accessorKey && requestSort(col.accessorKey.toString())}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && col.accessorKey && (
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronUp size={10} className={cn(sortConfig?.key === col.accessorKey && sortConfig.direction === 'asc' ? 'text-primary' : 'text-slate-300')} />
                          <ChevronDown size={10} className={cn(sortConfig?.key === col.accessorKey && sortConfig.direction === 'desc' ? 'text-primary' : 'text-slate-300')} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-3 bg-slate-100 rounded w-full"></div></td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "hover:bg-slate-50/50 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={cn("px-6 py-3.5", col.className)}>
                        {col.cell ? col.cell(item) : (col.accessorKey ? (col.accessorKey.toString().split('.').reduce((obj, key) => obj?.[key], item) as React.ReactNode) : null)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-400 font-bold text-xs">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > pageSize && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronsLeft size={14} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-7 h-7 rounded-lg text-[10px] font-black transition-all border",
                        currentPage === pageNum 
                          ? "bg-primary text-white border-primary shadow-sm" 
                          : "bg-white text-slate-400 border-slate-200 hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={14} />
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

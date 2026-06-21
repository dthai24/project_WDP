import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  pagination = { total: 0, page: 1, limit: 10, pages: 1 },
  onPageChange = () => {},
  searchPlaceholder = "Search...",
  onSearch = () => {},
  filters = [],
  onFilterChange = () => {},
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <div key={filter.key} className="flex items-center gap-1.5">
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer font-medium"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table & Mobile Card Layout */}
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-xs">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        <div className="w-full overflow-x-auto">
          {data.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm font-medium">
              No data available.
            </div>
          ) : (
            <table className="w-full text-left border-collapse block md:table">
              {/* Header - Hidden on mobile */}
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600 hidden md:table-header-group">
                <tr className="md:table-row">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-6 py-4 md:table-cell ${col.className || ""}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100 text-slate-700 block md:table-row-group">
                {data.map((item, rowIdx) => (
                  <tr
                    key={item._id || rowIdx}
                    className="hover:bg-slate-50/30 transition-colors block md:table-row p-4 mb-4 border border-slate-100 md:border-0 rounded-2xl bg-white md:bg-transparent shadow-xs md:shadow-none"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        data-label={col.label}
                        className={`block md:table-cell px-2 py-2 md:px-6 md:py-4 border-b border-slate-100/50 md:border-b-0 last:border-b-0 flex justify-between items-center md:block text-right md:text-left text-sm ${
                          col.className || ""
                        }`}
                      >
                        {/* Mobile label */}
                        <span className="md:hidden font-semibold text-slate-400 text-xs uppercase mr-4">
                          {col.label}
                        </span>
                        
                        {/* Value / Custom Render */}
                        <div className="text-slate-800 font-medium">
                          {col.render ? col.render(item) : item[col.key]}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="flex items-center text-xs md:text-sm text-slate-500 font-medium">
            Showing page <span className="font-bold text-slate-800 mx-1">{pagination.page}</span> of <span className="font-bold text-slate-800 mx-1">{pagination.pages}</span> pages ({pagination.total} rows)
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-line">
      <p className="text-xs text-muted">
        Showing {startItem}–{endItem} of {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-sm border border-line text-muted hover:text-ink hover:border-brand-500/40 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`h-7 w-7 rounded-sm text-xs font-medium transition-colors ${
                pageNum === currentPage
                  ? "bg-brand-500 text-white"
                  : "text-muted hover:text-ink hover:bg-brand-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-sm border border-line text-muted hover:text-ink hover:border-brand-500/40 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

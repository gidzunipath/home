"use client";

export default function FeedbackPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-appleGray-200 bg-appleGray-50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-appleGray-500">
        Showing {start}–{end} of {totalItems}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-lg border border-appleGray-200 bg-white px-3 py-1.5 text-xs font-medium text-appleGray-600 transition-colors hover:bg-appleGray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[2rem] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-sky-500 text-white"
                  : "border border-appleGray-200 bg-white text-appleGray-600 hover:bg-appleGray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-appleGray-200 bg-white px-3 py-1.5 text-xs font-medium text-appleGray-600 transition-colors hover:bg-appleGray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

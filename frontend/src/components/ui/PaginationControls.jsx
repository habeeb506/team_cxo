import Button from './Button.jsx';

/**
 * Pagination footer driven by a backend pagination object
 * ({ page, limit, total, totalPages }, see backend/src/utils/apiResponse.js)
 * and a page-change callback. Every table page renders this the same way.
 */
export default function PaginationControls({ pagination, onPageChange }) {
  if (!pagination) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-2 py-3 text-sm text-slate-600">
      <span>
        Page {page} of {totalPages} &middot; {total} total
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

import { Button } from "./Button";
import { Select } from "./Form";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const PAGE_SIZES = [10, 20, 50, 100];

export function PaginationControls({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) {
  const safeTotal = Math.max(1, totalPages);
  return (
    <div className="flex flex-wrap items-center justify-between gap-sm border-t border-border pt-md text-xs text-muted">
      <div className="flex flex-wrap items-center gap-sm">
        <span>
          Page {page} of {safeTotal}
        </span>
        <span>• Total {total}</span>
      </div>
      <div className="flex items-center gap-sm">
        <Select
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(safeTotal, page + 1))} disabled={page >= safeTotal}>
          Next
        </Button>
      </div>
    </div>
  );
}

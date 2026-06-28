import React, { FC } from 'react';
import { COLOR } from '../../styles/tokens';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination: FC<PaginationProps> = React.memo(({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  // todo gets too long when too many pages, fix: show first 3 pages, gap, [prev, current, next], gap, last 3 pages
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btnColor = (active: boolean, isOff: boolean) => {
    if (isOff) return COLOR.TEXT_DISABLED;
    if (active) return COLOR.WHITE;
    return COLOR.TEXT_SECONDARY;
  };

  const btnStyle = (active: boolean, isOff: boolean): React.CSSProperties => ({
    background: active ? COLOR.PRIMARY : COLOR.BG_RAISED,
    color: btnColor(active, isOff),
    border: `1px solid ${COLOR.BORDER}`,
    borderRadius: 'var(--radius-sm)',
    padding: '4px 10px',
    fontSize: 13,
    cursor: isOff ? 'not-allowed' : 'pointer',
    minWidth: 32,
  });

  return (
    <div style={{
      display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px',
    }}
    >
      <button
        type="button"
        style={btnStyle(false, disabled || currentPage === 1)}
        disabled={disabled || currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          style={btnStyle(p === currentPage, disabled)}
          disabled={disabled}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        style={btnStyle(false, disabled || currentPage === totalPages)}
        disabled={disabled || currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
});

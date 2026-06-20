import React, { FC } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = React.memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btnStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
    background: active ? "#6c63ff" : "#1e1e2e",
    color: disabled ? "#555" : active ? "#fff" : "#e0e0f0",
    border: "1px solid #2a2a35",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    minWidth: 32,
  });

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
      <button
        style={btnStyle(false, currentPage === 1)}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      {pages.map(p => (
        <button
          key={p}
          style={btnStyle(p === currentPage, false)}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        style={btnStyle(false, currentPage === totalPages)}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
});

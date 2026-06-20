import React, { FC } from "react";

interface WinnerBannerProps {
  winner: { name: string; time: number } | null;
  onClose: () => void;
}

export const WinnerBanner: FC<WinnerBannerProps> = React.memo(function WinnerBanner({ winner, onClose }) {
  if (!winner) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#6c63ff",
        color: "#fff",
        padding: "14px 28px",
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 16,
        zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <span>Winner: {winner.name} — {winner.time.toFixed(2)}s</span>
      <button
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "#fff",
          borderRadius: 4,
          padding: "4px 10px",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        ✕
      </button>
    </div>
  );
});

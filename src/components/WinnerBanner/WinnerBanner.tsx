import React, { FC, useEffect, useRef } from "react";
import { Icon } from "../Icon";

const AUTO_DISMISS_MS = 5000;

interface WinnerBannerProps {
  winner: { name: string; time: number } | null;
  onClose: () => void;
  resetKey: number;
}

export const WinnerBanner: FC<WinnerBannerProps> = React.memo(function WinnerBanner({ winner, onClose, resetKey }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!winner) return;
    const timer = setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [winner, resetKey]);

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
      <Icon name="trophy" size={20} />
      <span>Winner: {winner.name} — {winner.time.toFixed(2)}s</span>
      <button
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "#fff",
          borderRadius: 4,
          padding: "4px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon name="cancel" size={14} />
      </button>
    </div>
  );
});

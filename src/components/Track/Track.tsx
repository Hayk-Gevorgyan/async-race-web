import React, { FC, useState, useEffect } from "react";
import { CarProps }                        from "../Car";
import { Car }                             from "../Car";
import { Icon }                            from "../Icon";

const CAR_WIDTH    = 160;
const CAR_HEIGHT   = 90;
const TRACK_HEIGHT = CAR_HEIGHT + 24;
const PANEL_WIDTH  = 220;

export type RaceStatus = "idle" | "starting" | "racing" | "broken" | "finished";

export interface CarRaceState {
  status: RaceStatus;
  progress: number;
  transitionDuration: number;
}

interface TrackProps {
  car: CarProps;
  raceState: CarRaceState;
  onEdit:   (car: CarProps) => void;
  onDelete: (id: number) => void;
  onStart:  (car: CarProps) => void;
  onStop:   (id: number) => void;
}

const panelBtnStyle: React.CSSProperties = {
  background: "#1e1e2e",
  color: "#e0e0f0",
  border: "1px solid #2a2a35",
  borderRadius: 4,
  padding: "3px 10px",
  fontSize: 12,
  cursor: "pointer",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

export const Track: FC<TrackProps> = React.memo(function Track({
  car,
  raceState,
  onEdit,
  onDelete,
  onStart,
  onStop,
}) {
  const [displayProgress, setDisplayProgress]     = useState(0);
  const [displayTransition, setDisplayTransition] = useState(0);

  useEffect(() => {
    if (raceState.status === "racing") {
      setDisplayProgress(0);
      setDisplayTransition(0);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisplayProgress(1);
          setDisplayTransition(raceState.transitionDuration);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setDisplayProgress(raceState.progress);
      setDisplayTransition(0);
    }
  }, [raceState.status, raceState.transitionDuration, raceState.progress]);

  const isActive = raceState.status === "starting" || raceState.status === "racing";
  const isBroken = raceState.status === "broken";

  return (
    <div style={{ display: "flex", width: "100%", height: TRACK_HEIGHT, borderBottom: "2px solid #2a2a35" }}>
      <div
        style={{
          width: PANEL_WIDTH,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
          padding: "0 12px",
          background: "#16161e",
          borderRight: "2px solid #2a2a35",
        }}
      >
        {isActive ? (
          <button style={{ ...panelBtnStyle, color: "#fbbf24" }} onClick={() => onStop(car.id)}>
            <Icon name="cancel" size={11} color="#fbbf24" /> Stop
          </button>
        ) : (
          <button style={panelBtnStyle} onClick={() => onStart(car)}>
            <Icon name="flag" size={11} /> Start
          </button>
        )}
        <button
          style={{ ...panelBtnStyle, color: isActive ? "#555" : "#a78bfa", cursor: isActive ? "not-allowed" : "pointer" }}
          onClick={() => onEdit(car)}
          disabled={isActive}
        >
          <Icon name="pencil" size={11} color={isActive ? "#555" : "#a78bfa"} /> Edit
        </button>
        <button
          style={{ ...panelBtnStyle, color: isActive ? "#555" : "#f87171", cursor: isActive ? "not-allowed" : "pointer" }}
          onClick={() => onDelete(car.id)}
          disabled={isActive}
        >
          <Icon name="trash" size={11} color={isActive ? "#555" : "#f87171"} /> Delete
        </button>
      </div>

      <div style={{ position: "relative", flex: 1, backgroundColor: "#16161e" }}>
        <div
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#e8e8e8",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {car.name}
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: `calc(${displayProgress} * (100% - ${CAR_WIDTH}px))`,
            transition: displayTransition > 0 ? `left ${displayTransition}ms linear` : "none",
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            zIndex: 1,
            opacity: isBroken ? 0.4 : 1,
          }}
        >
          <Car {...car} />
        </div>

        {/* Broken indicator — follows car's last position */}
        {isBroken && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: `calc(${displayProgress} * (100% - ${CAR_WIDTH}px))`,
              width: CAR_WIDTH,
              height: CAR_HEIGHT,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Icon name="wrench" size={36} color="#f87171" />
          </div>
        )}
      </div>
    </div>
  );
});

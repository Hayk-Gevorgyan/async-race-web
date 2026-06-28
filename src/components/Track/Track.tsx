import React, { FC, useState, useEffect } from 'react';
import { CarProps, Car } from '../Car';
import { Icon } from '../Icon';
import { COLOR } from '../../styles/tokens';

export type RaceStatus = 'idle' | 'starting' | 'racing' | 'broken' | 'finished';

export interface CarRaceState {
  status: RaceStatus;
  progress: number;
  transitionDuration: number;
}

interface TrackProps {
  car: CarProps;
  raceState: CarRaceState;
  isRacing: boolean;
  onEdit: (car: CarProps) => void;
  onDelete: (id: number) => void;
  onStart: (car: CarProps) => void;
  onStop: (id: number) => void;
}

const panelBtnStyle: React.CSSProperties = {
  background: COLOR.BG_RAISED,
  color: COLOR.TEXT_SECONDARY,
  border: `1px solid ${COLOR.BORDER}`,
  borderRadius: 'var(--radius-sm)',
  padding: '3px 10px',
  fontSize: 12,
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
};

export const Track: FC<TrackProps> = React.memo(({
  car,
  raceState,
  isRacing,
  onEdit,
  onDelete,
  onStart,
  onStop,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [displayTransition, setDisplayTransition] = useState(0);

  useEffect(() => {
    if (raceState.status === 'racing') {
      setDisplayProgress(0);
      setDisplayTransition(0);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisplayProgress(1);
          setDisplayTransition(raceState.transitionDuration);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
    setDisplayProgress(raceState.progress);
    setDisplayTransition(0);
    return undefined;
  }, [raceState.status, raceState.transitionDuration, raceState.progress]);

  const isActive = raceState.status === 'starting' || raceState.status === 'racing';
  const editDeleteDisabled = isActive || isRacing;
  const isBroken = raceState.status === 'broken';

  return (
    <div style={{
      display: 'flex', width: '100%', height: 'var(--track-height)', borderBottom: `2px solid ${COLOR.BORDER}`,
    }}
    >
      <div
        style={{
          width: 'var(--panel-width)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          padding: '0 12px',
          background: COLOR.BG_BASE,
          borderRight: `2px solid ${COLOR.BORDER}`,
        }}
      >
        {isActive ? (
          <button type="button" style={{ ...panelBtnStyle, color: COLOR.WARNING }} onClick={() => onStop(car.id)}>
            <Icon name="cancel" size={11} color={COLOR.WARNING} />
            {' '}
            Stop
          </button>
        ) : (
          <button type="button" style={panelBtnStyle} onClick={() => onStart(car)}>
            <Icon name="flag" size={11} />
            {' '}
            Start
          </button>
        )}
        <button
          type="button"
          style={{ ...panelBtnStyle, color: editDeleteDisabled ? COLOR.TEXT_DISABLED : COLOR.INFO, cursor: editDeleteDisabled ? 'not-allowed' : 'pointer' }}
          onClick={() => onEdit(car)}
          disabled={editDeleteDisabled}
        >
          <Icon name="pencil" size={11} color={editDeleteDisabled ? COLOR.TEXT_DISABLED : COLOR.INFO} />
          {' '}
          Edit
        </button>
        <button
          type="button"
          style={{ ...panelBtnStyle, color: editDeleteDisabled ? COLOR.TEXT_DISABLED : COLOR.DANGER, cursor: editDeleteDisabled ? 'not-allowed' : 'pointer' }}
          onClick={() => onDelete(car.id)}
          disabled={editDeleteDisabled}
        >
          <Icon name="trash" size={11} color={editDeleteDisabled ? COLOR.TEXT_DISABLED : COLOR.DANGER} />
          {' '}
          Delete
        </button>
      </div>

      <div style={{ position: 'relative', flex: 1, backgroundColor: COLOR.BG_BASE }}>
        <div
          style={{
            position: 'absolute',
            left: 'var(--car-width)',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0,
            fontSize: 18,
            fontWeight: 700,
            color: car.color,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {car.name}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: `calc(${displayProgress} * (100% - var(--car-width)))`,
            transition: displayTransition > 0 ? `left ${displayTransition}ms linear` : 'none',
            width: 'var(--car-width)',
            height: 'var(--car-height)',
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
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: `calc(${displayProgress} * (100% - var(--car-width)))`,
              width: 'var(--car-width)',
              height: 'var(--car-height)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon name="wrench" size={36} color={COLOR.DANGER} />
          </div>
        )}
      </div>
    </div>
  );
});

import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Car } from '../types/Car';
import { CarPayload } from '../types/CarPayload';
import { CarRaceState } from '../components/Track';
import {
  getCars, createCar, updateCar, deleteCar, PAGE_SIZE,
} from '../api/garage';
import { startEngine, driveEngine, stopEngine } from '../api/engine';
import {
  getWinner, createWinner, updateWinner, deleteWinner,
} from '../api/winners';
import {
  BRANDS, MODELS, randomFrom, randomHex,
} from '../components/GarageHeader';

export const DEFAULT_RACE_STATE: CarRaceState = { status: 'idle', progress: 0, transitionDuration: 0 };

interface RaceTiming {
  accumulatedMs: number;
  segmentStartMs: number;
}

interface RaceContextValue {
  cars: Car[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  selectedCar: Car | null;
  raceStates: Record<number, CarRaceState>;
  winner: { name: string; time: number } | null;
  bannerResetKey: number;
  isRacing: boolean;
  canReset: boolean;
  setCurrentPage: (page: number) => void;
  selectCar: (car: Car | null) => void;
  closeWinner: () => void;
  handleCarCreate: (payload: CarPayload) => Promise<void>;
  handleCarUpdate: (payload: CarPayload) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleGenerate: () => Promise<void>;
  startRace: () => void;
  resetRace: () => Promise<void>;
  startCar: (car: Car) => Promise<void>;
  stopCar: (id: number) => Promise<void>;
}

const RaceContext = createContext<RaceContextValue | null>(null);

export function useRace(): RaceContextValue {
  const ctx = useContext(RaceContext);
  if (!ctx) {
    throw new Error('useRace must be used inside RaceProvider');
  }
  return ctx;
}

export const RaceProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [raceStates, setRaceStates] = useState<Record<number, CarRaceState>>({});
  const [winner, setWinner] = useState<{ name: string; time: number } | null>(null);
  const [bannerResetKey, setBannerResetKey] = useState(0);

  const driveControllers = useRef<Record<number, AbortController>>({});
  const raceTimings = useRef<Record<number, RaceTiming>>({});
  const activeCarIds = useRef<Set<number>>(new Set());
  // Absolute wall-clock finish time, not HTTP response order — avoids network jitter crowning the wrong car.
  const bestVisualFinishAt = useRef(Infinity);
  // Tracks the definitive race winner; written on every visual-time improvement, read once at race end for persistence.
  const bestWinner = useRef<{ car: Car; totalMs: number } | null>(null);
  // Guards against stale startCar callbacks firing winner logic after a reset or page change.
  const raceId = useRef(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const isRacing = Object.values(raceStates).some(
    (s) => s.status === 'starting' || s.status === 'racing',
  );

  const canReset = Object.values(raceStates).some(
    (s) => s.progress > 0 || s.status !== 'idle',
  );

  const fetchPage = useCallback(async (page: number) => {
    const result = await getCars(page);
    const newTotalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
    if (page > newTotalPages) {
      setCurrentPage(newTotalPages);
      return;
    }
    setCars(result.data);
    setTotalCount(result.total);
  }, []);

  useEffect(() => {
    fetchPage(currentPage);
    return () => {
      Object.values(driveControllers.current).forEach((c) => c.abort());
      driveControllers.current = {};
      activeCarIds.current.clear();
      raceId.current += 1;
      bestVisualFinishAt.current = Infinity;
      bestWinner.current = null;
      setRaceStates({});
      setWinner(null);
    };
  }, [currentPage, fetchPage]);

  async function handleCarCreate(payload: CarPayload) {
    await createCar(payload);
    fetchPage(currentPage);
  }

  async function handleCarUpdate(payload: CarPayload) {
    if (!selectedCar) {
      return;
    }
    await updateCar(selectedCar.id, payload);
    setSelectedCar(null);
    fetchPage(currentPage);
  }

  async function handleDelete(id: number) {
    await deleteCar(id);
    await deleteWinner(id).catch(() => {
    });
    fetchPage(currentPage);
  }

  async function handleGenerate() {
    const payloads: CarPayload[] = Array.from({ length: 100 }, () => ({
      name: `${randomFrom(BRANDS)} ${randomFrom(MODELS)}`,
      color: randomHex(),
    }));
    await Promise.all(payloads.map((p) => createCar(p)));
    fetchPage(currentPage);
  }

  async function persistWinner(car: Car, timeSeconds: number) {
    const existing = await getWinner(car.id);
    if (!existing) {
      await createWinner({ id: car.id, wins: 1, time: timeSeconds });
    } else {
      await updateWinner(car.id, {
        wins: existing.wins + 1,
        time: Math.min(existing.time, timeSeconds),
      });
    }
  }

  async function startCar(car: Car) {
    if (activeCarIds.current.has(car.id)) {
      return;
    }
    activeCarIds.current.add(car.id);

    const myRaceId = raceId.current;

    setRaceStates((prev) => ({
      ...prev,
      [car.id]: { status: 'starting', progress: 0, transitionDuration: 0 },
    }));

    const { velocity, distance } = await startEngine(car.id);
    const duration = Math.round(distance / velocity);
    const segmentStart = Date.now();

    const prevAccumulated = raceTimings.current[car.id]?.accumulatedMs ?? 0;
    raceTimings.current[car.id] = { accumulatedMs: prevAccumulated, segmentStartMs: segmentStart };

    setRaceStates((prev) => ({
      ...prev,
      [car.id]: { status: 'racing', progress: 0, transitionDuration: duration },
    }));

    const controller = new AbortController();
    driveControllers.current[car.id] = controller;

    try {
      await driveEngine(car.id, controller.signal);

      // Visual finish time, not driveEngine response order — HTTP arrival ≠ animation completion.
      const visualFinishAt = segmentStart + duration;
      const totalMs = prevAccumulated + duration;
      raceTimings.current[car.id] = { accumulatedMs: totalMs, segmentStartMs: 0 };

      setRaceStates((prev) => ({
        ...prev,
        [car.id]: { status: 'finished', progress: 1, transitionDuration: 0 },
      }));

      if (myRaceId === raceId.current && visualFinishAt < bestVisualFinishAt.current) {
        bestVisualFinishAt.current = visualFinishAt;
        bestWinner.current = { car, totalMs };
        setWinner({ name: car.name, time: totalMs / 1000 });
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        activeCarIds.current.delete(car.id);
        return;
      }
      if (myRaceId !== raceId.current) {
        activeCarIds.current.delete(car.id);
        return;
      }
      const elapsed = Date.now() - segmentStart;
      const frozenProgress = Math.min(1, elapsed / duration);
      raceTimings.current[car.id] = { accumulatedMs: prevAccumulated + elapsed, segmentStartMs: 0 };

      setRaceStates((prev) => ({
        ...prev,
        [car.id]: { status: 'broken', progress: frozenProgress, transitionDuration: 0 },
      }));
    }

    activeCarIds.current.delete(car.id);
    if (activeCarIds.current.size === 0 && myRaceId === raceId.current) {
      if (bestWinner.current) {
        const { car: winCar, totalMs: winMs } = bestWinner.current;
        persistWinner(winCar, winMs / 1000);
      }
      setBannerResetKey((k) => k + 1);
    }
  }

  async function stopCar(id: number) {
    driveControllers.current[id]?.abort();

    const timing = raceTimings.current[id];
    const elapsed = timing?.segmentStartMs ? Date.now() - timing.segmentStartMs : 0;
    raceTimings.current[id] = { accumulatedMs: (timing?.accumulatedMs ?? 0) + elapsed, segmentStartMs: 0 };

    setRaceStates((prev) => {
      const state = prev[id];
      if (!state || (state.status !== 'racing' && state.status !== 'starting')) {
        return prev;
      }
      const frozenProgress = state.transitionDuration > 0
        ? Math.min(1, elapsed / state.transitionDuration)
        : state.progress;
      return { ...prev, [id]: { status: 'idle', progress: frozenProgress, transitionDuration: 0 } };
    });

    await stopEngine(id).catch(() => {
    });

    raceTimings.current[id] = { accumulatedMs: 0, segmentStartMs: 0 };
    setRaceStates((prev) => ({
      ...prev,
      [id]: { status: 'idle', progress: 0, transitionDuration: 0 },
    }));
  }

  function startRace() {
    raceId.current += 1;
    bestVisualFinishAt.current = Infinity;
    bestWinner.current = null;
    cars.forEach((car) => startCar(car));
  }

  async function resetRace() {
    raceId.current += 1;
    bestVisualFinishAt.current = Infinity;
    bestWinner.current = null;

    cars.forEach((car) => driveControllers.current[car.id]?.abort());
    activeCarIds.current.clear();

    const now = Date.now();
    const elapsedById: Record<number, number> = {};
    cars.forEach((car) => {
      const timing = raceTimings.current[car.id];
      const elapsed = timing?.segmentStartMs ? now - timing.segmentStartMs : 0;
      elapsedById[car.id] = elapsed;
      raceTimings.current[car.id] = {
        accumulatedMs: (timing?.accumulatedMs ?? 0) + elapsed,
        segmentStartMs: 0,
      };
    });

    setRaceStates((prev) => cars.reduce<Record<number, CarRaceState>>((next, car) => {
      const state = prev[car.id];
      if (!state) return next;
      const elapsed = elapsedById[car.id] ?? 0;
      const frozenProgress = state.transitionDuration > 0
        ? Math.min(1, elapsed / state.transitionDuration)
        : state.progress;
      return { ...next, [car.id]: { status: 'idle', progress: frozenProgress, transitionDuration: 0 } };
    }, { ...prev }));

    await Promise.all(cars.map((car) => stopEngine(car.id).catch(() => {})));

    cars.forEach((car) => {
      raceTimings.current[car.id] = { accumulatedMs: 0, segmentStartMs: 0 };
    });
    setRaceStates((prev) => cars.reduce<Record<number, CarRaceState>>(
      (next, car) => ({ ...next, [car.id]: { status: 'idle', progress: 0, transitionDuration: 0 } }),
      { ...prev },
    ));

    setWinner(null);
  }

  const value: RaceContextValue = useMemo(() => ({
    cars,
    totalCount,
    totalPages,
    currentPage,
    selectedCar,
    raceStates,
    winner,
    bannerResetKey,
    isRacing,
    canReset,
    setCurrentPage,
    selectCar: setSelectedCar,
    closeWinner: () => setWinner(null),
    handleCarCreate,
    handleCarUpdate,
    handleDelete,
    handleGenerate,
    startRace,
    resetRace,
    startCar,
    stopCar,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [cars, totalCount, totalPages, currentPage, selectedCar, raceStates, winner, bannerResetKey, isRacing, canReset]);

  return <RaceContext.Provider value={value}>{children}</RaceContext.Provider>;
};

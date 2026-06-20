import React            from "react";
import { FC }           from "react";
import { useRef }       from "react";
import { useState }     from "react";
import { useEffect }    from "react";
import { useCallback }  from "react";
import Stack            from "../../components/Stack";
import { Track }        from "../../components/Track";
import { CarRaceState } from "../../components/Track";
import { BRANDS }       from "../../components/GarageHeader";
import { randomHex }    from "../../components/GarageHeader";
import { GarageHeader } from "../../components/GarageHeader";
import { Pagination }   from "../../components/Pagination";
import { WinnerBanner } from "../../components/WinnerBanner";
import { getCars }      from "../../api/garage";
import { createCar }    from "../../api/garage";
import { updateCar }    from "../../api/garage";
import { deleteCar }    from "../../api/garage";
import { PAGE_SIZE }    from "../../api/garage";
import { stopEngine }   from "../../api/engine";
import { startEngine }  from "../../api/engine";
import { driveEngine }  from "../../api/engine";
import { getWinner }    from "../../api/winners";
import { createWinner } from "../../api/winners";
import { updateWinner } from "../../api/winners";
import { Car }          from "../../types/Car";
import { CarPayload }   from "../../types/CarPayload";

const DEFAULT_RACE_STATE: CarRaceState = { status: "idle", progress: 0, transitionDuration: 0 };

interface RaceTiming {
  accumulatedMs: number;
  segmentStartMs: number;
}

export const GarageView: FC = React.memo(function GarageView() {
  const [cars, setCars] = useState<Car[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [raceStates, setRaceStates] = useState<Record<number, CarRaceState>>({});
  const [winner, setWinner] = useState<{ name: string; time: number } | null>(null);

  const driveControllers = useRef<Record<number, AbortController>>({});
  const raceTimings = useRef<Record<number, RaceTiming>>({});
  const activeCarIds = useRef<Set<number>>(new Set());
  const winnerDecided = useRef(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isRacing = Object.values(raceStates).some(
    s => s.status === "starting" || s.status === "racing"
  );

  // ── Garage fetching ──────────────────────────────────────────────────────────

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
      // Abandon race on page change
      Object.values(driveControllers.current).forEach(c => c.abort());
      driveControllers.current = {};
      activeCarIds.current.clear();
      winnerDecided.current = false;
      setRaceStates({});
      setWinner(null);
    };
  }, [currentPage, fetchPage]);

  // ── Car CRUD ─────────────────────────────────────────────────────────────────

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
    fetchPage(currentPage);
  }

  async function handleGenerate() {
    const payloads: CarPayload[] = Array.from({ length: 100 }, () => ({
      name: BRANDS[ Math.floor(Math.random() * BRANDS.length) ],
      color: randomHex()
    }));
    await Promise.all(payloads.map(p => createCar(p)));
    fetchPage(currentPage);
  }

  // ── Race logic ───────────────────────────────────────────────────────────────

  async function handleWinner(car: Car, timeSeconds: number) {
    setWinner({ name: car.name, time: timeSeconds });
    const existing = await getWinner(car.id);
    if (!existing) {
      await createWinner({ id: car.id, wins: 1, time: timeSeconds });
    } else {
      await updateWinner(car.id, {
        wins: existing.wins + 1,
        time: Math.min(existing.time, timeSeconds)
      });
    }
  }

  async function startCar(car: Car) {
    if (activeCarIds.current.has(car.id)) {
      return;
    }
    activeCarIds.current.add(car.id);

    setRaceStates(prev => ({
      ...prev,
      [ car.id ]: { status: "starting", progress: 0, transitionDuration: 0 }
    }));

    const { velocity, distance } = await startEngine(car.id);
    const duration = Math.round(distance / velocity);
    const segmentStart = Date.now();

    const prevAccumulated = raceTimings.current[ car.id ]?.accumulatedMs ?? 0;
    raceTimings.current[ car.id ] = { accumulatedMs: prevAccumulated, segmentStartMs: segmentStart };

    setRaceStates(prev => ({
      ...prev,
      [ car.id ]: { status: "racing", progress: 0, transitionDuration: duration }
    }));

    const controller = new AbortController();
    driveControllers.current[ car.id ] = controller;

    try {
      await driveEngine(car.id, controller.signal);

      const totalMs = prevAccumulated + (Date.now() - segmentStart);
      raceTimings.current[ car.id ] = { accumulatedMs: totalMs, segmentStartMs: 0 };

      setRaceStates(prev => ({
        ...prev,
        [ car.id ]: { status: "finished", progress: 1, transitionDuration: 0 }
      }));

      if (!winnerDecided.current) {
        winnerDecided.current = true;
        handleWinner(car, totalMs / 1000);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        activeCarIds.current.delete(car.id);
        return;
      }
      // Engine breakdown
      const elapsed = Date.now() - segmentStart;
      const frozenProgress = Math.min(1, elapsed / duration);
      raceTimings.current[ car.id ] = { accumulatedMs: prevAccumulated + elapsed, segmentStartMs: 0 };

      setRaceStates(prev => ({
        ...prev,
        [ car.id ]: { status: "broken", progress: frozenProgress, transitionDuration: 0 }
      }));
    }

    activeCarIds.current.delete(car.id);
  }

  function stopCar(id: number) {
    driveControllers.current[ id ]?.abort();
    stopEngine(id);

    const timing = raceTimings.current[ id ];

    setRaceStates(prev => {
      const state = prev[ id ];
      if (!state || (state.status !== "racing" && state.status !== "starting")) {
        return prev;
      }

      const elapsed = timing?.segmentStartMs ? Date.now() - timing.segmentStartMs : 0;
      const frozenProgress = state.transitionDuration > 0
        ? Math.min(1, elapsed / state.transitionDuration)
        : state.progress;

      raceTimings.current[ id ] = {
        accumulatedMs: (timing?.accumulatedMs ?? 0) + elapsed,
        segmentStartMs: 0
      };

      return { ...prev, [ id ]: { status: "idle", progress: frozenProgress, transitionDuration: 0 } };
    });
  }

  function startRace() {
    winnerDecided.current = false;
    cars.forEach(car => startCar(car));
  }

  function stopRace() {
    cars.forEach(car => stopCar(car.id));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Stack direction={"column"} alignItems={"stretch"} spacing={0}>
      <WinnerBanner winner={winner} onClose={() => setWinner(null)}/>

      <GarageHeader
        selectedCar={selectedCar}
        isRacing={isRacing}
        onCarCreate={handleCarCreate}
        onCarUpdate={handleCarUpdate}
        onGenerate={handleGenerate}
        onStartRace={startRace}
        onStopRace={stopRace}
      />

      <div style={{ padding: "8px 0", color: "#888", fontSize: 13, paddingLeft: 16 }}>
        Garage ({totalCount})
      </div>

      {cars.map(car => (
        <Track
          key={car.id}
          car={car}
          raceState={raceStates[ car.id ] ?? DEFAULT_RACE_STATE}
          onEdit={setSelectedCar}
          onDelete={handleDelete}
          onStart={startCar}
          onStop={stopCar}
        />
      ))}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Stack>
  );
});

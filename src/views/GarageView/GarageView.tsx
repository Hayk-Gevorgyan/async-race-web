import React, { FC } from "react";
import Stack           from "../../components/Stack";
import { Track }       from "../../components/Track";
import { GarageHeader } from "../../components/GarageHeader";
import { Pagination }  from "../../components/Pagination";
import { WinnerBanner } from "../../components/WinnerBanner";
import { useRace, DEFAULT_RACE_STATE } from "../../context/RaceContext";

export const GarageView: FC = React.memo(function GarageView() {
  const {
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
    selectCar,
    closeWinner,
    handleCarCreate,
    handleCarUpdate,
    handleDelete,
    handleGenerate,
    startRace,
    resetRace,
    startCar,
    stopCar,
  } = useRace();

  return (
    <Stack direction={"column"} alignItems={"stretch"} spacing={0}>
      <WinnerBanner winner={winner} onClose={closeWinner} resetKey={bannerResetKey} />

      <GarageHeader
        selectedCar={selectedCar}
        isRacing={isRacing}
        canReset={canReset}
        onCarCreate={handleCarCreate}
        onCarUpdate={handleCarUpdate}
        onGenerate={handleGenerate}
        onStartRace={startRace}
        onResetRace={resetRace}
      />

      <div style={{ padding: "8px 0", color: "#888", fontSize: 13, paddingLeft: 16 }}>
        Garage ({totalCount})
      </div>

      {cars.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#555", fontSize: 18 }}>
          No Cars
        </div>
      ) : (
        cars.map(car => (
          <Track
            key={car.id}
            car={car}
            raceState={raceStates[car.id] ?? DEFAULT_RACE_STATE}
            onEdit={selectCar}
            onDelete={handleDelete}
            onStart={startCar}
            onStop={stopCar}
          />
        ))
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Stack>
  );
});

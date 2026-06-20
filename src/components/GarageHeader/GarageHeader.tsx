import React, { FC } from "react";
import Stack           from "../Stack";
import { CarForm }     from "../CarForm";
import { Car }         from "../../types/Car";
import { CarPayload }  from "../../types/CarPayload";

const BRANDS = [
  "Tesla", "BMW", "Mercedes", "Ford", "Ferrari",
  "Lamborghini", "Porsche", "Audi", "Toyota", "Honda",
  "Chevrolet", "Dodge", "Bugatti", "McLaren", "Rivian",
];

function randomHex(): string {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}

interface GarageHeaderProps {
  selectedCar:  Car | null;
  isRacing:     boolean;
  onCarCreate:  (payload: CarPayload) => void;
  onCarUpdate:  (payload: CarPayload) => void;
  onGenerate:   () => void;
  onStartRace:  () => void;
  onStopRace:   () => void;
}

export const GarageHeader: FC<GarageHeaderProps> = React.memo(function GarageHeader({
  selectedCar,
  isRacing,
  onCarCreate,
  onCarUpdate,
  onGenerate,
  onStartRace,
  onStopRace,
}) {
  const raceBtnBase: React.CSSProperties = {
    border: "none",
    borderRadius: 4,
    padding: "6px 16px",
    fontSize: 13,
  };

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-around"}
      alignItems={"center"}
      style={{ padding: "12px 16px", borderBottom: "2px solid #2a2a35", background: "#16161e" }}
    >
      <Stack direction={"column"} alignItems={"center"} spacing={6}>
        <button
          onClick={onStartRace}
          disabled={isRacing}
          style={{
            ...raceBtnBase,
            background: isRacing ? "#2a2a35" : "#6c63ff",
            color: isRacing ? "#555" : "#fff",
            cursor: isRacing ? "not-allowed" : "pointer",
          }}
        >
          Start Race
        </button>
        <button
          onClick={onStopRace}
          disabled={!isRacing}
          style={{
            ...raceBtnBase,
            background: !isRacing ? "#2a2a35" : "#f87171",
            color: !isRacing ? "#555" : "#fff",
            cursor: !isRacing ? "not-allowed" : "pointer",
          }}
        >
          Stop Race
        </button>
      </Stack>

      <CarForm mode={"create"} onSubmit={onCarCreate} />

      <CarForm
        mode={"edit"}
        disabled={selectedCar === null}
        initialValues={selectedCar ?? undefined}
        onSubmit={onCarUpdate}
      />

      <button
        onClick={onGenerate}
        style={{
          background: "#6c63ff",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "6px 16px",
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Generate 100 Cars
      </button>
    </Stack>
  );
});

export { BRANDS, randomHex };

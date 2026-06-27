import React, { FC } from "react";
import Stack           from "../Stack";
import { CarForm }     from "../CarForm";
import { Car }         from "../../types/Car";
import { CarPayload }  from "../../types/CarPayload";
import { Icon }        from "../Icon";

const BRANDS = [
  "Tesla", "BMW", "Mercedes", "Ford", "Ferrari",
  "Lamborghini", "Porsche", "Audi", "Toyota", "Honda",
  "Chevrolet", "Dodge", "Bugatti", "McLaren", "Rivian",
];

const MODELS = [
  "Model S", "Mustang", "Aventador", "Chiron", "Carrera",
  "R8", "488", "Senna", "M3", "C63",
  "Huracan", "Veyron", "F-150", "Camaro", "Taycan",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex(): string {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}

interface GarageHeaderProps {
  selectedCar:  Car | null;
  isRacing:     boolean;
  canReset:     boolean;
  onCarCreate:  (payload: CarPayload) => void;
  onCarUpdate:  (payload: CarPayload) => void;
  onGenerate:   () => void;
  onStartRace:  () => void;
  onResetRace:  () => void;
}

export const GarageHeader: FC<GarageHeaderProps> = React.memo(function GarageHeader({
  selectedCar,
  isRacing,
  canReset,
  onCarCreate,
  onCarUpdate,
  onGenerate,
  onStartRace,
  onResetRace,
}) {
  const raceBtnBase: React.CSSProperties = {
    border: "none",
    borderRadius: 4,
    padding: "6px 16px",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  };

  return (
    <Stack
      direction={"row"}
      justifyContent={"space-around"}
      alignItems={"center"}
      style={{ padding: "12px 16px", borderBottom: "2px solid #2a2a35", background: "#16161e" }}
    >
      <Stack direction={"column"} alignItems={"stretch"} spacing={6}>
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
          <Icon name="flag" size={13} color={isRacing ? "#555" : "#fff"} /> Start Race
        </button>
        <button
          onClick={onResetRace}
          disabled={!canReset}
          style={{
            ...raceBtnBase,
            background: !canReset ? "#2a2a35" : "#f87171",
            color: !canReset ? "#555" : "#fff",
            cursor: !canReset ? "not-allowed" : "pointer",
          }}
        >
          <Icon name="cancel" size={13} color={!canReset ? "#555" : "#fff"} /> Reset Race
        </button>
      </Stack>

      <CarForm mode={"create"} onSubmit={onCarCreate} disabled={isRacing} />

      <CarForm
        mode={"edit"}
        disabled={selectedCar === null || isRacing}
        initialValues={selectedCar ?? undefined}
        onSubmit={onCarUpdate}
      />

      <button
        onClick={onGenerate}
        disabled={isRacing}
        style={{
          ...raceBtnBase,
          background: isRacing ? "#2a2a35" : "#6c63ff",
          color: isRacing ? "#555" : "#fff",
          cursor: isRacing ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Icon name="add" size={13} color={isRacing ? "#555" : "#fff"} /> Generate 100 Cars
      </button>
    </Stack>
  );
});

export { BRANDS, MODELS, randomFrom, randomHex };

import { Car as CarType } from "../../types/Car";
import Stack from "../Stack";
import React from "react";
import { FC } from "react";

function invertColor(hex: string): string {
  const clean = hex.replace("#", "").padStart(6, "0");
  const r = 255 - parseInt(clean.slice(0, 2), 16);
  const g = 255 - parseInt(clean.slice(2, 4), 16);
  const b = 255 - parseInt(clean.slice(4, 6), 16);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export interface CarProps extends CarType {

}

export const Car: FC<CarProps> = React.memo(function Car({ name, color }: CarType) {
  return (
    <Stack
      justifyContent={"center"}
      alignItems={"center"}
      style={{
        width: 160,
        height: 90,
        backgroundColor: color,
        color: invertColor(color),
        fontSize: 12,
        fontWeight: 600,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {name}
    </Stack>
  );
})
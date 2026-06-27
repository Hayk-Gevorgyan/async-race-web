import { Car as CarType } from "../../types/Car";
import React from "react";
import { FC } from "react";
import { Icon } from "../Icon";

export interface CarProps extends CarType {}

export const Car: FC<CarProps> = React.memo(function Car({ color }: CarType) {
  return (
    <div
      style={{
        width: 70,
        height: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <Icon name="car-top-view" size={90} color={color} />
    </div>
  );
});

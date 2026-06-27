import { FC } from "react";
import React from "react";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const Icon: FC<IconProps> = ({ name, size = 16, color, style, className }) => (
  <span
    className={`icon-${name}${className ? ` ${className}` : ""}`}
    aria-hidden="true"
    style={{
      fontSize: size,
      color,
      lineHeight: 1,
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      ...style,
    }}
  />
);

import type React from "react";

export type ColorSwatchProps = {
  color: string;
};

const SIZE = "1.5rem";

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color }) => {
  return (
    <span
      style={{
        backgroundColor: color,
        display: "inline-block",
        verticalAlign: "middle",
        width: SIZE,
        height: SIZE,
        borderRadius: "0.25em",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "105%",
      }}
    >
      {color}
    </span>
  );
};

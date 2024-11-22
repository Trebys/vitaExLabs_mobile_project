import React from "react";
import { Line } from "react-native-svg";

const CustomGrid = ({
  x,
  y,
  data = [],
  ticks = [0, 10, 20, 30, 40, 50],
  stroke = "rgba(0,0,0,0.2)",
}) => {
  return (
    <>
      {ticks.map((tick) => (
        <Line
          key={tick}
          x1={"0%"}
          x2={"100%"}
          y1={y(tick)}
          y2={y(tick)}
          stroke={stroke}
        />
      ))}
      {data.map((_, index) => (
        <Line
          key={index}
          y1={"0%"}
          y2={"100%"}
          x1={x(index)}
          x2={x(index)}
          stroke={stroke}
        />
      ))}
    </>
  );
};

export default CustomGrid;

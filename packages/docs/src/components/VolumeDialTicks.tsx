import { useMemo } from "react";
import { valueToAngle, angleToPoint } from "../../../sliders/src";

/**
 * Draw tick marks and numbers to indicate volume around the dial
 */
const VolumeDialTicks = ({
  minAngle,
  maxAngle,
  minValue,
  maxValue,
  radius,
}: {
  minAngle: number;
  maxAngle: number;
  minValue: number;
  maxValue: number;
  radius: number;
}) => {
  return useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 11; i++) {
      const angle = valueToAngle(i, minValue, maxValue, minAngle, maxAngle);
      const posFrom = angleToPoint(angle, { x: 0, y: 0 }, radius * 0.7);
      const posTo = angleToPoint(angle, { x: 0, y: 0 }, radius * 0.8);
      const posLabel = angleToPoint(angle, { x: 0, y: 0 }, radius * 0.9);
      ticks.push(
        <g key={`main-${i}`}>
          <line
            x1={posFrom.x}
            y1={posFrom.y}
            x2={posTo.x}
            y2={posTo.y}
            strokeWidth={0.01}
            strokeLinecap="round"
            // the `--sl-color-accent` variables come from the Astro Starlight theme
            // that is used to generate this site
            style={{ stroke: "var(--sl-color-accent" }}
          />
          <text
            x={posLabel.x}
            y={posLabel.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="0.11"
            fill="var(--sl-color-accent"
            style={{ color: "var(--sl-color-accent" }}
          >
            {i}
          </text>
        </g>,
      );
    }
    for (let i = 0; i <= 11; i += 0.2) {
      const angle = valueToAngle(i, minValue, maxValue, minAngle, maxAngle);
      const posFrom = angleToPoint(angle, { x: 0, y: 0 }, radius * 0.7);
      const posTo = angleToPoint(angle, { x: 0, y: 0 }, radius * 0.72);
      ticks.push(
        <g key={`small-${i}`}>
          <line
            x1={posFrom.x}
            y1={posFrom.y}
            x2={posTo.x}
            y2={posTo.y}
            strokeWidth={0.01}
            strokeLinecap="round"
            style={{ stroke: "var(--sl-color-accent" }}
          />
        </g>,
      );
    }
    return <g>{ticks}</g>;
  }, [maxAngle, maxValue, minAngle, minValue]);
};

export default VolumeDialTicks;

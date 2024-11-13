import { useRef, useMemo } from "react";
import { useDial, TAU, angleToPoint, valueToAngle, rad2deg } from "../../../sliders/src/";

const VolumeDial = () => {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<SVGCircleElement>(null);

  const props = { minAngle: (3 / 8) * TAU, maxAngle: (9 / 8) * TAU, minValue: 0, maxValue: 11 };
  const radius = 0.9;

  const ticks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 11; i++) {
      const angle = valueToAngle(i, props.minValue, props.maxValue, props.minAngle, props.maxAngle);
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
      const angle = valueToAngle(i, props.minValue, props.maxValue, props.minAngle, props.maxAngle);
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
    return ticks;
  }, [props.maxAngle, props.maxValue, props.minAngle, props.minValue]);

  const { isRotating, isOnTarget, angle, value } = useDial({
    ...props,
    dragAreaRef,
    targetRef,
    value: 6,
  });

  return (
    <>
      <div className="w-full h-64 mt-0 flex items-center justify-center touch-none select-none" ref={dragAreaRef}>
        <svg width="250" height="250" viewBox="-1 -1 2 2">
          <g transform={`rotate(${rad2deg(angle)}, 0, 0)`} ref={targetRef}>
            <circle
              style={{ stroke: "var(--sl-color-accent" }}
              className="fill-slate-600"
              cx={0}
              cy={0}
              r={radius * 0.6}
              strokeWidth="0.01"
            />
            <path
              style={{ fill: "var(--sl-color-accent" }}
              className="stroke-nonee"
              d={`M ${radius * 0.55} 0 L ${radius * 0.4} -0.05 L ${radius * 0.4} 0.05 L ${radius * 0.55} 0`}
            />
          </g>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="0.3"
            fontFamily="monospace"
            fontWeight="bold"
            fill="var(--sl-color-accent"
            style={{ color: "var(--sl-color-accent" }}
          >
            {value!.toFixed(0)}
          </text>
          <g>{ticks}</g>
        </svg>
      </div>
    </>
  );
};

export default VolumeDial;

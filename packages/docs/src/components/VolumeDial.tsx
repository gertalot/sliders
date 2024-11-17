import { useRef, useMemo } from "react";
import { useDial, TAU, angleToPoint, valueToAngle, rad2deg } from "../../../sliders/src/";
import VolumeDialTicks from "./VolumeDialTicks";

/**
 * A component that renders a circular volume dial in an SVG, with tick marks. The volume
 * can be adjusted from 0-11.
 */
const VolumeDial = () => {
  // The dragArea is a div enclosing the volume dial. This allows for mouse wheel rotations or
  // vertical draggin on the whole area of the component.
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<SVGCircleElement>(null);

  // The limits of rotation. `TAU` is defined as `2*Math.PI` and is a useful shorthand when
  // working with radians. 3/8 TAU is "7 o'clock", 9/8 TAU is "5 o'clock". This corresponds
  // to a volume from 0-11.
  const props = { minAngle: (3 / 8) * TAU, maxAngle: (9 / 8) * TAU, minValue: 0, maxValue: 11 };

  // We use various radii, for the ticks, the dial, and the volume numbers, for example. They are
  // all relative to the the `radius` value.
  const radius = 0.9;

  const { angle, value } = useDial({
    ...props,
    dragAreaRef,
    targetRef,
    value: 6,
  });

  return (
    <>
      <div className="w-full h-64 mt-0 flex items-center justify-center touch-none select-none" ref={dragAreaRef}>
        <svg width="250" height="250" viewBox="-1 -1 2 2">
          {/* Draw the circle with the triangle indicating the value and rotate both to point
              the right way */}
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
          {/* Show the volume as a number in the center of the dial */}
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
          {/* A separate component draws the tick marks around the dial */}
          <VolumeDialTicks {...props} radius={radius} />
        </svg>
      </div>
    </>
  );
};

export default VolumeDial;

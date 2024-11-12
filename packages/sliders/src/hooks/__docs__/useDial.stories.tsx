/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDial } from "..";
import { angleToPoint, Point2D, pointEquals, rad2deg, TAU, valueToAngle } from "../../utils";

// there are no props or anything, so this is simple
type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useDial example"
};

export default meta;

export const UseDialBasicExample: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef<SVGSVGElement>(null);
    const targetRef = useRef<SVGCircleElement>(null);

    const { isRotating, isOnTarget, angle, totalAngle, fullRotations } = useDial({
      dragAreaRef,
      targetRef
    });

    const [position, setPosition] = useState<Point2D | null>(null);

    useEffect(() => {
      const newPosition = angleToPoint(angle, { x: 0, y: 0 }, 0.8);
      setPosition((prev) => (pointEquals(prev, newPosition) ? prev : newPosition));
    }, [angle]);

    return (
      <>
        <div className="relative w-96 h-72 bg-gray-900 p-0 border-white border-solid border-2 touch-none">
          <svg className="w-full h-full" viewBox="-1 -1 2 2" ref={dragAreaRef}>
            <line
              x1={0}
              y1={0}
              x2={position?.x}
              y2={position?.y}
              strokeWidth={0.04}
              strokeLinecap="round"
              className="stroke-red-900"
            />
            <circle
              ref={targetRef}
              className={`cursor-pointer transition-transform duration-100 ease-in-out active:opacity-70 stroke-red-900`}
              cx={position?.x}
              cy={position?.y}
              r={0.1}
              fill="white"
              strokeWidth={0.04}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-start justify-end pointer-events-none">
            <div className="text-xs font-mono">
              <div>
                angle: {totalAngle.toFixed(2)} ({fullRotations} full rotations)
              </div>
              <div>{[isOnTarget ? "on target" : "", isRotating ? "rotating" : ""].filter(Boolean).join(", ")}</div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export const UseDialExample: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef<SVGSVGElement>(null);
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
              className="stroke-white"
            />
            <text
              x={posLabel.x}
              y={posLabel.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="0.11"
              fill="white"
            >
              {i}
            </text>
          </g>
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
              className="stroke-white"
            />
          </g>
        );
      }
      return ticks;
    }, [props.maxAngle, props.maxValue, props.minAngle, props.minValue]);

    const { isRotating, isOnTarget, angle, value } = useDial({
      ...props,
      dragAreaRef,
      targetRef,
      value: 3
    });

    return (
      <>
        <div className="relative w-3/4 h-3/4 bg-gray-900 p-0 border-white border-solid border-2 touch-none resize overflow-auto">
          <svg className="w-full h-full" viewBox="-1 -1 2 2" ref={dragAreaRef}>
            <g transform={`rotate(${rad2deg(angle)}, 0, 0)`} ref={targetRef}>
              <circle className="stroke-white fill-slate-600" cx={0} cy={0} r={radius * 0.6} strokeWidth="0.01" />
              <path
                className="stroke-none fill-white"
                d={`M ${radius * 0.55} 0 L ${radius * 0.4} -0.05 L ${radius * 0.4} 0.05 L ${radius * 0.55} 0`}
              />
            </g>
            <g>{ticks}</g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-start justify-end pointer-events-none">
            <div className="text-xs font-mono">
              <div>volume: {value!.toFixed(0)}</div>
              <div>{[isOnTarget ? "on target" : "", isRotating ? "rotating" : ""].filter(Boolean).join(", ")}</div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

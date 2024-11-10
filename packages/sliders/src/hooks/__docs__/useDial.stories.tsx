/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef, useState } from "react";
import { useDial } from "..";
import { angleToPoint, Point2D, pointEquals, TAU } from "../../utils";

type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useDial example"
};

export default meta;

export const UseDialExample: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef<SVGSVGElement>(null);
    const targetRef = useRef<SVGCircleElement>(null);
    const [origin, setOrigin] = useState<Point2D>({ x: 0, y: 0 });

    // update the rotation origin to the center of the drag area, even when
    // the window resizes
    useEffect(() => {
      const updateOrigin = () => {
        if (dragAreaRef.current) {
          const rect = dragAreaRef.current.getBoundingClientRect();
          const newOrigin = { x: rect.width / 2, y: rect.height / 2 };
          setOrigin(newOrigin);
        }
      };

      updateOrigin();
      window.addEventListener("resize", updateOrigin);
      return () => window.removeEventListener("resize", updateOrigin);
    }, []);

    const { isRotating, isOnTarget, angle, totalAngle, fullRotations } = useDial({
      dragAreaRef,
      targetRef,
      minAngle: (3 / 8) * TAU,
      maxAngle: (9 / 8) * TAU,
      origin
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

/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef, useState } from "react";
import useRotatingDraggable from "../useRotatingDraggable";
import { angleToPoint, Point2D, pointEquals } from "../../utils";

// there are no props or anything, so this is simple
type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useRotatingDraggable example"
};

export default meta;

export const UseRotatingDraggableExample: StoryObj<BasicComponent> = {
  render: () => {
    // const sliderRadius = 0.4;
    const containerRef = useRef<SVGSVGElement>(null);
    const targetRef = useRef<SVGCircleElement>(null);
    // const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
    // const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const { isDragging, isOnTarget, angle, totalAngle, fullRotations } = useRotatingDraggable({
      containerRef,
      targetRef
      // origin: { x: 0, y: 0 }
    });

    const [position, setPosition] = useState<Point2D | null>(null);

    useEffect(() => {
      const newPosition = angleToPoint(angle, { x: 0, y: 0 }, 0.8);
      setPosition((prev) => (pointEquals(prev, newPosition) ? prev : newPosition));
    }, [angle]);

    return (
      <>
        <div className="relative w-96 h-72 bg-gray-900 p-0 border-white border-solid border-2 touch-none">
          <svg className="w-full h-full" viewBox="-1 -1 2 2" ref={containerRef}>
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
              <div>{[isOnTarget ? "on target" : "", isDragging ? "rotating" : ""].filter(Boolean).join(", ")}</div>
            </div>
          </div>
        </div>
      </>
    );
  }
};
/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef, useState } from "react";
import { useDragToMove, useWheelToAdjust } from "..";
import Speaker from "./Speaker";

type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useSlider example"
};

export default meta;

export const UseSliderExample: StoryObj<BasicComponent> = {
  render: () => {
    const containerRef = useRef<SVGSVGElement>(null);
    const targetRef = useRef<SVGPathElement>(null);
    const [volume, setVolume] = useState(0.4);

    const { wheelDelta, isScrolling } = useWheelToAdjust({
      containerRef: containerRef,
      sensitivity: 100
    });

    const { isOnTarget, isDragging, cursorPosition } = useDragToMove({ containerRef, targetRef });

    useEffect(() => {
      if (isScrolling) {
        setVolume((prev) => Math.max(0, Math.min(prev + wheelDelta, 1.0)));
      }
    }, [wheelDelta, isScrolling]);

    useEffect(() => {
      if (isDragging && cursorPosition && targetRef.current) {
        setVolume(() => Math.max(0, Math.min((cursorPosition.x - 16) / 212, 1.0)));
      }
    }, [isDragging, cursorPosition]);

    return (
      <div className="w-96 h-72 flex items-center justify-center bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none">
        <Speaker volume={volume} />
        <svg
          width="256"
          height="32"
          viewBox="0 0 256 32"
          className="flex border-gray-800 border-solid border-2 rounded-2xl"
          ref={containerRef}
        >
          <path style={{ fill: "none", stroke: "#666", strokeWidth: 12, strokeLinecap: "round" }} d="M 8,16 248,16" />
          <path
            ref={targetRef}
            style={{
              fill: "none",
              stroke: "white",
              strokeWidth: isScrolling || isDragging || isOnTarget ? 18 : 12,
              strokeLinecap: "round"
            }}
            d={`M 8,16 ${8 + 240 * volume},16`}
          />
        </svg>
      </div>
    );
  }
};

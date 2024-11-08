/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useRef } from "react";
import { useSlider } from "..";
import Speaker from "./Speaker";

type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useSlider example"
};

export default meta;

export const UseSliderExample: StoryObj<BasicComponent> = {
  render: () => {
    const containerRef = useRef<SVGRectElement>(null);
    const targetRef = useRef<SVGPathElement>(null);

    const { value, isAdjusting, isOnContainer, isOnTarget } = useSlider({
      containerRef,
      targetRef,
      minValue: 0,
      maxValue: 1,
      initialValue: 0.4,
      sensitivity: 100,
      isVertical: false
    });

    return (
      <div className="w-96 h-72 flex items-center justify-center bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none">
        <Speaker volume={value} color={isAdjusting || isOnContainer ? "#ccc" : "#444"} />
        <svg
          width="256"
          height="32"
          viewBox="0 0 256 32"
          className="flex border-gray-800 border-solid border-2 rounded-2xl"
        >
          <rect x="8" y="0" width="240" height="32" fill="transparent" ref={containerRef} />
          <path
            style={{
              fill: "none",
              stroke: isAdjusting || isOnContainer ? "#666" : "#444",
              strokeWidth: isAdjusting || isOnContainer ? 14 : 10,
              strokeLinecap: "round"
            }}
            d="M 8,16 248,16"
          />
          <path
            ref={targetRef}
            style={{
              fill: "none",
              stroke: isAdjusting || isOnTarget ? "white" : "#ccc",
              strokeWidth: isAdjusting || isOnTarget ? 18 : isOnContainer ? 14 : 10,
              strokeLinecap: "round"
            }}
            d={`M 8,16 ${8 + value * 240},16`}
          />
        </svg>
      </div>
    );
  }
};

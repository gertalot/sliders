/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useRef } from "react";
import { useSlider } from "../useSlider.js";
import Speaker from "./Speaker.js";

type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useSlider example"
};

export default meta;

export const UseSliderExample: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef<SVGRectElement>(null);
    const targetRef = useRef<SVGPathElement>(null);

    const { value, isAdjusting, isOnDragArea, isOnTarget } = useSlider({
      dragAreaRef,
      targetRef,
      minValue: 0,
      maxValue: 1,
      initialValue: 0.4,
      isVertical: false
    });

    return (
      <div className="w-96 h-72 flex items-center justify-center bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none">
        <Speaker volume={value} color={isAdjusting || isOnDragArea ? "#ccc" : "#666"} />
        <svg
          width="256"
          height="32"
          viewBox="0 0 256 32"
          className="flex border-gray-800 border-solid border-2 rounded-2xl"
        >
          {/* This rect, placed directly over the slider, is the active drag area */}
          <rect x="8" y="0" width="240" height="32" fill="transparent" ref={dragAreaRef} />
          <path
            style={{
              stroke: "#666",
              strokeWidth: 10,
              strokeLinecap: "round"
            }}
            d="M 8,16 248,16"
          />
          <path
            ref={targetRef}
            style={{
              stroke: isAdjusting || isOnTarget ? "white" : "#ccc",
              strokeWidth: isAdjusting || isOnTarget ? 18 : isOnDragArea ? 14 : 10,
              strokeLinecap: "round"
            }}
            d={`M 8,16 ${8 + value * 240},16`}
          />
        </svg>
      </div>
    );
  }
};

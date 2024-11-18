/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { type FC, useEffect, useRef, useState } from "react";
import { useWheelToAdjust } from "../useWheelToAdjust.js";

type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useWheelToAdjust example"
};

export default meta;

export const UseWheelToAdjustMinimalExample: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState(0);

    const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 2 });

    useEffect(() => {
      if (isScrolling) {
        setValue((prev) => prev + wheelDelta);
      }
    }, [wheelDelta, isScrolling]);

    return (
      <div style={{ width: "90vw", height: "90vh", backgroundColor: "#333" }} ref={dragAreaRef}>
        <h1 style={{ textAlign: "center" }}>{value.toFixed(1)}</h1>
      </div>
    );
  }
};

export const UseWheelToAdjustExample: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState(0);

    const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 2 });

    useEffect(() => {
      if (isScrolling) {
        setValue((prev) => prev + wheelDelta);
      }
    }, [wheelDelta, isScrolling]);

    return (
      <div
        className="w-96 h-72 flex items-center justify-center bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none"
        ref={dragAreaRef}
      >
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-xl">Use the mouse wheel!</h2>
          <p className="text-center text-sm">Scroll faster for coarse adjustments, and slower for fine adjustments</p>
          <h1 className="text-2xl font-bold">{value.toFixed(1)}</h1>
        </div>
      </div>
    );
  }
};

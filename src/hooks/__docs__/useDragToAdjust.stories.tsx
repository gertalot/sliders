/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef, useState } from "react";
import useDragAdjust from "../useDragToAdjust";

type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useDragAdjust example"
};

export default meta;

export const UseDragAdjustExample: StoryObj<BasicComponent> = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState(0);

    const { dragAdjust, isDragAdjusting } = useDragAdjust({ containerRef, sensitivity: 2 });

    useEffect(() => {
      if (isDragAdjusting) {
        setValue((prev) => prev + dragAdjust);
      }
    }, [dragAdjust, isDragAdjusting]);

    return (
      <div
        className="w-96 h-72 flex items-center justify-center bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none"
        ref={containerRef}
      >
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-xl">Drag vertically to scroll!</h2>
          <p className="text-center text-sm">Scroll faster for coarse adjustments, and slower for fine adjustments</p>
          <h1 className="text-2xl font-bold">{value.toFixed(1)}</h1>
        </div>
      </div>
    );
  }
};

/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef } from "react";
import useDragToMove from "../useDragToMove";

// there are no props or anything, so this is simple
type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useDragToMove basic example"
};

export default meta;

/**
 * A fancier example using an SVG
 */
export const UseDragToMoveSVGDemo: StoryObj<BasicComponent> = {
  render: () => {
    const dragAreaRef = useRef(null);
    const targetRef = useRef<SVGCircleElement>(null);
    const { isOnTarget, isDragging, position } = useDragToMove({
      dragAreaRef,
      targetRef,
      shouldStartDragOnTarget: false
    });

    // Styles for when we're hovering or dragging the target
    useEffect(() => {
      targetRef.current?.setAttribute("r", isOnTarget || isDragging ? "15" : "10");
      targetRef.current?.setAttribute("fill", isDragging ? "#fff" : "#ccc");
    }, [isDragging, isOnTarget]);

    return (
      <div className="relative w-96 h-72 bg-gray-900 p-0 border-white border-solid border-2 touch-none">
        <svg className="w-full h-full" ref={dragAreaRef}>
          <circle
            ref={targetRef}
            className={"cursor-pointer transition-transform duration-100 ease-in-out active:opacity-70"}
            cx={position?.x}
            cy={position?.y}
            r={10}
            fill="white"
            stroke="#333"
            strokeWidth={1}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-start justify-end pointer-events-none">
          <div className="text-xs font-mono">
            <div>
              target: {position?.x}, {position?.y}
            </div>
            <div>{[isOnTarget ? "on target" : null, isDragging ? "dragging" : null].filter(Boolean).join(", ")}</div>
          </div>
        </div>
      </div>
    );
  }
};

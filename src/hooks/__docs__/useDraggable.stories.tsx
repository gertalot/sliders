/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef, useState } from "react";
import useDraggable from "../useDraggable";

// there are no props or anything, so this is simple
type BasicComponent = FC;

const meta: Meta<BasicComponent> = {
  title: "useDraggable basic example"
};

export default meta;

/**
 * A minimal example
 */
export const UseDraggableBasicExample: StoryObj<BasicComponent> = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLSpanElement>(null);
    const { isOnTarget, isDragging, cursorPosition } = useDraggable({ containerRef, targetRef });
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => {
      const width = targetRef.current?.clientWidth;
      const height = targetRef.current?.clientHeight;
      setPosition((prev) =>
        cursorPosition && width && height
          ? {
              top: cursorPosition.y - height / 2,
              left: cursorPosition.x - width / 2
            }
          : prev
      );
    }, [cursorPosition]);
    return (
      <>
        <div
          className="w-96 h-72 bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none"
          ref={containerRef}
        >
          <span
            className="absolute inline-block w-20 h-16 bg-red-900 text-sm text-center p-0"
            style={{ top: position.top, left: position.left }}
            ref={targetRef}
          >
            {isOnTarget ? "Drag me!" : "click here to drag"}
          </span>
          <div className="text-xs font-mono">
            {cursorPosition && (
              <div>
                position: {cursorPosition.x}, {cursorPosition.y}
              </div>
            )}
            <div>{[isOnTarget ? "on target" : null, isDragging ? "dragging" : null].filter(Boolean).join(", ")}</div>
          </div>
        </div>
      </>
    );
  }
};

/**
 * A fancier example using an SVG
 */
export const UseDraggableSVGDemo: StoryObj<BasicComponent> = {
  render: () => {
    const containerRef = useRef<SVGSVGElement>(null);
    const targetRef = useRef<SVGCircleElement>(null);
    const { isOnTarget, isDragging, cursorPosition } = useDraggable({ containerRef, targetRef });

    // Styles for when we're hovering or dragging the target
    useEffect(() => {
      targetRef.current?.setAttribute("r", isOnTarget || isDragging ? "15" : "10");
      targetRef.current?.setAttribute("fill", isDragging ? "#fff" : "#ccc");
    }, [isDragging, isOnTarget]);

    return (
      <div className="relative w-96 h-72 bg-gray-900 p-0 border-white border-solid border-2 touch-none">
        <svg className="w-full h-full" ref={containerRef}>
          <circle
            ref={targetRef}
            className={`cursor-pointer transition-transform duration-100 ease-in-out active:opacity-70`}
            cx={cursorPosition.x}
            cy={cursorPosition.y}
            r={10}
            fill="white"
            stroke="#333"
            strokeWidth={1}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-start justify-end pointer-events-none">
          <div className="text-xs font-mono">
            <div>
              target: {cursorPosition?.x}, {cursorPosition?.y}
            </div>
            <div>{[isOnTarget ? "on target" : null, isDragging ? "dragging" : null].filter(Boolean).join(", ")}</div>
          </div>
        </div>
      </div>
    );
  }
};

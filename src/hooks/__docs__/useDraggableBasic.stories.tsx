/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { FC, useEffect, useRef, useState } from "react";
import useDraggable from "../useDraggable";

const BasicDraggableDemo: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const { isOnTarget, isDragging, isStartDragOnTarget, cursorPosition } = useDraggable({ containerRef, targetRef });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // update the position of the target
  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (isDragging && isStartDragOnTarget && cursorPosition && container && target) {
      setPosition({
        x: cursorPosition.x - container.clientTop - target.clientWidth / 2,
        y: cursorPosition.y - container.clientLeft - target.clientHeight / 2
      });
    }
  }, [isStartDragOnTarget, cursorPosition, isDragging]);

  return (
    <>
      <div
        className="w-96 h-72 bg-gray-900  text-white p-0 border-white border-solid border-2 touch-none select-none"
        ref={containerRef}
      >
        <span
          className="absolute inline-block w-20 h-16 bg-red-900 text-sm text-center p-1"
          style={{ top: position?.y, left: position?.x }}
          ref={targetRef}
        >
          {isOnTarget ? "Drag me!" : "click here to drag"}
        </span>
      </div>
      <div className="text-xs font-mono">
        {position && (
          <div>
            position: {position.x}, {position?.y}
          </div>
        )}
        <div>
          {[isOnTarget ? "on target" : null, isDragging ? "dragging" : null, isStartDragOnTarget ? "(from target)" : 0]
            .filter(Boolean)
            .join(", ")}
        </div>
      </div>
    </>
  );
};

const meta: Meta<typeof BasicDraggableDemo> = {
  title: "useDraggable basic",
  component: BasicDraggableDemo
};

export default meta;

export const BasicUseDraggable: StoryObj<typeof BasicDraggableDemo> = {
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLSpanElement>(null);
    const { isOnTarget, isDragging, isStartDragOnTarget, cursorPosition } = useDraggable({ containerRef, targetRef });
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    // update the position of the target
    useEffect(() => {
      const container = containerRef.current;
      const target = targetRef.current;
      if (isDragging && isStartDragOnTarget && cursorPosition && container && target) {
        setPosition({
          x: cursorPosition.x - container.clientTop - target.clientWidth / 2,
          y: cursorPosition.y - container.clientLeft - target.clientHeight / 2
        });
      }
    }, [isStartDragOnTarget, cursorPosition, isDragging]);

    return (
      <>
        <div
          className="w-96 h-72 bg-gray-900  text-white p-0 border-white border-solid border-2 touch-none select-none"
          ref={containerRef}
        >
          <span
            className="absolute inline-block w-20 h-16 bg-red-900 text-sm text-center p-1"
            style={{ top: position?.y, left: position?.x }}
            ref={targetRef}
          >
            {isOnTarget ? "Drag me!" : "click here to drag"}
          </span>
        </div>
        <div className="text-xs font-mono">
          {position && (
            <div>
              position: {position.x}, {position?.y}
            </div>
          )}
          <div>
            {[
              isOnTarget ? "on target" : null,
              isDragging ? "dragging" : null,
              isStartDragOnTarget ? "(from target)" : 0
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      </>
    );
  }
};

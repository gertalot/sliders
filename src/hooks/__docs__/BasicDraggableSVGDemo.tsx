import { FC, useEffect, useRef, useState } from "react";
import useDraggable from "../useDraggable";

const BasicDraggableSVGDemo: FC = () => {
  const containerRef = useRef<SVGSVGElement>(null);
  const targetRef = useRef<SVGCircleElement>(null);
  const { isOnTarget, isDragging, isStartDragOnTarget, cursorPosition } = useDraggable({ containerRef, targetRef });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // set initial position of the target to the center of the container
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.width / 2,
        y: rect.height / 2
      });
    }
  }, []);

  // Styles for when we're hovering or dragging the target
  useEffect(() => {
    targetRef.current?.setAttribute("r", isOnTarget || isStartDragOnTarget ? "15" : "10");
    targetRef.current?.setAttribute("fill", isStartDragOnTarget ? "#fff" : "#ccc");
  }, [isStartDragOnTarget, isOnTarget]);

  // update the position of the target
  useEffect(() => {
    if (isDragging && isStartDragOnTarget && cursorPosition && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: cursorPosition.x - rect.x,
        y: cursorPosition.y - rect.y
      });
    }
  }, [isStartDragOnTarget, cursorPosition, isDragging]);

  return (
    <div className="relative w-96 h-72 bg-gray-900  text-white p-0 border-white border-solid border-2 touch-none">
      <svg className="w-full h-full" ref={containerRef}>
        <circle
          ref={targetRef}
          className={`cursor-pointer transition-transform duration-100 ease-in-out active:opacity-70 ${
            position ? "" : "hidden"
          }`}
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
          {position && (
            <div>
              target: {position?.x}, {position?.y}
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
      </div>
    </div>
  );
};

export default BasicDraggableSVGDemo;

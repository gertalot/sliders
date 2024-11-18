import { useRef, useEffect } from "react";
import { useDragToMove } from "../../../sliders/src";

const UseDragToMoveComponent = () => {
  const dragAreaRef = useRef(null);
  const targetRef = useRef<SVGCircleElement>(null);

  const { isOnTarget, isDragging, position } = useDragToMove({
    dragAreaRef,
    targetRef,
    shouldStartDragOnTarget: false,
  });

  // Adjust appearance when the pointer is hovering or dragging
  useEffect(() => {
    targetRef.current?.setAttribute("r", isOnTarget || isDragging ? "15" : "10");
    targetRef.current?.setAttribute("fill", isDragging ? "#fff" : "#ccc");
  }, [isDragging, isOnTarget]);

  return (
    <div className="relative bg-gray-900 p-0 border-white border-solid border-2 touch-none">
      <svg className="w-full h-full" ref={dragAreaRef}>
        {position && (
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
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-start justify-end pointer-events-none">
        <div className="text-xs font-mono">
          <p>
            {position && (
              <>
                <span>
                  target: {position?.x.toFixed(0)}, {position?.y.toFixed(0)}
                </span>
                <p>{[isOnTarget ? "on target" : null, isDragging ? "dragging" : null].filter(Boolean).join(", ")}</p>
              </>
            )}
          </p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default UseDragToMoveComponent;

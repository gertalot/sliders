import { useRef, useState, useEffect } from "react";
import { useDragToAdjust } from "@gertalot/sliders";

const UseDragToAdjustComponent = () => {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  const { dragAdjust, isDragAdjusting } = useDragToAdjust({ dragAreaRef, sensitivity: 20 });

  useEffect(() => {
    if (isDragAdjusting) {
      setValue((prev) => prev + dragAdjust);
    }
  }, [dragAdjust, isDragAdjusting]);

  return (
    <div
      className="h-72 flex items-center justify-center bg-gray-900 p-0 border-white border-solid border-2 touch-none select-none"
      ref={dragAreaRef}
    >
      <div className="flex flex-col items-center space-y-2">
        <p className="text-xl">Drag vertically to change!</p>
        <p className="text-center text-sm">Scroll faster for coarse adjustments, and slower for fine adjustments</p>
        <h1 className="text-2xl font-bold">{value.toFixed(1)}</h1>
      </div>
    </div>
  );
};

export default UseDragToAdjustComponent;

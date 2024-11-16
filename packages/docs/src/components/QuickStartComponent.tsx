import { useRef, useState, useEffect } from "react";
import { useDragToAdjust, useWheelToAdjust } from "../../../sliders/src";

const QuickStartComponent = () => {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  const { wheelDelta, isScrolling } = useWheelToAdjust({
    dragAreaRef,
  });

  const { dragAdjust, isDragAdjusting } = useDragToAdjust({
    dragAreaRef,
    dragTouches: 2,
    sensitivity: 1,
  });

  useEffect(() => {
    if (isScrolling || isDragAdjusting) {
      setValue((prev) => prev + wheelDelta + dragAdjust);
    }
  }, [wheelDelta, dragAdjust, isScrolling, isDragAdjusting]);

  return (
    <div
      style={{
        backgroundColor: "#333",
        touchAction: "none",
        userSelect: "none",
        textAlign: "center",
      }}
      ref={dragAreaRef}
    >
      <p>Use mousewheel or drag to change value!</p>
      <p>{value.toFixed(0)}</p>
    </div>
  );
};

export default QuickStartComponent;

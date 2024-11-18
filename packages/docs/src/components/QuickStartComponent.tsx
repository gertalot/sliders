import { useRef, useState, useEffect } from "react";
import { useDragToAdjust, useWheelToAdjust } from "@gertalot/sliders";

const QuickStartComponent = () => {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  const { wheelDelta, isScrolling } = useWheelToAdjust({
    dragAreaRef,
    sensitivity: 10,
  });

  const { dragAdjust, isDragAdjusting } = useDragToAdjust({
    dragAreaRef,
    dragTouches: 2,
    sensitivity: 10,
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
        padding: "2rem",
      }}
      ref={dragAreaRef}
    >
      <p>Use mousewheel or drag to change value!</p>
      <h2>{value.toFixed(0)}</h2>
    </div>
  );
};

export default QuickStartComponent;

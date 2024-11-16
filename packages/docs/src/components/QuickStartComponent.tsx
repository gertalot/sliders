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
  });

  useEffect(() => {
    if (isScrolling || isDragAdjusting) {
      setValue((prev) => prev + wheelDelta + dragAdjust);
    }
  }, [wheelDelta, isScrolling, isDragAdjusting]);

  return (
    <div style={{ backgroundColor: "#333", touchAction: "none", userSelect: "none" }} ref={dragAreaRef}>
      <p>Use mousewheel to change value!</p>
      <h2 style={{ textAlign: "center" }}>{value.toFixed(1)}</h2>
    </div>
  );
};

export default QuickStartComponent;

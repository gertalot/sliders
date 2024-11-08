import { RefObject, useEffect, useState } from "react";
import useWheelToAdjust from "./useWheelToAdjust";
import useDragToMove from "./useDragToMove";

const useSlider = ({
  targetRef,
  containerRef,
  minValue = 0,
  maxValue = 1,
  initialValue = 0,
  sensitivity = 100,
  isVertical = true
}: {
  targetRef: RefObject<Element>;
  containerRef: RefObject<Element>;
  minValue?: number;
  maxValue?: number;
  initialValue?: number;
  sensitivity?: number;
  isVertical?: boolean;
}) => {
  const [value, setValue] = useState(initialValue);

  const { wheelDelta, isScrolling } = useWheelToAdjust({
    containerRef,
    sensitivity
  });

  const { isOnTarget, isOnContainer, isDragging, position } = useDragToMove({
    containerRef,
    targetRef,
    shouldStartDragOnTarget: false
  });

  useEffect(() => {
    if (isScrolling) {
      setValue((prev) => Math.max(minValue, Math.min(prev + wheelDelta, maxValue)));
    }
  }, [wheelDelta, isScrolling, minValue, maxValue]);

  useEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (isDragging && position && rect) {
      setValue(() =>
        Math.max(
          minValue,
          Math.min(
            isVertical
              ? minValue + (position.y / rect.height) * (maxValue - minValue)
              : minValue + (position.x / rect.width) * (maxValue - minValue),
            maxValue
          )
        )
      );
    }
  }, [containerRef, isDragging, isVertical, maxValue, minValue, position]);

  return { value, isAdjusting: isScrolling || isDragging, isOnTarget, isOnContainer };
};

export default useSlider;

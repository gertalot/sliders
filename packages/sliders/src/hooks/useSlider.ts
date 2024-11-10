import { RefObject, useEffect, useState } from "react";
import { useWheelToAdjust } from "./useWheelToAdjust";
import { useDragToMove } from "./useDragToMove";

interface UseSliderProps {
  targetRef: RefObject<Element>;
  dragAreaRef: RefObject<Element>;
  minValue?: number;
  maxValue?: number;
  initialValue?: number;
  sensitivity?: number;
  isVertical?: boolean;
}

interface UseSliderResult {
  value: number;
  isAdjusting: boolean;
  isOnTarget: boolean;
  isOnDragArea: boolean;
}

/**
 * A custom React hook that registers horizontal or vertical dragging actions from the user that start on the element
 * referenced by `dragAreaRef`. This hook responds to touch and mouse events, and will return a value between `minValue`
 * and `maxValue` corresponding to the distance of the dragging action relative to the drag area.
 *
 * This hook responds to the user dragging the target, clicking or touching along the drag area, or using the mouse
 * wheel.
 *
 * This hook can be configured to return a value between `minValue` and `maxValue` inclusive (defaults to 0-1), and the
 * sensitivity of the mouse wheel can be configured as well. Finally, the hook can be configured to respond to horizontal
 * or vertical dragging motions.
 *
 * @param {UseSliderProps} props
 * @param {RefObject<Element>} props.targetRef a reference to the element that will be dragged
 * @param {RefObject<Element>} props.dragAreaRef a reference to the element that will be dragged
 * @param {number} [props.minValue=0] the minimum value that will be returned. Corresponds to the left- or topmost point
 * @param {number} [props.maxValue=1] the maximum value that will be returned. Corresponds to the right- or bottommost point
 * @param {number} [props.initialValue=0] set the initial value
 * @param {number} [props.sensitivity=100] the sensitivity of the mouse wheel; higher values mean slower changes
 * @param {boolean} [props.isVertical=true] whether to respond to vertical or horizontal dragging
 *
 * @todo configurable left-to-right/top-to-bottom or right-to-left/bottom-to-top drag direction. Currently left/top
 * corresponds to minValue and right/bottom corresponds to maxValue.
 */
const useSlider = ({
  targetRef,
  dragAreaRef,
  minValue = 0,
  maxValue = 1,
  initialValue = 0,
  sensitivity = 100,
  isVertical = true
}: UseSliderProps): UseSliderResult => {
  const [value, setValue] = useState(initialValue);

  // the two custom hooks that handle all the dragging and mouse-wheeling
  const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity });
  const { isOnTarget, isOnDragArea, isDragging, position } = useDragToMove({
    dragAreaRef,
    targetRef,
    shouldStartDragOnTarget: false
  });

  // respond to mouse wheel changes
  useEffect(() => {
    if (isScrolling) {
      setValue((prev) => Math.max(minValue, Math.min(prev + wheelDelta, maxValue)));
    }
  }, [wheelDelta, isScrolling, minValue, maxValue]);

  // respond to changes in pointer position while dragging
  useEffect(() => {
    const rect = dragAreaRef.current?.getBoundingClientRect();
    if (isDragging && position && rect) {
      // linear mapping between pointer position coordinates and min/max values
      const newValue = isVertical
        ? minValue + (position.y / rect.height) * (maxValue - minValue)
        : minValue + (position.x / rect.width) * (maxValue - minValue);

      // clamp the value between min and max - in case the user drags outside the drag area
      setValue(() => Math.max(minValue, Math.min(newValue, maxValue)));
    }
  }, [dragAreaRef, isDragging, isVertical, maxValue, minValue, position]);

  return { value, isAdjusting: isScrolling || isDragging, isOnTarget, isOnDragArea };
};

export { useSlider };
export type { UseSliderProps, UseSliderResult };

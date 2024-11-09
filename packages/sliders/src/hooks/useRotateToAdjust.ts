import { useEffect, RefObject, useState, useMemo, useLayoutEffect } from "react";
import useDragToMove from "./useDragToMove";
import useWheelToAdjust from "./useWheelToAdjust";
import useDragToAdjust from "./useDragToAdjust";
import { Point2D, TAU, pointToAngle } from "../utils";

const normalisedAngle = (angle: number) => {
  const modAngle = angle % TAU;
  return (modAngle < 0 ? modAngle + TAU : modAngle) % TAU;
};

/**
 * A custom hook that can be used to rotate an element around a center and track the
 * angle of rotation.
 *
 * @param props.dragAreaRef the dragArea element for the widget
 * @param props.targetRef the element that can be dragged around a center
 * @param props.initialAngle the initial angle in radians from 0 - 2*Math.PI, where 0 correponds
 *                           to 3 o'clock, and 1/4*pi is 6 o'clock (angle increases clockwise)
 * @param props.origin the center around which the rotation is being tracked
 * @returns Props with `isDragging`, and `isOnTarget` from the `useDragToMove` hook;
 *          `angle` is the current angle of rotation in `[0,2*pi)`;
 *          `fullRotations` is the number of full rotations clockwise or anti-clockwise;
 *          `totalAngle` = `fullRotations * 2*pi + angle`
 */
const useRotateToAdjust = ({
  dragAreaRef,
  targetRef,
  initialAngle = 0,
  origin = null
}: {
  dragAreaRef: RefObject<Element>;
  targetRef: RefObject<Element>;
  initialAngle?: number;
  origin?: Point2D | null;
}) => {
  const [totalAngle, setTotalAngle] = useState<number>(initialAngle);
  const [origin_, setOrigin] = useState<Point2D | null>(null);

  // set the origin to what was passed in, or set it to the center of `fromRect`
  // if we have one, or set it to 0,0 if all else fails.
  useLayoutEffect(() => {
    setOrigin(() => {
      if (origin) return origin;
      const fromRect = dragAreaRef.current?.getBoundingClientRect();
      if (fromRect) return { x: fromRect.width / 2, y: fromRect.height / 2 };
      return { x: 0, y: 0 };
    });
  }, [dragAreaRef, origin]);

  const { isDragging, isOnTarget, position } = useDragToMove({ dragAreaRef, targetRef });
  const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 100 });
  const { dragAdjust, isDragAdjusting } = useDragToAdjust({ dragAreaRef, sensitivity: 100, verticalDragging: true });

  useEffect(() => {
    setTotalAngle((prevTotalAngle) => {
      // pick apart the total angle into an angle between 0-2*PI,
      // and the number of full rotations the totalAngle represents
      const angle = normalisedAngle(prevTotalAngle);
      const fullRotations = Math.floor(prevTotalAngle / TAU);

      // calculate the new angle based on one of the following:
      // - a new cursor position from useDragToMove if the user is dragging the target element
      // - a difference in scroll wheel rotation from useWheelToAdjust
      // - a difference in cursor position from useDragToAdjust if the user is dragging up or down
      const newNormalisedAngle = normalisedAngle(
        origin_ && isDragging ? pointToAngle(position || { x: 0, y: 0 }, origin_) : angle + wheelDelta + dragAdjust
      );

      // If the new angle is "past" the point where angle=0, the user has rotated past a full rotation,
      // and we need to figure out if the rotation was clockwise or anti-clockwise, and update the
      // number of full rotations accordingly
      const isClockwise = (angle - newNormalisedAngle + TAU) % TAU > 0.5 * TAU;
      const incRotations = isClockwise && newNormalisedAngle < angle ? 1 : 0;
      const decRotations = !isClockwise && newNormalisedAngle > angle ? -1 : 0;
      const newFullRotations = fullRotations + incRotations + decRotations;

      // finally we can determine the new angle
      const newTotalAngle = newNormalisedAngle + TAU * newFullRotations;
      return newTotalAngle;
    });
  }, [wheelDelta, dragAdjust, position, isDragging, origin_]);

  const returnValue = useMemo(
    () => ({
      isRotating: isDragging || isScrolling || isDragAdjusting,
      isOnTarget,
      angle: normalisedAngle(totalAngle),
      fullRotations: Math.floor(totalAngle / TAU),
      totalAngle
    }),
    [isDragging, isScrolling, isDragAdjusting, isOnTarget, totalAngle]
  );

  return returnValue;
};

export default useRotateToAdjust;

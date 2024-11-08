import { useEffect, RefObject, useCallback, useRef } from "react";
import useDragToMove from "./useDragToMove";
import useWheelToAdjust from "./useWheelToAdjust";
import useDragToAdjust from "./useDragToAdjust";
import { Point2D, TAU, pointToAngle } from "../utils";

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
const useRotateToMove = ({
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
  const totalAngle = useRef<number>(initialAngle);
  const angle = useRef<number>(totalAngle.current % TAU);
  const fullRotations = useRef<number>(Math.floor(totalAngle.current / TAU));
  const origin_ = useRef<Point2D | null>(null);

  // set the origin to what was passed in, or set it to the center of `fromRect`
  // if we have one, or set it to 0,0 if all else fails.
  useEffect(() => {
    if (origin) {
      origin_.current = origin;
    } else {
      const fromRect = dragAreaRef.current?.getBoundingClientRect();
      if (fromRect) {
        origin_.current = { x: fromRect.width / 2, y: fromRect.height / 2 };
      } else {
        origin_.current = { x: 0, y: 0 };
      }
    }
  }, [dragAreaRef, origin]);

  // get the basic custom hook that takes care of dragging and sliding behaviour
  const { isDragging, isOnTarget, position } = useDragToMove({ dragAreaRef, targetRef });

  // convenience function that updates this hook's internal state, used below
  const updateAngle = useCallback(
    (newAngle: number) => {
      const isClockwise = (angle.current - newAngle + TAU) % TAU > 0.5 * TAU;
      const incRotations = isClockwise && newAngle < angle.current ? 1 : 0;
      const decRotations = !isClockwise && newAngle > angle.current ? -1 : 0;
      const newFullRotations = fullRotations.current + incRotations + decRotations;
      const newTotalAngle = newAngle + TAU * newFullRotations;

      totalAngle.current = newTotalAngle;
      fullRotations.current = newFullRotations;
      angle.current = newAngle;
    },
    [angle, fullRotations]
  );

  // update the angle when the user is dragging the target
  useEffect(() => {
    if (origin_.current && position && isDragging) {
      const newAngle = pointToAngle(position, origin_.current);
      updateAngle(newAngle);
    }
  }, [angle, position, fullRotations, isDragging, origin_, updateAngle]);

  // update the angle when the user is rotating the mouse wheel
  const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 100 });
  useEffect(() => {
    const newAngle = angle.current + wheelDelta;
    const newNormalisedAngle = (newAngle < 0 ? newAngle + TAU : newAngle) % TAU;
    updateAngle(newNormalisedAngle);
  }, [wheelDelta, updateAngle]);

  // do something clever when the user is dragging up or down
  const { dragAdjust, isDragAdjusting } = useDragToAdjust({ dragAreaRef, sensitivity: 100, verticalDragging: true });
  useEffect(() => {
    const newAngle = angle.current + dragAdjust;
    const newNormalisedAngle = (newAngle < 0 ? newAngle + TAU : newAngle) % TAU;
    updateAngle(newNormalisedAngle);
  }, [dragAdjust, updateAngle]);

  return {
    isRotating: isDragging || isScrolling || isDragAdjusting,
    isOnTarget,
    angle: angle.current,
    fullRotations: fullRotations.current,
    totalAngle: totalAngle.current
  };
};

export default useRotateToMove;

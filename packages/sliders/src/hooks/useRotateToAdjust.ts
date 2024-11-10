import { useEffect, RefObject, useState, useMemo, useLayoutEffect } from "react";
import { useDragToMove } from "./useDragToMove";
import { useWheelToAdjust } from "./useWheelToAdjust";
import { useDragToAdjust } from "./useDragToAdjust";
import { Point2D, TAU, normalisedAngle, pointToAngle } from "../utils";

/**
 * Interface for the `useRotateToAdjust` hook
 */
interface UseRotateToAdjustProps {
  /** When the pointer is over this element, this hook will respond to dragging */
  dragAreaRef: RefObject<Element>;
  /** The target element whose position is being adjusted */
  targetRef: RefObject<Element>;
  /** Initial angle of the position of the target element relative to the origin, in radians from 0 to 2*Math.PI
   * @default 0
   */
  initialAngle?: number;
  /** coordinates of the center of rotation, relative to the dragArea bounding box
   * @default the center of the dragArea
   */
  origin?: Point2D | null;
}

/**
 * Interface for the result of the `useRotateToAdjust` hook
 */
interface UseRotateToAdjustResult {
  isRotating: boolean;
  isOnTarget: boolean;
  angle: number;
  fullRotations: number;
  totalAngle: number;
}

/**
 * A custom react hook that registers dragging and mouse wheel actions and returns an angle representing
 * a rotation of the target element relative to the origin.
 *
 * This custom hook allows for creating UI elements such as knobs and dials that can be adjusted by dragging
 * or using the mouse wheel.
 *
 * @param {UseRotateToAdjustProps} props - the configuration options for this hook
 * @param {RefObject<Element>} props.dragAreaRef - this hook will register dragging actions that occur on this element.
 * @param {RefObject<Element>} props.targetRef - the target element, i.e. the element that the user is rotating
 * @param {number} [props.initialAngle=0] - the initial angle of the target element relative to the origin
 * @param {Point2D} [props.origin=null] - the center of rotation, relative to the dragArea bounding box
 *
 * @returns {UseRotateToAdjustResult} Properties that indicate the current state of the hook, such as whether the user
 * is currently rotating, and the angle of the target element relative to the origin
 *
 * @example
 * const MyComponent = () => {
 *  const dragAreaRef = useRef<SVGSVGElement>(null);
 *  const targetRef = useRef<SVGCircleElement>(null);
 *
 *  const { isRotating, isOnTarget, angle, totalAngle } = useRotateToAdjust({
 *    dragAreaRef,
 *    targetRef
 *  });
 *
 *  const [position, setPosition] = useState<Point2D | null>(null);
 *
 *  // Show when we're hovering or dragging the target
 *  useEffect(() => {
 *    targetRef.current?.setAttribute("r", isOnTarget ? "12" : "10");
 *  }, [isOnTarget]);
 *
 *  useEffect(() => {
 *    const newPosition = angleToPoint(angle, { x: 0, y: 0 }, 80);
 *    setPosition((prev) => (pointEquals(prev, newPosition) ? prev : newPosition));
 *  }, [angle]);
 *
 *  return (
 *    <svg
 *      style={{ width: "90vw", height: "90vh", backgroundColor: "#333" }}
 *      viewBox="-100 -100 200 200"
 *      ref={dragAreaRef}
 *    >
 *      <circle ref={targetRef} cx={position?.x} cy={position?.y} r={10} fill="white" />
 *      <text fill="white">{totalAngle.toFixed(2)}</text>
 *    </svg>
 *  );
 *}
 */
const useRotateToAdjust = ({
  dragAreaRef,
  targetRef,
  initialAngle = 0,
  origin = null
}: UseRotateToAdjustProps): UseRotateToAdjustResult => {
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

  // allow the user to change the angle by either dragging the target element, or
  // by using the scroll wheel, or by dragging up or down in the dragArea. Use these
  // custom hooks to take care of handling all these UI events and just look at the values
  // that they return
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

export { useRotateToAdjust };
export type { UseRotateToAdjustProps, UseRotateToAdjustResult };

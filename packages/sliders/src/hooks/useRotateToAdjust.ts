import { useEffect, RefObject, useState, useMemo, useCallback, useLayoutEffect } from "react";
import { useDragToMove } from "./useDragToMove";
import { useWheelToAdjust } from "./useWheelToAdjust";
import { useDragToAdjust } from "./useDragToAdjust";
import {
  Nullable,
  Point2D,
  TAU,
  angleToValue,
  clamp,
  normalisedAngle,
  pointEquals,
  pointToAngle,
  valueToAngle
} from "../utils";

type UseRotateToAdjustBaseProps = {
  dragAreaRef: RefObject<Element>;
  targetRef: RefObject<Element>;
  origin?: Nullable<Point2D> | Nullable<() => Nullable<Point2D>>;
};

type UseRotateToAdjustPropsWithRangedAngle = UseRotateToAdjustBaseProps & {
  minAngle: number;
  maxAngle: number;
  angle?: number;
};

type UseRotateToAdjustPropsWithRangedValue = UseRotateToAdjustBaseProps & {
  minAngle: number;
  maxAngle: number;
  minValue: number;
  maxValue: number;
  value?: number;
};

type UseRotateToAdjustProps =
  | UseRotateToAdjustBaseProps
  | UseRotateToAdjustPropsWithRangedAngle
  | UseRotateToAdjustPropsWithRangedValue;

/**
 * Interface for the result of the `useRotateToAdjust` hook
 */
interface UseRotateToAdjustResult {
  isRotating: boolean;
  isOnTarget: boolean;
  angle: number;
  fullRotations: number;
  totalAngle: number;
  value: number | null;
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
const useRotateToAdjust = (props: UseRotateToAdjustProps): UseRotateToAdjustResult => {
  // Type narrowing to parse the props. Start with the basics:
  const { dragAreaRef, targetRef, origin } = props;

  // we may have min/max angles
  const minAngle = "minAngle" in props ? props.minAngle : -Infinity;
  const maxAngle = "maxAngle" in props ? props.maxAngle : Infinity;

  // we may have min/max values
  const minValue = "minValue" in props ? props.minValue : -Infinity;
  const maxValue = "maxValue" in props ? props.maxValue : Infinity;

  // if we have minValue we have maxValue and we should use values instead of angles
  const hasValue = "minValue" in props;

  // if we have a value we set it, otherwise we set it to null and ignore it - we
  // just use angles instead. If we do have a value, we also have min/max values.
  const value = hasValue ? clamp(props.value, minValue, maxValue) : null;

  // if we have a value, we have min and max values and angles, so map it to the angle.
  // Otherwise, we just use angles. If we have min/max angles, clamp the angle to that range.
  // If we only have an angle, use that.
  const angle = ((): number => {
    if (hasValue) {
      return valueToAngle(value ?? 0, minValue, maxValue, minAngle, maxAngle);
    } else if ("minAngle" in props) {
      return clamp(props.angle, minAngle, maxAngle);
    } else {
      return "angle" in props ? ((props.angle as number | null) ?? 0) : 0;
    }
  })();

  // we track the angle, and maybe map it to a value when we return from this hook
  const [totalAngle, setTotalAngle] = useState<number>(angle);
  const [origin_, setOrigin] = useState<Point2D>({ x: 0, y: 0 });

  // allow the user to change the angle by either dragging the target element, or
  // by using the scroll wheel, or by dragging up or down in the dragArea. Use these
  // custom hooks to take care of handling all these UI events and just look at the values
  // that they return
  const { isDragging, isOnTarget, position } = useDragToMove({ dragAreaRef, targetRef });
  const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 100 });
  const { dragAdjust, isDragAdjusting } = useDragToAdjust({ dragAreaRef, sensitivity: 100, verticalDragging: true });

  // If we weren't passed an origin, default to using the center of the dragArea as
  // the origin, which is probably what the user wants (instead of using 0,0 which is
  // the top-left corner).
  const defaultOriginFunction = useCallback(() => {
    if (dragAreaRef.current) {
      const rect = dragAreaRef.current.getBoundingClientRect();
      const newOrigin: Point2D = { x: rect.width / 2, y: rect.height / 2 };
      return newOrigin;
    }
  }, [dragAreaRef]);

  // The updateOrigin function and the useEffect below update the origin of rotation
  // when the dragArea element resizes if the origin is a function.
  // It doesn't do anything otherwise.
  const updateOrigin = useCallback(() => {
    // get a function that returns the origin. If we were passed a function, use that.
    // if we were passed a Point2D instead, return a function that returns that point.
    // Otherwise, origin is null or undefined, so we use the defaultOriginFunction above.
    const originFunction = typeof origin === "function" ? origin : origin ? () => origin : defaultOriginFunction;

    setOrigin((prev) => {
      const newOrigin = originFunction();
      if (!pointEquals(newOrigin, prev)) return newOrigin || { x: 0, y: 0 };
      else return prev;
    });
  }, [defaultOriginFunction, origin]);

  useLayoutEffect(() => {
    const dragArea = dragAreaRef.current;
    // use ResizeObserver on modern browsers or fall back to
    // window.addEventListener if it's not supported
    if (typeof ResizeObserver === "undefined") {
      updateOrigin();
      window.addEventListener("resize", updateOrigin);
      return () => window.removeEventListener("resize", updateOrigin);
    } else {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === dragAreaRef.current) {
            updateOrigin();
          }
        }
      });
      if (dragArea) observer.observe(dragArea);

      return () => {
        if (dragArea) observer.unobserve(dragArea);
        observer.disconnect();
      };
    }
  }, [dragAreaRef, origin, updateOrigin]);

  // update the angle based on user actions
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
        isDragging ? pointToAngle(position || { x: 0, y: 0 }, origin_) : angle + wheelDelta + dragAdjust
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
      return clamp(newTotalAngle, minAngle, maxAngle);
    });
  }, [wheelDelta, dragAdjust, position, isDragging, origin_, minAngle, maxAngle]);

  const returnValue = useMemo(
    () => ({
      isRotating: isDragging || isScrolling || isDragAdjusting,
      isOnTarget,
      angle: normalisedAngle(totalAngle),
      fullRotations: Math.floor(totalAngle / TAU),
      totalAngle,
      value: hasValue ? angleToValue(totalAngle, minValue, maxValue, minAngle, maxAngle) : null
    }),
    [isDragging, isScrolling, isDragAdjusting, isOnTarget, totalAngle, hasValue, minValue, maxValue, minAngle, maxAngle]
  );

  return returnValue;
};

export { useRotateToAdjust };
export type { UseRotateToAdjustProps, UseRotateToAdjustResult };

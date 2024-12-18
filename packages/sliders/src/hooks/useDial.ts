import { useEffect, type RefObject, useState, useMemo, useCallback, useLayoutEffect } from "react";
import { useDragToMove } from "./useDragToMove.js";
import { useWheelToAdjust } from "./useWheelToAdjust.js";
import { useDragToAdjust } from "./useDragToAdjust.js";
import {
  type Nullable,
  type Point2D,
  TAU,
  angleToValue,
  clamp,
  normalisedAngle,
  pointEquals,
  pointToAngle,
  valueToAngle
} from "../utils/index.js";

/**
 * type for the props of the `useDial` hook. This is the most basic
 * version, without minimum or maximum angles. It will just return the total
 * angle.
 */
type UseDialBaseProps = {
  dragAreaRef: RefObject<Element>;
  targetRef: RefObject<Element>;
  origin?: Nullable<Point2D> | Nullable<() => Nullable<Point2D>>;
};

/**
 * type for the props of the `useDial` hook. This allows for setting
 * minimum and maximum angles, and optionally the current angle.
 */
type UseDialPropsWithRangedAngle = UseDialBaseProps & {
  minAngle: number;
  maxAngle: number;
  angle?: number;
};

/**
 * type for the props of the `useDial` hook. This allows for working
 * with values mapped to angles, so instead of using the angle in the result
 * of this hook, you can use a mapped value, e.g. to model a percentage, volume
 * setting, temperature on a thermostat, etc.
 */
type UseDialPropsWithRangedValue = UseDialBaseProps & {
  minAngle: number;
  maxAngle: number;
  minValue: number;
  maxValue: number;
  value?: number;
};

/**
 * type for the props of the `useDial` hook. The hook accepts either
 * a basic set of props, a set of props that specify min/max angles, or props
 * that map an angle to a value.
 */
type UseDialProps = UseDialBaseProps | UseDialPropsWithRangedAngle | UseDialPropsWithRangedValue;

/**
 * Interface for the result of the `useDial` hook
 */
interface UseDialResult {
  isRotating: boolean;
  isOnTarget: boolean;
  angle: number;
  fullRotations: number;
  totalAngle: number;
  value: number | null;
}

type InitializedProps = UseDialPropsWithRangedValue & {
  hasValue: boolean;
  angle: number | null;
};
/**
 * Utility function that parses the props of the `useDial` hook and returns
 * an object with properties that make sense
 */
const parseUseDialProps = (props: UseDialProps): InitializedProps => {
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

  return { dragAreaRef, targetRef, origin, minAngle, maxAngle, minValue, maxValue, hasValue, angle };
};

/**
 * utility function (custom hook) to handle updating the origin of rotation for the `useDial` hook
 */
const useUpdateOrigin = ({ dragAreaRef, origin }: InitializedProps): Point2D => {
  const [origin_, setOrigin] = useState<Point2D>({ x: 0, y: 0 });

  const defaultOriginFunction = useCallback(() => {
    if (dragAreaRef.current) {
      const rect = dragAreaRef.current.getBoundingClientRect();
      const newOrigin: Point2D = { x: rect.width / 2, y: rect.height / 2 };
      return newOrigin;
    }
    return null;
  }, [dragAreaRef]);

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

  return origin_;
};

/**
 * A custom react hook that registers dragging and mouse wheel actions and returns an angle representing
 * a rotation of the target element relative to the origin.
 *
 * This custom hook allows for creating UI elements such as knobs and dials that can be adjusted by dragging
 * or using the mouse wheel.
 *
 * @param {UseDialProps} props - the configuration options for this hook
 * @param {RefObject<Element>} props.dragAreaRef - this hook will register dragging actions that occur on this element.
 * @param {RefObject<Element>} props.targetRef - the target element, i.e. the element that the user is rotating
 * @param {Point2D} [props.origin=null] - the center of rotation, relative to the dragArea bounding box. This can be an
 * `{x,y}` coordinate, or a function of no arguments that returns an `{x,y}` coordinate - which can be used to update
 * the origin when the size of the component changes, for example. If the origin is not provided, it will automatically
 * set it to the center of the dragArea element.
 *
 * @returns {UseDialResult} Properties that indicate the current state of the hook, such as whether the user
 * is currently rotating, and the angle of the target element relative to the origin:
 * `result.isRotating` - `true` if the user is currently performing a dragging action;
 * `result.isOnTarget` - `true` if the pointer is currently over the target element;
 * `result.angle` - an angle between 0 and 2π (where 0 is the positive x-axis), representing the angle of the target
 * element relative to the origin. This can be used to position the target element or otherwise represent a rotation
 * in a component;
 * `result.fullRotations` - while `angle` is always between 0-2π, the user can potentially rotate "past" a full rotation
 * if the min/max angles allow for it. `fullRotations` is the number of full rotations;
 * `result.totalAngle` - the total angle of rotation, which can be anywhere between `minAngle` and `maxAngle`.
 * `result.value` - if this hook was given min/max angles and values, we will map the resulting angle to a value and
 * return it
 *
 * @example
 * const MyComponent = () => {
 *  const dragAreaRef = useRef<SVGSVGElement>(null);
 *  const targetRef = useRef<SVGCircleElement>(null);
 *
 *  const { isRotating, isOnTarget, angle, totalAngle } = useDial({
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
const useDial = (props: UseDialProps): UseDialResult => {
  const initializedProps = parseUseDialProps(props);
  const { dragAreaRef, targetRef, minAngle, maxAngle, minValue, maxValue, hasValue, angle } = initializedProps;

  // we track the angle, and maybe map it to a value when we return from this hook
  const [totalAngle, setTotalAngle] = useState<number>(angle ?? 0);

  // allow the user to change the angle by either dragging the target element, or
  // by using the scroll wheel, or by dragging up or down in the dragArea. Use these
  // custom hooks to take care of handling all these UI events and just look at the values
  // that they return
  const { isDragging, isOnTarget, position } = useDragToMove({ dragAreaRef, targetRef });
  const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 100 });
  const { dragAdjust, isDragAdjusting } = useDragToAdjust({
    dragAreaRef,
    sensitivity: 100,
    measureVerticalDragging: true
  });

  // use a utility custom hook to handle updating the origin
  const origin_ = useUpdateOrigin(initializedProps);

  // update the angle based on user actions
  useEffect(() => {
    setTotalAngle((prevTotalAngle) => {
      // pick apart the total angle into an angle between 0-2π,
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

export { useDial };
export type { UseDialProps, UseDialResult };

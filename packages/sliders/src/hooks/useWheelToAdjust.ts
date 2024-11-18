import { useEffect, useState, type RefObject, useCallback, useRef } from "react";
import { isPointInRect } from "../utils/index.js";

/**
 * Interface for the `useWheelToAdjust` hook
 */
interface UseWheelToAdjustProps {
  /** When the pointer is over this element, this hook will respond to dragging */
  dragAreaRef: RefObject<Element>;
  /**
   * Determines quickly the resulting value changes in response to the user dragging
   * Higher sensitivity values result in smaller adjustments for the same dragging distance
   * @default 100
   */
  sensitivity?: number;
}

/**
 * Interface for the result of the `useWheelToAdjust` hook
 */
interface UseWheelToAdjustResult {
  /** a value corresponding to the current speed of the mouse wheel */
  wheelDelta: number;
  /** whether the mouse wheel is currently rotating */
  isScrolling: boolean;
}

/**
 * A custom React hook that registers mouse wheel rotation from the user that start on the element
 * referenced by `dragAreaRef`. This hook detects how fast the user is rotating the mouse wheel and
 * returns a value corresponding to the speed of the mouse wheel.
 *
 * This custom hooks allows for creating UI elements that can be adjusted by using the mouse wheel,
 * such as sliders, or values that change in response to user input.
 *
 * @param {useWheelToAdjustProps} props
 * @param {RefObject<Element>} props.dragAreaRef a reference to the element that will be dragged
 * @param {number} [props.sensitivity=100] the sensitivity of the mouse wheel; higher values mean slower changes
 *
 * @returns {UseWheelToAdjustResult} An object containing the current wheel speed and whether the mouse wheel
 * is currently rotating
 *
 * @example
 * const MyComponent = () => {
 *   const dragAreaRef = useRef<HTMLDivElement>(null);
 *   const [value, setValue] = useState(0);
 *
 *   const { wheelDelta, isScrolling } = useWheelToAdjust({ dragAreaRef, sensitivity: 2 });
 *
 *   useEffect(() => {
 *     if (isScrolling) {
 *       setValue((prev) => prev + wheelDelta);
 *     }
 *   }, [wheelDelta, isScrolling]);
 *
 *   return (
 *     <div style={{ width: "90vw", height: "90vh", backgroundColor: "#333" }} ref={dragAreaRef}>
 *       <h1 style={{ textAlign: "center" }}>{value.toFixed(1)}</h1>
 *     </div>
 *   );
 * }
 */
const useWheelToAdjust = ({ dragAreaRef, sensitivity = 100 }: UseWheelToAdjustProps): UseWheelToAdjustResult => {
  const lastWheelEventTime = useRef<number>(0);
  const [wheelDelta, setWheelDelta] = useState<number>(0);

  // Respond to mouse wheel events by increasing or decreasing the angle
  const handleWheel = useCallback(
    (e: unknown) => {
      const event = e as WheelEvent;
      const dragAreaRect = dragAreaRef.current?.getBoundingClientRect();
      const position = { x: event.clientX, y: event.clientY };

      // there might be other elements the pointer is over, so we can't rely
      // on event.target or event.composedPath to determine if we're on the dragArea or target
      const onDragArea = isPointInRect(position, dragAreaRect);

      if (onDragArea) {
        event.preventDefault(); // don't scroll the page

        // the more time has passed since the last wheel event, the slower
        // it is rotating. Compute a new speed delta based on rotation speed
        const currentTime = performance.now();
        const timeDelta = currentTime - lastWheelEventTime.current;
        const delta = timeDelta == 0 ? 0 : -event.deltaY / timeDelta / sensitivity;

        setWheelDelta((prev) => (delta == prev ? prev : delta));
        lastWheelEventTime.current = currentTime;
      }
    },
    [dragAreaRef, sensitivity]
  );

  useEffect(() => {
    // Reset speed to 0 if no wheel event occurs for 200ms
    const timer = setTimeout(() => setWheelDelta(0), 200);
    return () => clearTimeout(timer);
  }, [wheelDelta]);

  // add an event listener on the dragArea for wheel events
  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [dragAreaRef, handleWheel]);

  return { wheelDelta, isScrolling: wheelDelta != 0 };
};

export { useWheelToAdjust };
export type { UseWheelToAdjustProps, UseWheelToAdjustResult };

import { useEffect, useState, RefObject, useCallback, useRef } from "react";
import { isPointInRect } from "../utils";

/**
 * Custom hook that tracks how fast the mouse wheel is rotating. This hook adds a "wheel"
 * event listener to the element referenced by `dragAreaRef`, and sets the `wheelDelta`
 * to reflect how quickly wheel events are coming in (i.e. how fast the wheel is rotating).
 *
 * @param props.dragAreaRef the element that listens to wheel events
 * @param props.sensitivity increase to reduce speed; default is 100
 * @returns props with `wheelDelta` representing the rotating speed of the mouse wheel
 */
const useWheelToAdjust = ({
  dragAreaRef,
  sensitivity = 100
}: {
  dragAreaRef: RefObject<Element>;
  sensitivity?: number;
}) => {
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
        const delta = -event.deltaY / timeDelta / sensitivity;

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

export default useWheelToAdjust;

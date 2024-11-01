import { useEffect, useState, RefObject, useCallback, useRef } from "react";

/**
 * Custom hook that tracks how fast the mouse wheel is rotating. This hook adds a "wheel"
 * event listener to the element referenced by `containerRef`, and sets the `wheelDelta`
 * to reflect how quickly wheel events are coming in (i.e. how fast the wheel is rotating).
 *
 * @param props.containerRef the element that listens to wheel events
 * @param props.sensitivity increase to reduce speed; default is 100
 * @returns props with `wheelDelta` representing the rotating speed of the mouse wheel
 */
const useWheelSpeed = ({
  containerRef,
  sensitivity = 100
}: {
  containerRef: RefObject<Element>;
  sensitivity: number;
}) => {
  const lastWheelEventTime = useRef<number>(0);
  const [wheelDelta, setWheelDelta] = useState<number>(0);

  // Respond to mouse wheel events by increasing or decreasing the angle
  const handleWheel = useCallback(
    (e: unknown) => {
      const event = e as WheelEvent;
      event.preventDefault(); // don't scroll the page

      // the more time has passed since the last wheel event, the slower
      // it is rotating. Compute a new speed delta based on rotation speed
      const currentTime = performance.now();
      const timeDelta = currentTime - lastWheelEventTime.current;
      const delta = event.deltaY / timeDelta / sensitivity;

      setWheelDelta((prev) => (delta == prev ? prev : delta));
      lastWheelEventTime.current = currentTime;
    },
    [sensitivity]
  );

  useEffect(() => {
    // Reset speed to 0 if no wheel event occurs for 500ms
    const timer = setTimeout(() => setWheelDelta(0), 500);
    return () => clearTimeout(timer);
  }, [wheelDelta]);

  // add an event listener on the container for wheel events
  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener("wheel", handleWheel);
    return () => {
      container?.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, handleWheel]);

  return { wheelDelta };
};

export default useWheelSpeed;

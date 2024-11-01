import { useEffect, useState, RefObject, useCallback, useRef } from "react";

/**
 *
 * @param props.containerRef
 * @param props.speed
 * @returns props with `wheelDelta` representing the rotating speed of the mouse wheel
 */
const useWheelDelta = ({ containerRef, speed = 10 }: { containerRef: RefObject<Element>; speed: number }) => {
  const lastWheelEventTime = useRef<number>(0);
  const [wheelDelta, setWheelDelta] = useState<number>(0);

  // Respond to mouse wheel events by increasing or decreasing the angle
  const handleWheel = useCallback(
    (e: unknown) => {
      const event = e as WheelEvent;
      event.preventDefault();

      const currentTime = performance.now();
      const timeDelta = currentTime - lastWheelEventTime.current;
      const delta = event.deltaY / timeDelta / (100 / speed);

      setWheelDelta((prev) => (delta == prev ? prev : delta));
      lastWheelEventTime.current = currentTime;
    },
    [speed]
  );

  useEffect(() => {
    // Reset speed to 0 if no wheel event occurs for 500ms
    const timer = setTimeout(() => setWheelDelta(0), 100);
    return () => clearTimeout(timer);
  }, [wheelDelta]);

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener("wheel", handleWheel);
    return () => {
      container?.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, handleWheel]);

  return { wheelDelta };
};

export default useWheelDelta;

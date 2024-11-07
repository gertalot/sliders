import { useEffect, useState, RefObject, useCallback } from "react";

/**
 * Custom hook that two-finger touch scrolling and dragging the mouse up or down (or left or right
 * if `verticalDragging` is false). This adds some event listeners to the element referenced by
 * `containerRef`, and sets the `dragAdjust` to reflect the user dragging or scrolling.
 *
 * @param props.containerRef the element that listens to wheel events
 * @param props.sensitivity increase to reduce speed; default is 100
 * @returns props with `wheelDelta` representing the rotating speed of the mouse wheel
 */
const useDragToAdjust = ({
  containerRef,
  sensitivity = 100,
  verticalDragging = true
}: {
  containerRef: RefObject<Element>;
  sensitivity?: number;
  verticalDragging?: boolean;
}) => {
  const [isDragging, setDragging] = useState(false);
  const [dragAdjust, setDragAdjust] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const handleMouseDown = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      const rect = containerRef.current;
      if (rect) {
        // maybe record the start coordinate so we can know the delta?
        setDragging(true);
        setDragAdjust(0);
        setDragStart(verticalDragging ? event.clientY : event.clientX);
      }
    },
    [containerRef, verticalDragging]
  );

  const handleTouchStart = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const rect = containerRef.current;
      if (rect && event.touches.length === 2) {
        const touch = event.touches[0];
        setDragging(true);
        setDragAdjust(0);
        setDragStart(verticalDragging ? touch.clientY : touch.clientX);
      }
    },
    [containerRef, verticalDragging]
  );

  const handleStopDragging = () => {
    setDragging(false);
    setDragStart(0);
    setDragAdjust(0);
  };

  const handleMouseMove = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      const rect = containerRef.current;
      if (rect && isDragging) {
        // maybe update the delta?
        const delta = verticalDragging ? event.clientY - dragStart : dragStart - event.clientX;
        setDragAdjust(-delta / (sensitivity * 2));
        setDragStart(verticalDragging ? event.clientY : event.clientX);
      }
    },
    [containerRef, dragStart, isDragging, sensitivity, verticalDragging]
  );

  const handleTouchMove = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const rect = containerRef.current;
      if (rect && isDragging && event.touches.length === 2) {
        const touch = event.touches[0];
        const delta = verticalDragging ? touch.clientY - dragStart : touch.clientX - dragStart;
        setDragAdjust(-delta / (sensitivity * 2));
        setDragStart(verticalDragging ? touch.clientY : touch.clientX);
      }
    },
    [containerRef, dragStart, isDragging, sensitivity, verticalDragging]
  );

  useEffect(() => {
    // Add event handlers that listen for dragging
    const container = containerRef.current;

    const containerEvents = {
      mousedown: handleMouseDown,
      mouseup: handleStopDragging,
      touchstart: handleTouchStart,
      touchend: handleStopDragging,
      mouseleave: handleStopDragging,
      mousemove: handleMouseMove,
      touchmove: handleTouchMove
    };
    for (const [event, handler] of Object.entries(containerEvents)) {
      container?.addEventListener(event, handler);
    }
    return () => {
      for (const [event, handler] of Object.entries(containerEvents)) {
        container?.removeEventListener(event, handler);
      }
    };
  }, [containerRef, handleMouseDown, handleMouseMove, handleTouchMove, handleTouchStart]);
  return { dragAdjust, isDragAdjusting: dragAdjust != 0 };
};

export default useDragToAdjust;

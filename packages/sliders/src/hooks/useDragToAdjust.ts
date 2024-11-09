import { useEffect, useState, RefObject, useCallback, useRef } from "react";

interface UseDragToAdjustProps {
  dragAreaRef: RefObject<Element>;
  sensitivity?: number;
  verticalDragging?: boolean;
}

interface UseDragToAdjustResult {
  dragAdjust: number;
  isDragAdjusting: boolean;
}

/**
 * Custom hook that two-finger touch scrolling and dragging the mouse up or down (or left or right
 * if `verticalDragging` is false). This adds some event listeners to the element referenced by
 * `dragAreaRef`, and sets the `dragAdjust` to reflect the user dragging or scrolling.
 *
 * @param props.dragAreaRef the element that listens to wheel events
 * @param props.sensitivity increase to reduce speed; default is 100
 * @returns props with `wheelDelta` representing the rotating speed of the mouse wheel
 */
const useDragToAdjust = ({
  dragAreaRef,
  sensitivity = 100,
  verticalDragging = true
}: UseDragToAdjustProps): UseDragToAdjustResult => {
  const [isDragging, setDragging] = useState(false);
  const [dragAdjust, setDragAdjust] = useState(0);
  const dragStartRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      const rect = dragAreaRef.current;
      if (rect) {
        // track where the user started dragging by storing the relevant coordinate
        // of the cursor
        setDragging(true);
        setDragAdjust(0);
        dragStartRef.current = verticalDragging ? event.clientY : event.clientX;
      }
    },
    [dragAreaRef, verticalDragging]
  );

  const handleTouchStart = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const rect = dragAreaRef.current;
      if (rect && event.touches.length === 2) {
        const touch = event.touches[0];
        // track where the user started dragging by storing the relevant coordinate
        // of the cursor
        setDragging(true);
        setDragAdjust(0);
        dragStartRef.current = verticalDragging ? touch.clientY : touch.clientX;
      }
    },
    [dragAreaRef, verticalDragging]
  );

  const handleStopDragging = () => {
    setDragging(false);
    dragStartRef.current = 0;
    setDragAdjust(0);
  };

  const handleMouseMove = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      const rect = dragAreaRef.current;
      if (rect && isDragging) {
        const delta = verticalDragging ? event.clientY - dragStartRef.current : dragStartRef.current - event.clientX;
        setDragAdjust(-delta / (sensitivity * 2));
        dragStartRef.current = verticalDragging ? event.clientY : event.clientX;
      }
    },
    [dragAreaRef, dragStartRef, isDragging, sensitivity, verticalDragging]
  );

  const handleTouchMove = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const rect = dragAreaRef.current;
      if (rect && isDragging && event.touches.length === 2) {
        const touch = event.touches[0];
        const delta = verticalDragging ? touch.clientY - dragStartRef.current : touch.clientX - dragStartRef.current;
        setDragAdjust(-delta / (sensitivity * 2));
        dragStartRef.current = verticalDragging ? touch.clientY : touch.clientX;
      }
    },
    [dragAreaRef, dragStartRef, isDragging, sensitivity, verticalDragging]
  );

  useEffect(() => {
    const dragArea = dragAreaRef.current;

    const dragAreaEvents = {
      mousedown: handleMouseDown,
      mouseup: handleStopDragging,
      touchstart: handleTouchStart,
      touchend: handleStopDragging,
      mouseleave: handleStopDragging,
      mousemove: handleMouseMove,
      touchmove: handleTouchMove
    };
    for (const [event, handler] of Object.entries(dragAreaEvents)) {
      dragArea?.addEventListener(event, handler);
    }
    return () => {
      for (const [event, handler] of Object.entries(dragAreaEvents)) {
        dragArea?.removeEventListener(event, handler);
      }
    };
  }, [dragAreaRef, handleMouseDown, handleMouseMove, handleTouchMove, handleTouchStart]);
  return { dragAdjust, isDragAdjusting: dragAdjust != 0 };
};

export default useDragToAdjust;

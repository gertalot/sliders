import { MouseEvent, TouchEvent, RefObject, useEffect, useState, useCallback } from "react";

/**
 * Custom hook that provides slider behaviour for a multitude of slider-y and dial-y UI components.
 *
 * @remarks
 * This behaviour uses an area (like a div with a non-zero width and height) that responds to
 * dragging (with either touch or mouse pointer), and a target element. This behaviour triggers
 * when the user initiates dragging on the target element.
 *
 * @param props - a `SliderProps` object
 * @returns An object with the following properties:
 *  * `isDragging` - `true` if the user is holding the mouse down or is touching the screen; `false` otherwise
 *  * `isOnTarget` - `true` if the cursor is currently over the target element; `false` otherwise
 *  * `isStartDragOnTarget` - `true` if the user started dragging while over the target; `false` otherwise
 *  * `position` - `{x,y}` coordinates of the cursor, in client coordinates
 */
const useDraggable = ({
  containerRef,
  targetRef
}: {
  containerRef: RefObject<Element | null>;
  targetRef: RefObject<Element | null>;
}) => {
  const [isOnTarget, setOnTarget] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const [isStartDragOnTarget, setStartDragOnTarget] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      setStartDragOnTarget(() => isOnTarget);
      setDragging(true);
      setCursorPosition({ x: event.clientX, y: event.clientY });
    },
    [isOnTarget]
  );

  const handleTouchStart = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const touch = event.touches[0];
      setDragging(true);
      setStartDragOnTarget(() => touch.target === targetRef?.current);
      setCursorPosition({ x: touch.clientX, y: touch.clientY });
    },
    [targetRef]
  );

  const handleDragEnd = useCallback(() => {
    setDragging(false);
    setOnTarget(false);
    setStartDragOnTarget(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: unknown) => {
      if (isDragging) {
        const event = e as MouseEvent;
        setCursorPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: unknown) => {
      if (isDragging) {
        const event = e as TouchEvent;
        const touch = event.touches[0];
        setCursorPosition({ x: touch.clientX, y: touch.clientY });
      }
    },
    [isDragging]
  );

  const handleMouseOver = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      setOnTarget(event.target === targetRef.current);
    },
    [targetRef]
  );

  useEffect(
    () => {
      // Add event handlers to the slideable container and the sliding thingy itself
      const container = containerRef.current;

      const containerEvents = {
        mousedown: handleMouseDown,
        mouseup: handleDragEnd,
        touchstart: handleTouchStart,
        touchend: handleDragEnd,
        mousemove: handleMouseMove,
        touchmove: handleTouchMove,
        mouseover: handleMouseOver
      };
      for (const [event, handler] of Object.entries(containerEvents)) {
        container?.addEventListener(event, handler);
      }
      return () => {
        for (const [event, handler] of Object.entries(containerEvents)) {
          container?.removeEventListener(event, handler);
        }
      };
    },
    // we depend on the latest value of isOnTarget because the handleMouseDown and
    // handleTouchStart event listeners set the isStartDragOnTarget state based on the
    // value of isOnTarget.
    [
      containerRef,
      handleDragEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseOver,
      handleTouchMove,
      handleTouchStart,
      isDragging,
      isStartDragOnTarget,
      targetRef
    ]
  );

  return { isDragging, isOnTarget, isStartDragOnTarget, cursorPosition };
};

export default useDraggable;

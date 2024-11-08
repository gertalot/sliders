import { MouseEvent, TouchEvent, RefObject, useEffect, useState, useCallback, useLayoutEffect } from "react";
import { Point2D, isPointInRect } from "../utils";

/**
 * Custom hook that provides slider behaviour for a multitude of slider-y and dial-y UI components.
 *
 * @remarks
 * This behaviour uses an area (like a div with a non-zero width and height) that responds to
 * dragging (with either touch or mouse pointer), and a target element. This behaviour triggers
 * when the user initiates dragging on the target element.
 *
 * @param containerRef - a ref to a DOM element acting as the container that contains the draggable
 * @param targetRef - a ref to a DOM element acting as the draggable element
 * @param shouldStartDragOnTarget - true if dragging should only work when the dragging started on the target element
 * @returns An object with the following properties:
 *  * `isDragging` - `true` if the user is holding the mouse down or is touching the screen; `false` otherwise
 *  * `isOnTarget` - `true` if the cursor is currently over the target element; `false` otherwise
 *  * `isStartDragOnTarget` - `true` if the user started dragging while over the target; `false` otherwise
 *  * `position` - `{x,y}` coordinates of the cursor, in client coordinates
 */
const useDragToMove = ({
  containerRef,
  targetRef,
  shouldStartDragOnTarget = true
}: {
  containerRef: RefObject<Element>;
  targetRef: RefObject<Element>;
  shouldStartDragOnTarget?: boolean;
}) => {
  const [isOnTarget, setOnTarget] = useState(false);
  const [isOnContainer, setOnContainer] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const [isStartDragOnTarget, setStartDragOnTarget] = useState(false);
  const [position, setPosition] = useState<Point2D | null>(null);

  // set initial position of the target to the center of the container
  useLayoutEffect(() => {
    if (!position && containerRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      setPosition({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, [containerRef, position]);

  // Called by both the handleMouseDown and handleTouchStart event listeners; determines if the user
  // is actually initiating a dragging action, and sets the hook's state accordingly.
  const handleDragStart = useCallback(
    (position: Point2D) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const targetRect = targetRef.current?.getBoundingClientRect();
      // there might be other elements the pointer is over, so we can't rely
      // on event.target or event.composedPath to determine if we're on the container or target
      setOnContainer(() => isPointInRect(position, containerRect));
      setOnTarget(() => isPointInRect(position, targetRect));

      if (containerRect && (shouldStartDragOnTarget ? isOnTarget : isOnTarget || isOnContainer)) {
        setStartDragOnTarget(() => isOnTarget);
        setDragging(true);
        setPosition({ x: position.x - containerRect.x, y: position.y - containerRect.y });
      }
    },
    [containerRef, isOnContainer, isOnTarget, shouldStartDragOnTarget, targetRef]
  );

  const handleMouseDown = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      handleDragStart({ x: event.clientX, y: event.clientY });
    },
    [handleDragStart]
  );

  const handleTouchStart = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const touch = event.touches[0];
      if (event.touches.length === 1) {
        handleDragStart({ x: touch.clientX, y: touch.clientY });
      }
    },
    [handleDragStart]
  );

  // event listener for mouseUp and touchEnd events; sets the hook's state to reflect that
  // the user has ended their dragging action.
  const handleDragEnd = useCallback(
    (e: unknown) => {
      const event = e as Event;
      setDragging(false);
      const path = event.composedPath();
      const onTarget = Boolean(event.target && targetRef.current && path.includes(targetRef.current));

      setOnTarget(onTarget);
      setStartDragOnTarget(false);
    },
    [targetRef]
  );

  // called by the handleMouseMove and handleTouchMove event listeners; updates the cursor
  // position when necessary.
  const handleMove = useCallback(
    (position: Point2D) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const targetRect = targetRef.current?.getBoundingClientRect();

      // there might be other elements the pointer is over, so we can't rely
      // on event.target or event.composedPath to determine if we're on the container or target
      setOnContainer(() => isPointInRect(position, containerRect));
      setOnTarget(() => isPointInRect(position, targetRect));

      // update the position if the user is dragging
      if (isDragging && (isStartDragOnTarget || !shouldStartDragOnTarget) && containerRect) {
        setPosition({ x: position.x - containerRect.x, y: position.y - containerRect.y });
      }
    },
    [containerRef, isDragging, isStartDragOnTarget, shouldStartDragOnTarget, targetRef]
  );

  const handleMouseMove = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      handleMove({ x: event.clientX, y: event.clientY });
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const touch = event.touches[0];
      if (event.touches.length === 1) {
        handleMove({ x: touch.clientX, y: touch.clientY });
      }
    },
    [handleMove]
  );

  // Run once when the hook initializes and sets up the event listeners.
  useEffect(() => {
    const windowEventListeners = {
      mousedown: handleMouseDown,
      mouseup: handleDragEnd,
      touchstart: handleTouchStart,
      touchend: handleDragEnd,
      mousemove: handleMouseMove,
      touchmove: handleTouchMove
    };

    for (const [event, handler] of Object.entries(windowEventListeners)) {
      window.addEventListener(event, handler);
    }
    return () => {
      for (const [event, handler] of Object.entries(windowEventListeners)) {
        window.removeEventListener(event, handler);
      }
    };
  }, [containerRef, handleMouseDown, handleMouseMove, handleDragEnd, handleTouchMove, handleTouchStart]);

  return { isDragging, isOnTarget, isOnContainer, isStartDragOnTarget, position };
};

export default useDragToMove;

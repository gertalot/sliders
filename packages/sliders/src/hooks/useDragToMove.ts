import { RefObject, useEffect, useState, useCallback, useLayoutEffect } from "react";
import { Point2D, isPointInRect } from "../utils";

interface UseDragToMoveProps {
  dragAreaRef: RefObject<Element>;
  targetRef: RefObject<Element>;
  shouldStartDragOnTarget?: boolean;
}

interface UseDragToMoveResult {
  isDragging: boolean;
  isOnTarget: boolean;
  isOnDragArea: boolean;
  isStartDragOnTarget: boolean;
  position: Point2D | null;
}

/**
 * Custom hook that provides slider behaviour for a multitude of slider-y and dial-y UI components.
 *
 * @remarks
 * This behaviour uses an area (like a div with a non-zero width and height) that responds to
 * dragging (with either touch or mouse pointer), and a target element. This behaviour triggers
 * when the user initiates dragging on the target element.
 *
 * @param dragAreaRef - a ref to a DOM element acting as the dragArea that contains the draggable
 * @param targetRef - a ref to a DOM element acting as the draggable element
 * @param shouldStartDragOnTarget - true if dragging should only work when the dragging started on the target element
 * @returns An object with the following properties:
 *  * `isDragging` - `true` if the user is holding the mouse down or is touching the screen; `false` otherwise
 *  * `isOnTarget` - `true` if the cursor is currently over the target element; `false` otherwise
 *  * `isStartDragOnTarget` - `true` if the user started dragging while over the target; `false` otherwise
 *  * `position` - `{x,y}` coordinates of the cursor, in client coordinates
 */
const useDragToMove = ({
  dragAreaRef,
  targetRef,
  shouldStartDragOnTarget = true
}: UseDragToMoveProps): UseDragToMoveResult => {
  const [state, setState] = useState({
    isOnTarget: false,
    isOnDragArea: false,
    isDragging: false,
    isStartDragOnTarget: false,
    position: null as Point2D | null
  });

  // set initial position of the target to the center of the dragArea
  useLayoutEffect(() => {
    if (!state.position && dragAreaRef.current) {
      const rect = dragAreaRef.current.getBoundingClientRect();
      setState((prev) => ({ ...prev, position: { x: rect.width / 2, y: rect.height / 2 } }));
    }
  }, [dragAreaRef, state.position]);

  // Called by both the handleMouseDown and handleTouchStart event listeners; determines if the user
  // is actually initiating a dragging action, and sets the hook's state accordingly.
  const handleDragStart = useCallback(
    (position: Point2D) => {
      const dragAreaRect = dragAreaRef.current?.getBoundingClientRect();
      const targetRect = targetRef.current?.getBoundingClientRect();

      // there might be other elements the pointer is over, so we can't rely
      // on event.target or event.composedPath to determine if we're on the dragArea or target
      const isOnTarget = isPointInRect(position, targetRect);
      const isOnDragArea = isPointInRect(position, dragAreaRect);

      if (dragAreaRect && (shouldStartDragOnTarget ? isOnTarget : isOnTarget || isOnDragArea)) {
        setState((prev) => ({
          ...prev,
          isOnTarget,
          isOnDragArea,
          isDragging: true,
          isStartDragOnTarget: isOnTarget,
          position: { x: position.x - dragAreaRect.x, y: position.y - dragAreaRect.y }
        }));
      }
    },
    [dragAreaRef, shouldStartDragOnTarget, targetRef]
  );

  // event listener for mouseUp and touchEnd events; sets the hook's state to reflect that
  // the user has ended their dragging action.
  const handleDragEnd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      isStartDragOnTarget: false
    }));
  }, []);

  const handleMove = useCallback(
    (position: Point2D) => {
      const dragAreaRect = dragAreaRef.current?.getBoundingClientRect();
      const targetRect = targetRef.current?.getBoundingClientRect();

      // there might be other elements the pointer is over, so we can't rely
      // on event.target or event.composedPath to determine if we're on the dragArea or target
      const isOnTarget = isPointInRect(position, targetRect);
      const isOnDragArea = isPointInRect(position, dragAreaRect);

      // update the position if the user is dragging
      setState((prev) => {
        if (prev.isDragging && (prev.isStartDragOnTarget || !shouldStartDragOnTarget) && dragAreaRect) {
          return {
            ...prev,
            isOnTarget,
            isOnDragArea,
            position: { x: position.x - dragAreaRect.x, y: position.y - dragAreaRect.y }
          };
        }
        return { ...prev, isOnTarget, isOnDragArea };
      });
    },
    [dragAreaRef, targetRef, shouldStartDragOnTarget]
  );

  // Run once when the hook initializes and sets up the event listeners.
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => handleDragStart({ x: e.clientX, y: e.clientY });
    const handlePointerUp = () => handleDragEnd();
    const handlePointerMove = (e: PointerEvent) => handleMove({ x: e.clientX, y: e.clientY });

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handleDragStart, handleDragEnd, handleMove]);

  return state;
};

export default useDragToMove;

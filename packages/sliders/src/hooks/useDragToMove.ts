import { RefObject, useEffect, useState, useCallback, useLayoutEffect } from "react";
import { Point2D, isPointInRect } from "../utils";

/**
 * Interface for `useDragToMove`
 * @see useDragToMove
 */
interface UseDragToMoveProps {
  /** When the pointer is over this element, this hook will respond to dragging */
  dragAreaRef: RefObject<Element>;
  /** a ref to the draggable element */
  targetRef: RefObject<Element>;
  /** true if dragging actions are only registered when the action started on the target element
   * @default true
   */
  shouldStartDragOnTarget?: boolean;
}

/**
 * Interface for the result of the `useDragToMove` hook
 */
interface UseDragToMoveResult {
  /** true if the user is currently dragging */
  isDragging: boolean;
  /** true if the pointer is currently over the target element */
  isOnTarget: boolean;
  /** true if the pointer is currently over the dragArea element */
  isOnDragArea: boolean;
  /** true if the dragging action started on the target element */
  isStartDragOnTarget: boolean;
  /** the current `{x,y}` coordinates of the cursor, relative to the dragArea element */
  position: Point2D | null;
}

/**
 * A custom React hook that registers "dragging" actions from the user that occur on the target element
 * referenced by `targetRef`. This hook responds to touch and mouse events, and will return the position
 * of the pointer relative to the dragArea element, where top-left is `{x:0, y:0}`.
 *
 * This hook can be configured to only respond to dragging actions that started on the target element, or
 * to respond to dragging actions anywhere on the target element. In the latter scenario, the `position`
 * that is returned represents the position of the pointer relative to the `dragArea` element. This can
 * be used, for example, to immediately move the target to the position indicated by the location where
 * the mouse was clicked or the screen was touched.
 *
 * This custom hooks allows for creating UI elements that can be adjusted by dragging, such as
 * sliders, or values that change in response to user input. It handles all event listeners and logic to
 * detect dragging actions, and forms the basis for the other custom hooks in this library.
 *
 * Note that the `dragArea` and `target` elements don't necessarily have to be the target of the pointer
 * events, or be in the composed path of the event. As long as the relevant events occur within the bounds
 * of these elements, dragging actions will be registered.
 *
 * @param {UseDragToMoveProps} props - the configuration options for this hook
 * @param {RefObject<Element>} props.dragAreaRef - this hook will register dragging actions that occur on this element.
 * @param {RefObject<Element>} props.targetRef - the target element, i.e. the element that the user is dragging
 * @param {boolean} [props.shouldStartDragOnTarget=true] - true if dragging actions are only registered when the action
 * started on the target element
 * @returns {UseDragToMoveResult} Properties that indicate the current state of the hook, such as whether the user
 * is currently dragging, and the position of the pointer relative to the `dragArea` element
 *
 * @todo consider whether the initial `position` value should be the targetArea element position, and maybe
 * this should be configurable by the user with a prop.
 *
 * @example
 * const MyComponent = () => {
 *     const dragAreaRef = useRef(null);
 *  const targetRef = useRef<SVGCircleElement>(null);
 *  const { isOnTarget, isDragging, position } = useDragToMove({
 *    dragAreaRef,
 *    targetRef,
 *    shouldStartDragOnTarget: false
 *  });
 *
 *  useEffect(() => {
 *    targetRef.current?.setAttribute("r", isOnTarget || isDragging ? "15" : "10");
 *  }, [isDragging, isOnTarget]);
 *
 *  return (
 *    <svg style={{ width: "90vw", height: "90vh", backgroundColor: "#333" }} ref={dragAreaRef}>
 *      <circle ref={targetRef} style={{ cursor: "pointer" }} cx={position?.x} cy={position?.y} r={10} fill="white" />
 *    </svg>
 *  );
 * }
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

  // After the first render, set initial position of the target to the center of the dragArea
  useLayoutEffect(() => {
    if (!state.position && dragAreaRef.current) {
      const rect = dragAreaRef.current.getBoundingClientRect();
      setState((prev) => ({ ...prev, position: { x: rect.width / 2, y: rect.height / 2 } }));
    }
  }, [dragAreaRef, state.position]);

  // Determines if the user is actually initiating a dragging action,
  // and sets the hook's state accordingly.
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

  // sets the hook's state to reflect that the user has ended their dragging action.
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

  // Set up the event listeners we're interested in
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

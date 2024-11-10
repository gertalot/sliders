import { useEffect, useState, RefObject, useCallback, useRef } from "react";

/**
 * Interface for `useDragToAdjust`
 * @see useDragToAdjust
 */
interface UseDragToAdjustProps {
  /** When the pointer is over this element, this hook will respond to dragging */
  dragAreaRef: RefObject<Element>;
  /**
   * Determines quickly the resulting value changes in response to the user dragging
   * Higher sensitivity values result in smaller adjustments for the same dragging distance
   * @default 100
   */
  sensitivity?: number;
  /**
   * Determines if this hook responds to horizontal or vertical dragging actions.
   * @default true
   */
  verticalDragging?: boolean;
  /**
   * The number of touches required to register as a dragging action.
   * @default 2
   */
  dragTouches?: number;
}

/**
 * Interface for the result of the `useDragToAdjust` hook
 * @see useDragToAdjust
 */
interface UseDragToAdjustResult {
  /** a value corresponding to the current drag distance  */
  dragAdjust: number;
  /** true if the user is dragging  */
  isDragAdjusting: boolean;
}

/**
 * A custom React hook that registers "dragging" actions from the user that start on the element
 * referenced by `dragAreaRef`. This hook responds to touch and mouse events, and will return a
 * value corresponding to the distance of the dragging motion in the `dragAdjust` property.
 *
 * This hook can be configured to register horizontal or vertical dragging motions, and for touch
 * events, the number of touches required to start dragging can be configured.
 *
 * This custom hooks allows for creating UI elements that can be adjusted by dragging, such as
 * sliders, or values that change in response to user input.
 *
 * @param {UseDragToAdjustProps} props - the configuration options for this hook
 * @param {RefObject<Element>} props.dragAreaRef - when the pointer is over this element, this hook will respond to dragging
 * @param {number} [props.sensitivity=100] - determines quickly the resulting value changes in response to the user dragging
 * @param {boolean} [props.verticalDragging=true] - determines if this hook responds to horizontal or vertical dragging actions
 * @param {number} [props.dragTouches=2] - the number of touches required to register as a dragging action
 *
 * @returns {UseDragToAdjustResult} An object containing the current drag speed and whether the user is currently dragging
 *
 * @example
 * const MyComponent = () => {
 *   const dragAreaRef = useRef(null);
 *   const [value, setValue] = useState(0);
 *   const { dragAdjust, isDragAdjusting } = useDragToAdjust({ dragAreaRef });
 *
 *   useEffect(() => {
 *     if (isDragAdjusting) {
 *       setValue((prev) => prev + dragAdjust);
 *     }
 *   }, [dragAdjust, isDragAdjusting]);
 *
 *   return (
 *     <div>
 *       <div ref={dragAreaRef} />
 *       <h1>Value: {value.toFixed(1)}</h1>
 *       <h2>Drag to change!</h2>
 *     </div>
 *   );
 * }
 *
 * @todo attach event listeners to window so dragging can extend past the bounds of the dragArea element,
 * and detect when the user initiates a drag action when they are within the bounds of the dragArea element,
 * even when that element is not the event target (e.g. when it's behind something else and not in the composed path)
 */
const useDragToAdjust = ({
  dragAreaRef,
  sensitivity = 100,
  verticalDragging = true,
  dragTouches = 2
}: UseDragToAdjustProps): UseDragToAdjustResult => {
  const [isDragging, setDragging] = useState(false);
  const [dragAdjust, setDragAdjust] = useState(0);
  const dragStartRef = useRef(0);

  // event listener responding to a mouse button being pressed
  const handleMouseDown = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      const rect = dragAreaRef.current;
      if (rect) {
        // track where the user started dragging by storing the relevant coordinate
        // of the pointer. The
        setDragging(true);
        setDragAdjust(0);
        dragStartRef.current = verticalDragging ? event.clientY : event.clientX;
      }
    },
    [dragAreaRef, verticalDragging]
  );

  // event listener responding to the user touching
  const handleTouchStart = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      const rect = dragAreaRef.current;
      if (rect && event.touches.length === dragTouches) {
        const touch = event.touches[0];
        // track where the user started dragging by storing the relevant coordinate
        // of the pointer. The
        setDragging(true);
        setDragAdjust(0);
        dragStartRef.current = verticalDragging ? touch.clientY : touch.clientX;
      }
    },
    [dragAreaRef, verticalDragging, dragTouches]
  );

  const handleStopDragging = () => {
    setDragging(false);
    dragStartRef.current = 0;
    setDragAdjust(0);
  };

  const handleMouseMove = useCallback(
    (e: unknown) => {
      const event = e as MouseEvent;
      if (dragStartRef.current && isDragging) {
        const delta = verticalDragging ? event.clientY - dragStartRef.current : dragStartRef.current - event.clientX;
        setDragAdjust(-delta / (sensitivity * 2));
        dragStartRef.current = verticalDragging ? event.clientY : event.clientX;
      }
    },
    [dragStartRef, isDragging, sensitivity, verticalDragging]
  );

  const handleTouchMove = useCallback(
    (e: unknown) => {
      const event = e as TouchEvent;
      if (dragStartRef.current && isDragging && event.touches.length === dragTouches) {
        const touch = event.touches[0];
        const delta = verticalDragging ? touch.clientY - dragStartRef.current : touch.clientX - dragStartRef.current;
        setDragAdjust(-delta / (sensitivity * 2));
        dragStartRef.current = verticalDragging ? touch.clientY : touch.clientX;
      }
    },
    [dragStartRef, isDragging, sensitivity, verticalDragging, dragTouches]
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

export { useDragToAdjust };
export type { UseDragToAdjustProps, UseDragToAdjustResult };

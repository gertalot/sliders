import { useEffect, useState, RefObject, useCallback, useRef } from "react";
import useDraggable from "./useDraggable";
import { Point2D, TAU, pointToAngle } from "../utils";
import useWheelDelta from "./useWheelDelta";
import { maxHeaderSize } from "http";

const useRotatingDraggable = ({
  containerRef,
  targetRef,
  initialAngle = 0,
  origin = null
}: {
  containerRef: RefObject<Element>;
  targetRef: RefObject<Element>;
  initialAngle?: number;
  origin?: Point2D | null;
}) => {
  const [totalAngle, setTotalAngle] = useState(initialAngle);
  const [angle, setAngle] = useState(totalAngle % TAU);
  const [fullRotations, setFullRotations] = useState(Math.floor(totalAngle / TAU));
  const [origin_, setOrigin] = useState<Point2D | null>(null);

  // set the origin to what was passed in, or set it to the center of `fromRect`
  // if we have one, or set it to 0,0 if all else fails.
  useEffect(() => {
    if (origin) {
      setOrigin(origin);
    } else {
      const fromRect = containerRef.current?.getBoundingClientRect();
      if (fromRect) {
        setOrigin({ x: fromRect.width / 2, y: fromRect.height / 2 });
      } else {
        setOrigin({ x: 0, y: 0 });
      }
    }
  }, [containerRef, origin]);

  // get the basic custom hook that takes care of dragging and sliding behaviour
  const { isDragging, isOnTarget, cursorPosition } = useDraggable({ containerRef, targetRef });

  const updateAngle = useCallback(
    (newAngle: number): void => {
      const isClockwise = (angle - newAngle + TAU) % TAU > 0.5 * TAU;
      const incRotations = isClockwise && newAngle < angle ? 1 : 0;
      const decRotations = !isClockwise && newAngle > angle ? -1 : 0;
      const newFullRotations = fullRotations + incRotations + decRotations;
      const newTotalAngle = newAngle + TAU * newFullRotations;

      setTotalAngle(newTotalAngle);
      setFullRotations(newFullRotations);
      setAngle(newAngle);
    },
    [angle, fullRotations]
  );

  // update our angle and related state if the user is dragging the target
  useEffect(() => {
    if (origin_ && cursorPosition && isDragging) {
      const newAngle = pointToAngle(cursorPosition, origin_);
      updateAngle(newAngle);
    }
  }, [angle, cursorPosition, fullRotations, isDragging, origin_, updateAngle]);

  const { wheelDelta } = useWheelDelta({ containerRef, speed: 2 });

  useEffect(() => {
    const newAngle = angle + wheelDelta;
    const newNormalisedAngle = (newAngle < 0 ? newAngle + TAU : newAngle) % TAU;
    updateAngle(newNormalisedAngle);
  }, [wheelDelta]);

  return { isDragging, isOnTarget, angle, fullRotations, totalAngle };
};

export default useRotatingDraggable;

import { useEffect, useState, RefObject, useCallback, useRef } from "react";
import useDraggable from "./useDraggable";
import useWheelDelta from "./useWheelDelta";
import { Point2D, TAU, pointToAngle } from "../utils";

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
  const totalAngle = useRef<number>(initialAngle);
  const angle = useRef<number>(totalAngle.current % TAU);
  const fullRotations = useRef<number>(Math.floor(totalAngle.current / TAU));
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
    (newAngle: number) => {
      const isClockwise = (angle.current - newAngle + TAU) % TAU > 0.5 * TAU;
      const incRotations = isClockwise && newAngle < angle.current ? 1 : 0;
      const decRotations = !isClockwise && newAngle > angle.current ? -1 : 0;
      const newFullRotations = fullRotations.current + incRotations + decRotations;
      const newTotalAngle = newAngle + TAU * newFullRotations;

      totalAngle.current = newTotalAngle;
      fullRotations.current = newFullRotations;
      angle.current = newAngle;
    },
    [angle, fullRotations]
  );

  // update the angle if the user is dragging the target
  useEffect(() => {
    if (origin_ && cursorPosition && isDragging) {
      const newAngle = pointToAngle(cursorPosition, origin_);
      updateAngle(newAngle);
    }
  }, [angle, cursorPosition, fullRotations, isDragging, origin_, updateAngle]);

  const { wheelDelta } = useWheelDelta({ containerRef, sensitivity: 100 });

  // update the angle when the user is rotating the mouse wheel
  useEffect(() => {
    const newAngle = angle.current + wheelDelta;
    const newNormalisedAngle = (newAngle < 0 ? newAngle + TAU : newAngle) % TAU;
    updateAngle(newNormalisedAngle);
  }, [wheelDelta, updateAngle]);

  return {
    isDragging,
    isOnTarget,
    angle: angle.current,
    fullRotations: fullRotations.current,
    totalAngle: totalAngle.current
  };
};

export default useRotatingDraggable;

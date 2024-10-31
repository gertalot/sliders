import { useEffect, useState, RefObject } from "react";
import useDraggable from "./useDraggable";
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
  const [totalAngle, setTotalAngle] = useState(initialAngle);
  const [fullRotations, setFullRotations] = useState(Math.floor(totalAngle / TAU));
  const [angle, setAngle] = useState(totalAngle % TAU);
  const [origin_, setOrigin] = useState<Point2D | null>(null);

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

  useEffect(() => {
    if (origin_ && cursorPosition && isDragging) {
      const newAngle = pointToAngle(cursorPosition, origin_);
      const isClockwise = (angle - newAngle + TAU) % TAU > 0.5 * TAU;
      const incRotations = isClockwise && newAngle < angle ? 1 : 0;
      const decRotations = !isClockwise && newAngle > angle ? -1 : 0;
      const newFullRotations = fullRotations + incRotations + decRotations;
      const newTotalAngle = newAngle + TAU * newFullRotations;

      console.log({ angle, newAngle, isClockwise, incRotations, decRotations, newFullRotations });

      setTotalAngle(newTotalAngle);
      setFullRotations(newFullRotations);
      setAngle(newAngle);
    }
  }, [angle, cursorPosition, fullRotations, isDragging, origin_]);

  return { isDragging, isOnTarget, angle, fullRotations, totalAngle };
};

export default useRotatingDraggable;

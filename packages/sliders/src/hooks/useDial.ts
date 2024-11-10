import { Point2D, TAU } from "../utils";
import { useRotateToAdjust } from "./useRotateToAdjust";

interface UseDialProps {
  targetRef: React.RefObject<Element>;
  dragAreaRef: React.RefObject<Element>;
  minValue?: number;
  maxValue?: number;
  value?: number;
  minAngle?: number;
  maxAngle?: number;
  origin?: Point2D;
}
const useDial = ({
  targetRef,
  dragAreaRef,
  minValue = 0,
  maxValue = 1,
  value = 0,
  minAngle = (1 / 4) * TAU,
  maxAngle = (5 / 4) * TAU,
  origin
}: UseDialProps) => {
  const { isRotating, isOnTarget, angle, fullRotations, totalAngle } = useRotateToAdjust({
    dragAreaRef,
    targetRef,
    initialAngle: ((value - minValue) / (maxValue - minValue)) * (maxAngle - minAngle) + minAngle,
    origin
  });

  return { isRotating, isOnTarget, angle, fullRotations, totalAngle };
};

export { useDial };

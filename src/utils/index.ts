type Point2D = {
  x: number;
  y: number;
};

const TAU = 2 * Math.PI;

function angleToValue(angle: number, minValue: number, maxValue: number, minAngle: number, maxAngle: number): number {
  const _minAngle = maxAngle <= minAngle ? minAngle + TAU : minAngle;
  return minValue + ((maxValue - minValue) / (maxAngle - _minAngle)) * (angle - _minAngle);
}

function valueToAngle(value: number, minValue: number, maxValue: number, minAngle: number, maxAngle: number): number {
  return minAngle + ((maxAngle - minAngle) / (maxValue - minValue)) * (value - minValue);
}

function angleToPoint(angle: number, origin: Point2D, radius: number): Point2D {
  return {
    x: Math.cos(angle % TAU) * radius + origin.x,
    y: Math.sin(angle % TAU) * radius + origin.y
  };
}

function pointToAngle(point: Point2D, origin: Point2D): number {
  const rad = Math.atan2(point.y - origin.y, point.x - origin.x);
  return rad < 0 ? rad + TAU : rad;
}

function pointEquals(point: Point2D | null, otherPoint: Point2D | null): boolean {
  if (point == null || otherPoint == null) {
    return false;
  }
  return otherPoint.x == otherPoint.x && point.y == otherPoint.y;
}

export { TAU, angleToValue, valueToAngle, angleToPoint, pointEquals, pointToAngle };
export type { Point2D };

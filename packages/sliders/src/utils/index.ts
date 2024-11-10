/**
 * A point `{x,y}` in 2D space
 */
type Point2D = {
  x: number;
  y: number;
};

/**
 * Convenience constant equal to `2*Math.PI`; useful when working with radians
 */
const TAU = 2 * Math.PI;

/**
 * Takes an angle in radians, possibly negative, and normalises it to be between 0 and 2*Math.PI
 * @param angle angle in radians
 * @returns an angle in radians between 0 and 2*Math.PI
 */
const normalisedAngle = (angle: number) => {
  const modAngle = angle % TAU;
  return (modAngle < 0 ? modAngle + TAU : modAngle) % TAU;
};

/**
 * Maps an angle in radians to a numeric value. Used for rotating draggable widgets.
 *
 * @param angle the angle in radians
 * @param minValue the minimum value; corresponds to the minimum angle
 * @param maxValue the maximum value; corresponds to the maximum angle
 * @param minAngle the minimun angle
 * @param maxAngle the maximum angle
 * @returns a numeric value
 *
 * @example angleToValue(angle, 0, 360, 0, 2*Math.PI) // map radians to degrees
 */
function angleToValue(angle: number, minValue: number, maxValue: number, minAngle: number, maxAngle: number): number {
  const _minAngle = maxAngle <= minAngle ? minAngle + TAU : minAngle;
  return minValue + ((maxValue - minValue) / (maxAngle - _minAngle)) * (angle - _minAngle);
}

/**
 * Maps a value, and returns a corresponding angle in radians, based on the parameters
 *
 * @param value the value to convert
 * @param minValue the minimum value; corresponds to the minimum angle
 * @param maxValue the maximum value; corresponds to the maximum angle
 * @param minAngle the minimun angle
 * @param maxAngle the maximum angle
 * @returns an angle in radians
 */
function valueToAngle(value: number, minValue: number, maxValue: number, minAngle: number, maxAngle: number): number {
  return minAngle + ((maxAngle - minAngle) / (maxValue - minValue)) * (value - minValue);
}

/**
 * Convert an angle in radians to a 2D point on a circle with `origin` as its center and radius `radius`.
 *
 * @param angle the angle in radians
 * @param origin `{x,y}` coordinates of the origin of the circle
 * @param radius the radius of the circle
 * @returns a point on a circle with specified origin and radius that corresponds to the angle
 *
 * @example angletoPoint(0,{x:0, y:0}, 1) // returns {x:1, y:0 }
 * @example angletoPoint(5/8 * Math.PI,{x:0, y:0}, 1) // returns {x:-0.7071, y:-0.7071 }
 */
function angleToPoint(angle: number, origin: Point2D, radius: number): Point2D {
  return {
    x: Math.cos(angle % TAU) * radius + origin.x,
    y: Math.sin(angle % TAU) * radius + origin.y
  };
}

/**
 * Returns the angle in radians of a vector from origin to point
 *
 * @param point `{x,y}` coordinates of a point
 * @param origin `{x,y}` coordinates of
 * @returns the angle in radians of a vector from origin to point
 *
 * @example pointToAngle({x:-0.7071, y: 0.7071}, {x:0, y:0}) // returns 1.1781 (== 3/8 * Math.PI)
 */
function pointToAngle(point: Point2D, origin: Point2D): number {
  const rad = Math.atan2(point.y - origin.y, point.x - origin.x);
  return rad < 0 ? rad + TAU : rad;
}

/**
 * Convenience function that compares two Point2D objects and returns true iff they are equal.
 * Note that if both `point` and `otherPoint` are null, the function returns true
 * @param point
 * @param otherPoint
 * @returns
 */
function pointEquals(point: Point2D | null, otherPoint: Point2D | null): boolean {
  return point?.x == otherPoint?.x && point?.y == otherPoint?.y;
}

/**
 * Tests whether point is inside rect.
 * @param point a 2D point with x and y values
 * @param rect a rect with top,left - bottom,right coordinates
 * @returns true if the point is within the bounds of the rectangle
 */
const isPointInRect = (point: Point2D, rect?: DOMRect) => {
  return Boolean(
    rect && rect.left <= point.x && rect.right >= point.x && rect.top <= point.y && rect.bottom >= point.y
  );
};

export { TAU, normalisedAngle, angleToValue, valueToAngle, angleToPoint, pointEquals, pointToAngle, isPointInRect };
export type { Point2D };

import { expect, test } from "vitest";
import { angleToPoint, angleToValue, Point2D, pointEquals, pointToAngle, TAU, valueToAngle } from "../index";

test("angleToValue: [0, 360] maps to [0, 2*pi]", () => {
  expect(angleToValue(TAU * (0 / 4), 0, 360, 0, TAU)).toBe(0);
  expect(angleToValue(TAU * (1 / 4), 0, 360, 0, TAU)).toBe(90);
  expect(angleToValue(TAU * (2 / 4), 0, 360, 0, TAU)).toBe(180);
  expect(angleToValue(TAU * (3 / 4), 0, 360, 0, TAU)).toBe(270);
  expect(angleToValue(TAU * (4 / 4), 0, 360, 0, TAU)).toBe(360);
});

test("valueToAngle: [0, 2*pi] maps to [0, 360]", () => {
  expect(valueToAngle(0, 0, 360, 0, TAU)).toBe(TAU * (0 / 4));
  expect(valueToAngle(90, 0, 360, 0, TAU)).toBe(TAU * (1 / 4));
  expect(valueToAngle(180, 0, 360, 0, TAU)).toBe(TAU * (2 / 4));
  expect(valueToAngle(270, 0, 360, 0, TAU)).toBe(TAU * (3 / 4));
  expect(valueToAngle(360, 0, 360, 0, TAU)).toBe(TAU * (4 / 4));
});

const ORIGIN: Point2D = { x: 0, y: 0 };

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toBeCloseToPoint: (point: Point2D) => T;
  }
}

expect.extend({
  toBeCloseToPoint(actual, expected) {
    const precision = 3;
    const expectedDiff = 10 ** -precision / 2;
    const receivedDiff = Math.max(Math.abs(expected.x - actual.x), Math.abs(expected.y - actual.y));
    const pass = receivedDiff < expectedDiff;
    return {
      pass,
      message: () => `expected #{received} to be close to #{expected}`,
      expected,
      actual
    };
  }
});

test("angleToPoint maps angles in radians in [0, 2*pi] % 2*pi to points on the unit circle", () => {
  expect(angleToPoint(TAU * (0 / 4), ORIGIN, 1)).toBeCloseToPoint({ x: 1, y: 0 });
  expect(angleToPoint(TAU * (1 / 4), ORIGIN, 1)).toBeCloseToPoint({ x: 0, y: 1 });
  expect(angleToPoint(TAU * (2 / 4), ORIGIN, 1)).toBeCloseToPoint({ x: -1, y: 0 });
  expect(angleToPoint(TAU * (3 / 4), ORIGIN, 1)).toBeCloseToPoint({ x: 0, y: -1 });
  expect(angleToPoint(TAU * (4 / 4), ORIGIN, 1)).toBeCloseToPoint({ x: 1, y: 0 });
  expect(angleToPoint(TAU * (6 / 4), ORIGIN, 1)).toBeCloseToPoint({ x: -1, y: 0 });
});

test("pointToAngle maps points on the unit circle to [0, 2*pi]", () => {
  for (const p of [
    [1, 0, TAU * (0 / 8)],
    [1, 1, TAU * (1 / 8)],
    [0, 1, TAU * (2 / 8)],
    [-1, 1, TAU * (3 / 8)],
    [-1, 0, TAU * (4 / 8)],
    [-1, -1, TAU * (5 / 8)],
    [0, -1, TAU * (6 / 8)],
    [1, -1, TAU * (7 / 8)],
    [1, 0, TAU * (0 / 8)]
  ]) {
    expect(pointToAngle({ x: p[0], y: p[1] }, ORIGIN)).toBe(p[2]);
  }
});

test("pointEquals", () => {
  expect(pointEquals(null, null)).toBe(true);
  expect(pointEquals(null, { x: 1, y: 2 })).toBe(false);
  expect(pointEquals({ x: 1, y: 2 }, null)).toBe(false);
  expect(pointEquals({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(true);
  expect(pointEquals({ x: 3, y: -10 }, { x: 3, y: -10 })).toBe(true);
});

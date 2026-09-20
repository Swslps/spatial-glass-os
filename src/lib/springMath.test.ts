import { describe, it, expect } from "vitest";
import { springStep, dampingRatio } from "./springMath";
import { canPlay } from "../hooks/useHaptics";
function trajectory(k: number, c: number) {
  let x = 0,
    v = 0;
  const points = [];
  for (let i = 0; i < 600; i++) {
    ({ x, v } = springStep(x, v, 1, k, c, 1 / 120));
    points.push(x);
  }
  return points;
}
describe("spring behavior", () => {
  it("settles without overshoot at critical damping", () => {
    const points = trajectory(100, 20);
    expect(Math.max(...points)).toBeLessThanOrEqual(1);
    expect(points.at(-1)).toBeCloseTo(1, 4);
    expect(dampingRatio(100, 20)).toBe(1);
  });
  it("overshoots when underdamped and converges", () => {
    const points = trajectory(100, 5);
    expect(Math.max(...points)).toBeGreaterThan(1.1);
    expect(points.at(-1)).toBeCloseTo(1, 3);
  });
  it("stays stable after a long inactive frame", () => {
    const result = springStep(0, 0, 1, 400, 2, 10);
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Math.abs(result.x)).toBeLessThan(2);
  });
});
describe("audio voice limiter", () => {
  it("enforces minimum spacing and maximum voices", () => {
    expect(canPlay(29, 0, 0)).toBe(false);
    expect(canPlay(30, 0, 0)).toBe(true);
    expect(canPlay(100, 0, 6)).toBe(false);
    expect(canPlay(100, 0, 5)).toBe(true);
  });
});

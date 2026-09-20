export function springStep(
  x: number,
  v: number,
  target: number,
  k: number,
  c: number,
  dt: number,
  m = 1,
) {
  const steps = Math.max(1, Math.ceil(Math.min(dt, 0.064) / 0.004));
  const h = Math.min(dt, 0.064) / steps;
  for (let i = 0; i < steps; i++) {
    v += ((-k * (x - target) - c * v) / m) * h;
    x += v * h;
  }
  return { x, v };
}
export const dampingRatio = (k: number, c: number, m = 1) =>
  c / (2 * Math.sqrt(k * m));

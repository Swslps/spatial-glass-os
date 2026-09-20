import { useCallback, useEffect, useState } from "react";
// Standalone spring tilt. No application imports or animation dependencies.
export function useSpringTilt(stiffness = 180, damping = 22) {
  // A callback ref also handles a card mounted later by a conditional tab.
  const [el, setElement] = useState<HTMLDivElement | null>(null);
  const ref = useCallback(
    (node: HTMLDivElement | null) => setElement(node),
    [],
  );
  useEffect(() => {
    if (!el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      vx = 0,
      vy = 0,
      raf = 0,
      last = 0;
    const frame = (t: number) => {
      if (media.matches) {
        el.style.transform = "none";
        raf = 0;
        return;
      }
      const dt = Math.min((t - (last || t - 16)) / 1000, 0.032);
      last = t;
      for (let j = 0; j < 8; j++) {
        const h = dt / 8;
        vx += (-stiffness * (x - tx) - damping * vx) * h;
        vy += (-stiffness * (y - ty) - damping * vy) * h;
        x += vx * h;
        y += vy * h;
      }
      el.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg)`;
      if (
        Math.abs(x - tx) + Math.abs(y - ty) + Math.abs(vx) + Math.abs(vy) >
        0.015
      )
        raf = requestAnimationFrame(frame);
      else {
        raf = 0;
        last = 0;
      }
    };
    const start = () => {
      if (!raf && !media.matches) raf = requestAnimationFrame(frame);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" && e.buttons === 0) return;
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 16;
      el.style.setProperty(
        "--shine-x",
        `${((e.clientX - r.left) / r.width) * 100}%`,
      );
      start();
    };
    const reset = () => {
      tx = ty = 0;
      start();
    };
    const preferenceChanged = () => {
      if (media.matches) {
        cancelAnimationFrame(raf);
        raf = last = x = y = vx = vy = tx = ty = 0;
        el.style.transform = "none";
      } else reset();
    };
    preferenceChanged();
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointerup", reset);
    el.addEventListener("pointercancel", reset);
    media.addEventListener("change", preferenceChanged);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("pointerup", reset);
      el.removeEventListener("pointercancel", reset);
      media.removeEventListener("change", preferenceChanged);
    };
  }, [el, stiffness, damping]);
  return ref;
}

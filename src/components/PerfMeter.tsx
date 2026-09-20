import { useEffect, useState } from "react";
export function usePerf() {
  const [perf, set] = useState({ fps: 0, ms: 0, memory: 0 });
  useEffect(() => {
    let raf = 0,
      last = performance.now(),
      frames = 0;
    const tick = (now: number) => {
      frames++;
      if (now - last >= 700) {
        const elapsed = now - last;
        const memory = (
          performance as Performance & { memory?: { usedJSHeapSize: number } }
        ).memory;
        set({
          fps: Math.round((frames * 1000) / elapsed),
          ms: elapsed / frames,
          memory: memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0,
        });
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      frames = 0;
      last = performance.now();
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return perf;
}

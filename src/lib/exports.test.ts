import { it, expect } from "vitest";
import haptics from "../hooks/useHaptics.ts?raw";
import tilt from "../hooks/useSpringTilt.ts?raw";
import frag from "../shaders/liquidGlass.frag.glsl?raw";
it("exported source has no local imports or animation dependencies", () => {
  for (const source of [haptics, tilt, frag]) {
    expect(source).not.toMatch(/from\s+['"]\./);
    expect(source).not.toContain("framer-motion");
  }
});

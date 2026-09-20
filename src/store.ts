import { create } from "zustand";
import type { Material } from "./types";
export const presets = [
  {
    name: "VisionOS Crystal",
    note: "Clear. Quiet. Almost invisible.",
    color: "#bbcbb9",
    values: {
      ior: 1.52,
      dispersion: 0.012,
      roughness: 0.08,
      amplitude: 0.055,
      frequency: 24,
      decay: 1.4,
      stiffness: 180,
      damping: 22,
    },
  },
  {
    name: "Liquid Water",
    note: "A softer state of matter.",
    color: "#8dc7d1",
    values: {
      ior: 1.333,
      dispersion: 0.008,
      roughness: 0.025,
      amplitude: 0.16,
      frequency: 32,
      decay: 0.7,
      stiffness: 90,
      damping: 9,
    },
  },
  {
    name: "Cyberpunk Prismatic",
    note: "Light, split into its spectrum.",
    color: "#c1a2de",
    values: {
      ior: 1.9,
      dispersion: 0.09,
      roughness: 0.035,
      amplitude: 0.075,
      frequency: 40,
      decay: 1.1,
      stiffness: 230,
      damping: 17,
    },
  },
  {
    name: "Frosted Smoked",
    note: "Diffuse light. Deep stillness.",
    color: "#818c87",
    values: {
      ior: 1.6,
      dispersion: 0.004,
      roughness: 0.65,
      amplitude: 0.025,
      frequency: 18,
      decay: 2,
      stiffness: 130,
      damping: 28,
    },
  },
];
function savedMute() {
  try {
    return localStorage.getItem("spatial-muted") !== "false";
  } catch {
    return true;
  }
}
export const useGlass = create<{
  target: Material;
  preset: number;
  muted: boolean;
  volume: number;
  tone: number;
  quality: number;
  renderer: "webgl" | "css";
  set: (key: keyof Material, value: number) => void;
  select: (i: number) => void;
  mute: () => void;
}>((set) => ({
  target: { ...presets[0].values },
  preset: 0,
  muted: savedMute(),
  volume: 0.35,
  tone: 220,
  quality: 2,
  renderer: "webgl",
  set: (key, value) => set((s) => ({ target: { ...s.target, [key]: value } })),
  select: (i) => set({ preset: i, target: { ...presets[i].values } }),
  mute: () =>
    set((s) => {
      try {
        localStorage.setItem("spatial-muted", String(!s.muted));
      } catch {}
      return { muted: !s.muted };
    }),
}));

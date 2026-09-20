export type Material = {
  ior: number;
  dispersion: number;
  roughness: number;
  amplitude: number;
  frequency: number;
  decay: number;
  stiffness: number;
  damping: number;
};
export type Tab =
  "Laboratory" | "Technology atlas" | "Spatial widgets" | "Code export";

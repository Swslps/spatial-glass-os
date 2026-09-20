# Spatial Glass OS v2

An interactive material lab built with React, TypeScript, Vite, React Three Fiber, Three.js, Zustand, KaTeX, and Shiki.

## Run

`npm install`, then `npm run dev`. Production: `npm run build`. Unit checks: `npm test`. Browser checks: `npm run test:e2e` (Microsoft Edge must be installed).

## Implementation

- One active WebGL canvas at a time. A procedural light field is rendered into an FBO, then sampled by a custom refractive shader with per-channel IOR, nine-tap roughness, Schlick reflection, and eight analytic ripple normals.
- Shader parameters are read from Zustand inside `useFrame` and interpolated using a subdivided spring integrator.
- Four material presets, native sliders, a magnifying dock, spring tilt, scroll compression, keyboard controls, and touch interaction.
- Atlas: interactive Snell refraction and total internal reflection, KaTeX formulas, ripple visualization, spring response, and a live CSS/WebGL frame-cadence comparison.
- Widgets use DOM/CSS, with one shared-canvas 3D core. Temperature, load, scanning, and spectrum are explicitly labeled simulations; no biometric or microphone data is collected.
- Export tabs use raw imports of the actual runtime source. React hooks have no project dependencies. Shiki is loaded on demand.
- Audio defaults to muted, persists locally, and initializes only on a user gesture. Body/transient envelopes, 30ms rate limit, six-voice limit, and optional vibration are included.
- GPU tier detection selects CSS fallback for tier 0. Hidden/offscreen WebGL pauses; reduced motion uses demand rendering and disables interface motion. High contrast and reduced transparency use opaque surfaces.

## Measurement and limits

FPS and frame duration measure browser requestAnimationFrame cadence, not isolated GPU execution. Memory is shown only when the browser exposes performance.memory. Performance targets require real-device validation. Safari, Firefox, iPhone, and Android hardware need manual testing; optional ping-pong wave simulation is not included. The displacement SVG is a Chromium-only example; ordinary CSS blur remains the fallback.

The primary specimen and neural core use the same canvas component in mutually exclusive views, avoiding simultaneous WebGL contexts. Exported tilt is standalone; its subdivided spring integration matches the pure helper used for shader parameters.

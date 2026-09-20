# Verification — 21 September 2026

The app passes the tested flows below. It is **not yet a complete, verified implementation of implementation_plan_v2.md**.

## Reproduced and fixed in this follow-up

1. Opening Spring kinetics after the atlas mounted left the tilt card without pointer listeners. The standalone hook now uses a callback ref that observes the element mounting.
2. Enabling reduced motion after a card settled left its transform tilted. The preference handler now cancels motion and clears the transform immediately.
3. Muting while a biometric demo was scanning still allowed the delayed completion sound. Audio callbacks now read current preferences, including after awaiting AudioContext resume.
4. A failure in the AudioContext constructor caused an unhandled rejection. Initialization now runs inside the optional-audio error handler.

Each failure was reproduced by a browser test before the fix. All four regression tests now pass.

## Verification completed

- TypeScript check and production build: pass.
- Five unit checks: pass (spring convergence, critical damping, underdamped overshoot, large frame delay, sound limiting, and export constraints grouped into five tests).
- Eight browser scenarios: pass in desktop Edge against Vite development and desktop Chrome against the production build.
- Checked navigation, preset and IOR controls, shader console errors, nonuniform canvas pixels, refraction/TIR diagram, scanner completion, source contents, all five files' syntax highlighting, clipboard copy, and source download.
- Checked a 390px viewport for horizontal overflow and persisted mute preferences. This is **desktop viewport emulation, not phone hardware or touch validation**.
- Checked reduced-motion labeling, dynamic tilt reset, and WebMCP valid/invalid preset input using a test registry shim. Native WebMCP host compatibility is not proven by the shim.
- Audio tests observe actual Web Audio oscillator scheduling. They do not establish subjective sound quality or physical vibration output.

## Known differences from the plan

- Canvas instances are replaced between views. There is one visible canvas at a time, but the requested persistent fixed canvas with drei View sharing is not implemented.
- Drag-and-release wobble is missing. The tilt interaction and target-driven spring example exist.
- Scroll squish is currently bounded CSS vertical scaling, not the requested spring-driven horizontal stretch and vertical compression.
- Main specimen rotation follows the pointer directly instead of using the exported tilt spring. Dock sounds occur on clicks, not hover.
- The wave atlas panel shows a CSS wavefront illustration; it is not the shader's complete analytic wave demonstration. The main glass stage has the analytic ripple shader.
- Neural temperature/load and the spectrum are explicitly labeled illustrative simulations. The spectrum is not an analyser of actual audio.
- The network badge is static text, not a live network state indicator.
- The optional ping-pong height-field simulation is not implemented.

## Still unverified

- Safari and Firefox rendering, including CSS/SVG fallback behavior.
- Actual iPhone and Android touch, autoplay policy, speakers, and vibration.
- Physical-device GPU tiers and the target 55/30 FPS performance thresholds.
- Complete keyboard/screen-reader operation, 200% zoom, and measured WCAG AA contrast across every preset and transparency preference.
- Visual equivalence of every material setting and wave parameter to the full physical model.

Publishing remains pending the separate source-upload authorization; nothing in this verification run changes that status.

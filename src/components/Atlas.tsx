import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { ArrowUpRight, MoveHorizontal, MousePointer2 } from "lucide-react";
import { Slider } from "./Controls";
import { useGlass } from "../store";
import { springStep, dampingRatio } from "../lib/springMath";
import { useSpringTilt } from "../hooks/useSpringTilt";
import { useMedia } from "../hooks/usePreferences";
import { GlassScene } from "./GlassScene";
import { usePerf } from "./PerfMeter";
import { useHaptics } from "../hooks/useHaptics";
function AudioDemo() {
  const s = useGlass();
  const click = useHaptics(s.muted, s.volume, s.tone);
  return (
    <div className="atlas-grid">
      <article className="article-card">
        <div className="eyebrow">05 / AUDIO HAPTICS</div>
        <h2>A sound you almost feel.</h2>
        <p>
          A short sound synchronized with a touch makes a flat interface feel
          more tangible. The body is a 120–260 Hz sine wave lasting about 30 ms;
          a 3 kHz transient adds a sharp contact at the start.
        </p>
        <Formula tex={"g(t)=g_0 e^{-\\alpha t}"} />
        <p>
          Below roughly 150 Hz, small speakers reproduce little bass. Try 220 Hz
          on a laptop, and a lower tone with headphones. Supported devices add
          an 8 ms vibration.
        </p>
        <p className="control-note">
          Sound starts only after a gesture. iOS uses sound without vibration.
          Clicks are limited to one every 30 ms, with at most six simultaneous
          voices.
        </p>
      </article>
      <article className="demo-card">
        <div className="demo-label">
          MICRO-CLICK <span>WEB AUDIO</span>
        </div>
        <svg
          viewBox="0 0 400 150"
          className="audio-wave"
          aria-label="Illustration of a decaying audio envelope"
        >
          <path d="M0 75H400" stroke="#bbcbb0" />
          <path
            d={Array.from(
              { length: 401 },
              (_, i) =>
                `${i === 0 ? "M" : "L"}${i} ${75 + Math.sin(i * 0.3) * Math.exp(-i / 95) * 65}`,
            ).join(" ")}
            stroke="#557845"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <Slider
          label="Click tone"
          value={s.tone}
          min={120}
          max={260}
          step={1}
          digits={0}
          unit=" Hz"
          onChange={(tone) => useGlass.setState({ tone })}
        />
        <Slider
          label="Volume"
          value={s.volume}
          min={0}
          max={1}
          step={0.01}
          onChange={(volume) => useGlass.setState({ volume })}
        />
        <div className="compare-buttons">
          <button onClick={s.mute}>
            {s.muted ? "Enable sound" : "Mute sound"}
          </button>
          <button onClick={click} disabled={s.muted}>
            Try micro-click
          </button>
        </div>
        <p className="control-note">
          {s.muted
            ? "Sound is muted. Enable it to try the click."
            : "Sound is enabled. Your preference is saved on this device."}
        </p>
      </article>
    </div>
  );
}
export function Formula({ tex }: { tex: string }) {
  return (
    <div
      className="formula"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, {
          throwOnError: false,
          displayMode: true,
        }),
      }}
    />
  );
}
function SpringDemo() {
  const s = useGlass();
  const [target, setTarget] = useState(1);
  const ball = useRef<HTMLDivElement>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    let x = target ? 0 : 1,
      v = 0,
      last = 0,
      raf = 0;
    const tick = (t: number) => {
      const step = springStep(
        x,
        v,
        target,
        s.target.stiffness,
        s.target.damping,
        (t - (last || t - 16)) / 1000,
      );
      x = step.x;
      v = step.v;
      last = t;
      if (ball.current)
        ball.current.style.left = `${15 + (reduced ? target : x) * 65}%`;
      if (!reduced && (Math.abs(x - target) > 0.0001 || Math.abs(v) > 0.001))
        raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, s.target.stiffness, s.target.damping, reduced]);
  return (
    <>
      <div className="spring-track">
        <div ref={ball} className="spring-ball" />
        <span
          className="spring-target"
          style={{ left: target ? "80%" : "15%" }}
        />
      </div>
      <button className="text-button" onClick={() => setTarget((t) => 1 - t)}>
        Move the target <MoveHorizontal size={15} />
      </button>
      <p className="control-note">
        ζ = {dampingRatio(s.target.stiffness, s.target.damping).toFixed(2)} ·
        stiffness and damping follow your material settings.
      </p>
    </>
  );
}
export function Atlas() {
  const [topic, setTopic] = useState(0);
  const [angle, setAngle] = useState(35);
  const [inside, setInside] = useState(false);
  const ior = useGlass((s) => s.target.ior);
  const renderer = useGlass((s) => s.renderer);
  const perf = usePerf();
  const tilt = useSpringTilt();
  const n1 = inside ? ior : 1,
    n2 = inside ? 1 : ior;
  const ratio = (n1 / n2) * Math.sin((angle * Math.PI) / 180);
  const tir = ratio > 1;
  const theta = tir ? angle : (Math.asin(ratio) * 180) / Math.PI;
  const critical = inside ? (Math.asin(1 / ior) * 180) / Math.PI : null;
  return (
    <section className="secondary-view">
      <div className="section-intro">
        <div>
          <div className="eyebrow">THE TECHNOLOGY ATLAS</div>
          <h1>A feeling, explained.</h1>
          <p>Explore the small pieces of physics behind the glass.</p>
        </div>
        <span className="index-label">04 FIELD NOTES</span>
      </div>
      <div className="topic-tabs" role="tablist" aria-label="Technology topics">
        {[
          "Optics & light",
          "Waves & normals",
          "Spring kinetics",
          "CSS vs. WebGL",
          "Audio haptics",
        ].map((name, i) => (
          <button
            role="tab"
            aria-selected={topic === i}
            key={name}
            onClick={() => setTopic(i)}
          >
            {String(i + 1).padStart(2, "0")} <span>{name}</span>
          </button>
        ))}
      </div>
      {topic === 0 ? (
        <div className="atlas-grid">
          <article className="article-card">
            <div className="eyebrow">01 / REFRACTION</div>
            <h2>Light takes a different path.</h2>
            <p>
              When light enters a denser medium, it bends toward the surface
              normal. Blue light refracts slightly more than red: this
              wavelength dependence creates dispersion.
            </p>
            <Formula tex={"n_1\\sin\\theta_1=n_2\\sin\\theta_2"} />
            <h3>A reflection at the edge</h3>
            <p>
              Schlick’s approximation gives about 4% reflection at the center of
              ordinary glass. At a grazing angle, reflection approaches 100%.
            </p>
            <Formula tex={"F(\\theta)=F_0+(1-F_0)(1-\\cos\\theta)^5"} />
            <Formula tex={"F_0=\\left(\\frac{n_1-n_2}{n_1+n_2}\\right)^2"} />
          </article>
          <article className="demo-card">
            <div className="demo-label">
              SNELL’S LAW <span>LIVE EXPERIMENT</span>
            </div>
            <svg
              className="ray-diagram"
              viewBox="0 0 400 280"
              role="img"
              aria-label={
                tir
                  ? "Total internal reflection"
                  : `Refraction angle ${theta.toFixed(1)} degrees`
              }
            >
              <rect x="0" y="140" width="400" height="140" fill="#c8d9cc" />
              <path
                d="M0 140H400M200 20V265"
                stroke="#73917e"
                strokeDasharray="4 5"
              />
              <line
                x1={200 - Math.sin((angle * Math.PI) / 180) * 125}
                y1={140 - Math.cos((angle * Math.PI) / 180) * 125}
                x2="200"
                y2="140"
                stroke="#a8753b"
                strokeWidth="3"
              />
              <line
                x1="200"
                y1="140"
                x2={200 + Math.sin((theta * Math.PI) / 180) * 125}
                y2={
                  140 + (tir ? -1 : 1) * Math.cos((theta * Math.PI) / 180) * 125
                }
                stroke="#2d7861"
                strokeWidth="3"
              />
              <circle cx="200" cy="140" r="5" fill="#2d7861" />
              <text x="18" y="30">
                {inside ? "Glass" : "Air"} · n = {n1.toFixed(2)}
              </text>
              <text x="18" y="260">
                {inside ? "Air" : "Glass"} · n = {n2.toFixed(2)}
              </text>
            </svg>
            <Slider
              label="Incident angle"
              min={0}
              max={89}
              step={1}
              value={angle}
              digits={0}
              unit="°"
              onChange={setAngle}
            />
            <button
              className="text-button"
              onClick={() => setInside((v) => !v)}
            >
              Direction: {inside ? "glass → air" : "air → glass"}{" "}
              <ArrowUpRight size={16} />
            </button>
            <p className="result-note">
              {tir
                ? "Total internal reflection"
                : `Refracted angle: ${theta.toFixed(1)}°`}
              {critical !== null
                ? ` · Critical angle: ${critical.toFixed(1)}°`
                : ""}
            </p>
          </article>
        </div>
      ) : topic === 1 ? (
        <div className="atlas-grid">
          <article className="article-card">
            <div className="eyebrow">02 / HYDRODYNAMICS</div>
            <h2>A touch becomes a wave.</h2>
            <p>
              A click launches a radial wave. Its amplitude fades with time and
              distance, and the wave exists only behind the advancing front.
            </p>
            <Formula
              tex={
                "\\Delta h=Ae^{-\\gamma t}e^{-\\beta r}\\cos(kr-\\omega t)H(ct-r)"
              }
            />
            <p>
              The shader computes the height gradient analytically to tilt the
              surface normal. Up to eight waves overlap without a second
              simulation texture.
            </p>
            <Formula
              tex={
                "\\mathbf n=\\operatorname{normalize}(-\\partial_xh,-\\partial_yh,1)"
              }
            />
            <p className="control-note">
              A = amplitude · γ = time decay · β = spatial decay · c =
              propagation speed.
            </p>
          </article>
          <div
            className="wave-demo"
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const wave = document.createElement("i");
              wave.style.left = `${e.clientX - r.left}px`;
              wave.style.top = `${e.clientY - r.top}px`;
              e.currentTarget.append(wave);
              wave.addEventListener("animationend", () => wave.remove());
            }}
          >
            <MousePointer2 size={22} />
            <span>Touch the surface</span>
            <small>Wavefront visualization · CSS</small>
          </div>
        </div>
      ) : topic === 2 ? (
        <div className="atlas-grid">
          <article className="article-card">
            <div className="eyebrow">03 / SPRING KINETICS</div>
            <h2>Interfaces with a little inertia.</h2>
            <p>
              Every spring has a target. Stiffness pulls it toward that target;
              damping removes energy on the way.
            </p>
            <Formula tex={"m\\ddot x+c\\dot x+k(x-x_{\\mathrm{target}})=0"} />
            <Formula tex={"\\zeta=\\frac{c}{2\\sqrt{km}}"} />
            <p>
              ζ &lt; 1 oscillates. ζ = 1 returns without overshoot as quickly as
              possible. ζ &gt; 1 gives a slower, viscous return.
            </p>
            <SpringDemo />
          </article>
          <div ref={tilt} className="tilt-demo">
            <div className="eyebrow">MOVE TO FEEL</div>
            <span className="tilt-symbol">↗</span>
            <h2>
              A different
              <br />
              point of view.
            </h2>
            <p>
              Move your cursor or drag a finger.
              <br />
              Release to let the spring settle.
            </p>
          </div>
        </div>
      ) : topic === 3 ? (
        <div className="atlas-grid">
          <article className="article-card">
            <div className="eyebrow">04 / RENDERING METHODS</div>
            <h2>Two ways to make glass.</h2>
            <p>
              CSS backdrop blur diffuses the scene behind a panel. WebGL samples
              a background render target along a refracted ray, with separate
              indices for red, green, and blue.
            </p>
            <div className="compare-buttons">
              <button
                className={renderer === "css" ? "active" : ""}
                onClick={() => useGlass.setState({ renderer: "css" })}
              >
                CSS blur
              </button>
              <button
                className={renderer === "webgl" ? "active" : ""}
                onClick={() => useGlass.setState({ renderer: "webgl" })}
              >
                WebGL refraction
              </button>
            </div>
            <div className="benchmark">
              <strong>
                {perf.ms.toFixed(1)} <small>ms / frame</small>
              </strong>
              <span>{perf.fps} FPS · live browser frame cadence</span>
            </div>
            <p className="control-note">
              This is a live requestAnimationFrame measurement, not isolated GPU
              cost. Compare modes on the same device and viewport. Other tabs
              and browser overhead affect it.
            </p>
            <p className="control-note">
              SVG displacement in backdrop-filter is Chromium-only. Safari and
              Firefox use ordinary blur. The SVG example is in Code export.
            </p>
          </article>
          <div className="comparison-scene">
            <GlassScene />
            <span className="render-badge">
              {renderer === "css"
                ? "CSS BACKDROP BLUR"
                : "WEBGL · FBO REFRACTION"}
            </span>
          </div>
        </div>
      ) : (
        <AudioDemo />
      )}
    </section>
  );
}

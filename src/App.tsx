import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Box,
  FlaskConical,
  BookOpen,
  PanelsTopLeft,
  Code2,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  MousePointer2,
  Radio,
  RotateCcw,
  ChevronRight,
  Command,
} from "lucide-react";
import { GlassScene } from "./components/GlassScene";
import { Controls } from "./components/Controls";
import { usePerf } from "./components/PerfMeter";
import { presets, useGlass } from "./store";
import { useHaptics } from "./hooks/useHaptics";
import { useMedia } from "./hooks/usePreferences";
import type { Tab } from "./types";
import displacement from "./shaders/LiquidDisplacement.svg?raw";
const Atlas = lazy(() =>
  import("./components/Atlas").then((m) => ({ default: m.Atlas })),
);
const Widgets = lazy(() =>
  import("./components/Widgets").then((m) => ({ default: m.Widgets })),
);
const CodeExport = lazy(() =>
  import("./components/CodeExport").then((m) => ({ default: m.CodeExport })),
);
const tabs: Tab[] = [
  "Laboratory",
  "Technology atlas",
  "Spatial widgets",
  "Code export",
];
const icons = [FlaskConical, BookOpen, PanelsTopLeft, Code2];
function App() {
  const [tab, setTab] = useState<Tab>("Laboratory");
  const [expanded, setExpanded] = useState(false);
  const [hint, setHint] = useState(false);
  const [dockX, setDockX] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const s = useGlass();
  const perf = usePerf();
  const play = useHaptics(s.muted, s.volume, s.tone);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void;
        };
      }
    ).modelContext;
    if (!context) return;
    const controller = new AbortController();
    try {
      context.registerTool(
        {
          name: "set_glass_preset",
          description:
            "Select a material preset in the visible glass laboratory.",
          inputSchema: {
            type: "object",
            properties: { preset: { type: "integer", minimum: 0, maximum: 3 } },
            required: ["preset"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input: { preset: number }) => {
            if (
              !Number.isInteger(input.preset) ||
              input.preset < 0 ||
              input.preset > 3
            )
              throw Error("Preset must be an integer from 0 to 3");
            useGlass.getState().select(input.preset);
            setTab("Laboratory");
            return { preset: presets[input.preset].name };
          },
        },
        { signal: controller.signal },
      );
    } catch {}
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(false), 1800);
    return () => clearTimeout(timer);
  }, [hint]);
  useEffect(() => {
    let previous = scrollY,
      raf = 0,
      timeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const velocity = Math.min(Math.abs(scrollY - previous) / 800, 0.025);
        previous = scrollY;
        document.documentElement.style.setProperty(
          "--squish",
          String(1 - velocity),
        );
        clearTimeout(timeout);
        timeout = setTimeout(
          () => document.documentElement.style.setProperty("--squish", "1"),
          120,
        );
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [reduced]);
  const navigate = (next: Tab) => {
    setTab(next);
    setExpanded(false);
    play();
  };
  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Laboratory");
          }}
          aria-label="Spatial home"
        >
          <Box size={28} strokeWidth={1.4} />
          <span>
            spatial<span className="brand-period">.</span>
          </span>
          <span className="version">LAB / 02</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {tabs.map((t) => (
            <button
              className={tab === t ? "active" : ""}
              key={t}
              onClick={() => navigate(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="header-status">
          <span className="live-dot" />
          System online <span className="separator" />
          <button
            className="icon-btn"
            onClick={s.mute}
            aria-label={s.muted ? "Unmute sound" : "Mute sound"}
          >
            {s.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </header>
      <main>
        {tab === "Laboratory" ? (
          <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="tiny-cross">+</span> AN EXPERIMENT IN DIGITAL
                  MATERIALS
                </div>
                <h1>
                  Less interface.
                  <br className="mobile-break" /> More <span>feeling.</span>
                </h1>
                <p>
                  Light, motion, and a little bit of physics. Make the glass
                  your own.
                </p>
              </div>
              <button
                className="outline-button"
                onClick={() => navigate("Technology atlas")}
              >
                Explore the science <ArrowUpRight size={16} />
              </button>
            </div>
            <div className={`laboratory ${expanded ? "expanded" : ""}`}>
              <div
                ref={stage}
                className="glass-stage"
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  window.dispatchEvent(
                    new CustomEvent("glass-ripple", {
                      detail: {
                        x: (e.clientX - r.left) / r.width,
                        y: (e.clientY - r.top) / r.height,
                      },
                    }),
                  );
                  play();
                  setHint(true);
                }}
              >
                <GlassScene />
                <div className="stage-top">
                  <div className="stage-label">
                    <span className="live-dot" />
                    LIVE MATERIAL<span className="stage-divider">/</span>
                    <span>EXPERIMENT 001</span>
                  </div>
                  <div className="stage-actions">
                    <button
                      aria-label="Reset preset"
                      title="Reset preset"
                      onClick={() => s.select(s.preset)}
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      aria-label={
                        expanded ? "Exit expanded view" : "Expand specimen"
                      }
                      title="Expand specimen"
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded ? (
                        <Minimize2 size={16} />
                      ) : (
                        <Maximize2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="specimen-label">
                  <span className="eyebrow">
                    SPECIMEN / {String(s.preset + 1).padStart(2, "0")}
                  </span>
                  <h2>{presets[s.preset].name}</h2>
                  <p>{presets[s.preset].note}</p>
                </div>
                <div className="stage-callout">
                  <span className="callout-line" />
                  <span>
                    n = {s.target.ior.toFixed(2)}
                    <small>REFRACTIVE INDEX</small>
                  </span>
                </div>
                <div className="stage-bottom">
                  <span>
                    <MousePointer2 size={14} />
                    {hint
                      ? "A small touch. A new wave."
                      : "Move to explore · touch to ripple"}
                  </span>
                  <span className="engine-label">
                    {s.renderer === "webgl" ? "WEBGL 2.0" : "CSS FALLBACK"}{" "}
                    <span>↗</span>
                  </span>
                </div>
              </div>
              <Controls />
            </div>
            <div className="material-strip">
              <div className="strip-label">
                <span>MATERIAL LIBRARY</span>
                <small>Choose a different state.</small>
              </div>
              {presets.map((p, i) => (
                <button
                  className={`preset-tile ${s.preset === i ? "selected" : ""}`}
                  key={p.name}
                  onClick={() => {
                    s.select(i);
                    play();
                  }}
                >
                  <span
                    className={`preset-orb orb-${i}`}
                    style={{ "--orb-color": p.color } as React.CSSProperties}
                  />
                  <span>
                    {p.name}
                    <small>
                      {
                        [
                          "Balanced & transparent",
                          "Soft & responsive",
                          "Spectral & expressive",
                          "Diffuse & atmospheric",
                        ][i]
                      }
                    </small>
                  </span>
                  <span className="preset-radio">
                    {s.preset === i ? "●" : ""}
                  </span>
                </button>
              ))}
            </div>
            <div className="below-stage">
              <p>
                <span className="tiny-cross">+</span> A material is more than
                how it looks. It’s how it responds.
              </p>
              <button
                className="text-button"
                onClick={() => navigate("Code export")}
              >
                Behind the glass <ChevronRight size={15} />
              </button>
            </div>
          </>
        ) : (
          <Suspense
            fallback={
              <div className="loading-view">Opening the experiment…</div>
            }
          >
            {tab === "Technology atlas" ? (
              <Atlas />
            ) : tab === "Spatial widgets" ? (
              <Widgets />
            ) : (
              <CodeExport />
            )}
          </Suspense>
        )}
      </main>
      <footer className="site-footer">
        <div className="footer-brand">
          SPATIAL GLASS OS <span>V2.0</span>
        </div>
        <div className="system-metrics">
          <span>
            <Radio size={12} />
            {perf.fps || "—"} FPS
          </span>
          <span>{perf.ms.toFixed(1)} MS</span>
          {perf.memory > 0 && <span>{perf.memory} MB</span>}
          <span className="muted">
            {reduced
              ? "REDUCED MOTION"
              : s.renderer === "webgl"
                ? "GPU ACCELERATED"
                : "SIMPLIFIED RENDERING"}
          </span>
        </div>
        <span className="footer-note">Made of light. Built to explore.</span>
      </footer>
      <div
        className="dock"
        aria-label="Quick navigation"
        onPointerMove={(e) => setDockX(e.clientX)}
        onPointerLeave={() => setDockX(null)}
      >
        {tabs.map((t, i) => {
          const Icon = icons[i];
          return (
            <button
              key={t}
              title={t}
              aria-label={t}
              aria-current={tab === t ? "page" : undefined}
              className={tab === t ? "active" : ""}
              ref={(el) => {
                if (el) {
                  const r = el.getBoundingClientRect();
                  el.style.setProperty(
                    "--magnify",
                    String(
                      reduced || dockX === null
                        ? 1
                        : 1 +
                            0.2 *
                              Math.exp(
                                -Math.pow(
                                  (dockX - r.left - r.width / 2) / 65,
                                  2,
                                ),
                              ),
                    ),
                  );
                }
              }}
              onClick={() => navigate(t)}
            >
              <Icon size={21} strokeWidth={1.6} />
              <span className="dock-tooltip">{t}</span>
            </button>
          );
        })}
        <span className="dock-separator" />
        <button
          title={s.muted ? "Enable audio" : "Mute audio"}
          aria-label={s.muted ? "Enable audio" : "Mute audio"}
          onClick={() => {
            s.mute();
          }}
        >
          {s.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <span className="dock-key">
          <Command size={11} />
        </span>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: displacement }}
      />
    </div>
  );
}
export default App;

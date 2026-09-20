import { useEffect, useRef, useState } from "react";
import {
  Fingerprint,
  Activity,
  AudioLines,
  ArrowUpRight,
  Play,
  Pause,
  Box,
} from "lucide-react";
import { GlassScene } from "./GlassScene";
import { useSpringTilt } from "../hooks/useSpringTilt";
import { useHaptics } from "../hooks/useHaptics";
import { useGlass } from "../store";
export function Widgets() {
  const s = useGlass();
  const play = useHaptics(s.muted, s.volume, s.tone);
  const tilt = useSpringTilt(s.target.stiffness, s.target.damping);
  const [scan, setScan] = useState<"idle" | "scanning" | "done">("idle");
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (
    <section className="secondary-view">
      <div className="section-intro">
        <div>
          <div className="eyebrow">SPATIAL WIDGETS</div>
          <h1>Small windows. More dimension.</h1>
          <p>Four experiments in light, motion, and feedback.</p>
        </div>
        <span className="index-label">INTERACTIVE COLLECTION</span>
      </div>
      <div className="widget-grid">
        <article className="widget core-widget">
          <div className="widget-heading">
            <Box size={17} /> Neural core <span>SIMULATION</span>
          </div>
          <div className="core-scene">
            <GlassScene core />
          </div>
          <div className="widget-bottom">
            <span>
              <strong>38.4°</strong>Simulated temperature
            </span>
            <svg viewBox="0 0 180 40" aria-label="Illustrative simulated load">
              <path
                d="M0 32L15 26L30 30L45 12L60 24L75 20L90 8L105 19L120 12L135 21L150 10L180 17"
                fill="none"
                stroke="#487361"
                strokeWidth="2"
              />
            </svg>
          </div>
        </article>
        <article className={`widget scanner ${scan}`}>
          <div className="widget-heading">
            <Fingerprint size={17} /> Biometric scanner <span>DEMO</span>
          </div>
          <div className="scan-area">
            <Fingerprint size={100} strokeWidth={0.8} />
            <i />
          </div>
          <h3>
            {scan === "done"
              ? "Pattern recognized"
              : scan === "scanning"
                ? "Reading the surface…"
                : "A touch of recognition."}
          </h3>
          <p>Local visual simulation. No biometric data is collected.</p>
          <button
            className="pill-button"
            disabled={scan === "scanning"}
            onClick={() => {
              play();
              setScan("scanning");
              timers.current.push(
                setTimeout(() => {
                  setScan("done");
                  play();
                }, 1800),
              );
            }}
          >
            {scan === "done" ? "Scan again" : "Begin scan"}
            <ArrowUpRight size={15} />
          </button>
        </article>
        <article className={`widget equalizer ${playing ? "playing" : ""}`}>
          <div className="widget-heading">
            <AudioLines size={17} /> Spatial audio <span>GENERATED VISUAL</span>
          </div>
          <div className="bars" aria-hidden="true">
            {Array.from({ length: 35 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${18 + Math.sin(i * 0.65) ** 2 * 70}%`,
                  animationDelay: `${-i * 0.13}s`,
                }}
              />
            ))}
          </div>
          <div className="widget-bottom">
            <span>
              <strong>Visible rhythm</strong>Illustrative spectrum · no
              microphone
            </span>
            <button
              className="round-button"
              aria-label={playing ? "Pause spectrum" : "Play spectrum"}
              onClick={() => {
                setPlaying((v) => !v);
                play();
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        </article>
        <div ref={tilt} className="widget identity">
          <div className="widget-heading">
            <Activity size={17} /> Prismatic identity <span>01 — 004</span>
          </div>
          <div className="identity-symbol">
            s<span>↗</span>
          </div>
          <div className="holo-strip" />
          <div className="widget-bottom">
            <span>
              <strong>Spatial explorer</strong>Move to discover a different
              angle.
            </span>
            <span className="identity-mark">SP / 26</span>
          </div>
        </div>
      </div>
    </section>
  );
}

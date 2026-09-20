import {
  RotateCcw,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { presets, useGlass } from "../store";
import type { Material } from "../types";
import { dampingRatio } from "../lib/springMath";
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = "",
  digits = 2,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
  digits?: number;
}) {
  return (
    <label className="slider-label">
      <span>
        {label}
        <output>
          {value.toFixed(digits)}
          {unit}
        </output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={
          {
            "--range": `${((value - min) / (max - min)) * 100}%`,
          } as React.CSSProperties
        }
      />
    </label>
  );
}
export function Controls() {
  const s = useGlass();
  const z = dampingRatio(s.target.stiffness, s.target.damping);
  const slider = (
    label: string,
    key: keyof Material,
    min: number,
    max: number,
    step: number,
    digits = 2,
  ) => (
    <Slider
      label={label}
      value={s.target[key]}
      min={min}
      max={max}
      step={step}
      digits={digits}
      onChange={(v) => s.set(key, v)}
    />
  );
  return (
    <aside className="controls glass-panel">
      <div className="panel-title">
        <span>
          <SlidersHorizontal size={16} /> Material properties
        </span>
        <button
          className="icon-btn"
          title="Reset material"
          aria-label="Reset material"
          onClick={() => s.select(s.preset)}
        >
          <RotateCcw size={15} />
        </button>
      </div>
      <div className="control-group">
        <div className="eyebrow">MATERIAL PRESET</div>
        <div className="select-wrap">
          <span
            className="material-dot"
            style={{ background: presets[s.preset].color }}
          />
          <select
            aria-label="Material preset"
            value={s.preset}
            onChange={(e) => s.select(Number(e.target.value))}
          >
            {presets.map((p, i) => (
              <option key={p.name} value={i}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </div>
        <p className="control-note">{presets[s.preset].note}</p>
      </div>
      <div className="control-group">
        <div className="group-heading">
          Optics <span>01</span>
        </div>
        {slider("Refractive index", "ior", 1, 2.42, 0.01)}
        <div className="range-ends">
          <span>Air · 1.00</span>
          <span>Diamond · 2.42</span>
        </div>
        {slider("Chromatic dispersion", "dispersion", 0, 0.12, 0.001, 3)}
        {slider("Surface roughness", "roughness", 0, 1, 0.01)}
      </div>
      <details className="control-group" open>
        <summary>
          Surface dynamics <span>02</span>
        </summary>
        {slider("Ripple amplitude", "amplitude", 0, 0.2, 0.005, 3)}
        {slider("Wave frequency", "frequency", 8, 60, 1, 0)}
        {slider("Wave decay", "decay", 0.2, 4, 0.1, 1)}
      </details>
      <details className="control-group">
        <summary>
          Spring physics <span>03</span>
        </summary>
        {slider("Stiffness", "stiffness", 40, 400, 1, 0)}
        {slider("Damping", "damping", 2, 50, 1, 0)}
        <p className="control-note">
          ζ = {z.toFixed(2)} ·{" "}
          {z < 0.98 ? "Underdamped" : z > 1.02 ? "Overdamped" : "Critical"}
        </p>
      </details>
      <div className="haptics-row">
        <span>
          {s.muted ? <VolumeX size={16} /> : <Volume2 size={16} />} Audio
          haptics
        </span>
        <button
          className={`switch ${s.muted ? "" : "on"}`}
          role="switch"
          aria-checked={!s.muted}
          aria-label="Audio haptics"
          onClick={s.mute}
        >
          <i />
        </button>
      </div>
      {!s.muted && (
        <div className="audio-controls">
          <Slider
            label="Volume"
            value={s.volume}
            min={0}
            max={1}
            step={0.01}
            onChange={(volume) => useGlass.setState({ volume })}
          />
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
        </div>
      )}
      <div className="panel-foot">
        <span className="small-dot" />
        Changes are rendered in real time
      </div>
    </aside>
  );
}

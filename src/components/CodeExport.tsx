import { useEffect, useState } from "react";
import { Check, Copy, Download, Code2 } from "lucide-react";
import glass from "../shaders/liquidGlass.frag.glsl?raw";
import vertex from "../shaders/liquidGlass.vert.glsl?raw";
import haptics from "../hooks/useHaptics.ts?raw";
import tilt from "../hooks/useSpringTilt.ts?raw";
import svg from "../shaders/LiquidDisplacement.svg?raw";
const files = [
  {
    name: "liquidGlass.frag.glsl",
    lang: "glsl",
    source: glass,
    note: "The fragment shader running in the lab. Supply the background texture, camera, resolution, material uniforms, and eight ripple positions.",
  },
  {
    name: "liquidGlass.vert.glsl",
    lang: "glsl",
    source: vertex,
    note: "The matching Three.js vertex shader. Pair with the fragment shader in a ShaderMaterial.",
  },
  {
    name: "useHaptics.ts",
    lang: "typescript",
    source: haptics,
    note: "A standalone React hook. Call the returned function from a user gesture. Defaults to muted.",
  },
  {
    name: "useSpringTilt.ts",
    lang: "typescript",
    source: tilt,
    note: "A standalone React hook. Attach the returned ref to a div. Supports reduced motion and pointer input.",
  },
  {
    name: "LiquidDisplacement.svg",
    lang: "xml",
    source: svg,
    note: "Inline this SVG and apply backdrop-filter: url(#liquid-displacement). Chromium only; retain backdrop-filter: blur(12px) for other browsers.",
  },
];
export function CodeExport() {
  const [selected, setSelected] = useState(0);
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");
  const f = files[selected];
  useEffect(() => {
    let alive = true;
    setHtml("");
    import("../lib/highlight")
      .then(({ highlight }) => highlight(f.source, f.lang))
      .then((value) => {
        if (alive) setHtml(value);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [f]);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2200);
    return () => clearTimeout(t);
  }, [status]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(f.source);
      setStatus("Copied");
    } catch {
      setStatus("Clipboard unavailable. Use Download.");
    }
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([f.source], { type: "text/plain" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="secondary-view">
      <div className="section-intro">
        <div>
          <div className="eyebrow">TAKE THE GOOD PARTS</div>
          <h1>From the lab to your project.</h1>
          <p>
            The exact source behind the live experiments. Yours to build with.
          </p>
        </div>
        <Code2 size={32} strokeWidth={1} />
      </div>
      <div className="code-layout">
        <aside className="file-list">
          {files.map((file, i) => (
            <button
              key={file.name}
              className={selected === i ? "active" : ""}
              onClick={() => setSelected(i)}
            >
              <Code2 size={16} />
              {file.name}
            </button>
          ))}
          <p>
            Live source · no project imports
            <br />
            React required for hooks
          </p>
        </aside>
        <div className="code-panel">
          <div className="code-toolbar">
            <span>{f.name}</span>
            <div>
              <button onClick={download} aria-label="Download source">
                <Download size={16} />
              </button>
              <button onClick={copy}>
                {status === "Copied" ? <Check size={15} /> : <Copy size={15} />}{" "}
                {status === "Copied" ? "Copied" : "Copy code"}
              </button>
            </div>
          </div>
          <p className="code-note">{f.note}</p>
          <div className="source-code">
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <pre>
                <code>{f.source}</code>
              </pre>
            )}
          </div>
          <div className="sr-only" role="status">
            {status}
          </div>
          {status && status !== "Copied" && <p role="alert">{status}</p>}
        </div>
      </div>
    </section>
  );
}

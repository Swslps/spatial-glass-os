import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { getGPUTier } from "detect-gpu";
import * as THREE from "three";
import { useGlass } from "../store";
import { springStep } from "../lib/springMath";
import { useMedia } from "../hooks/usePreferences";
import vertex from "../shaders/liquidGlass.vert.glsl?raw";
import fragment from "../shaders/liquidGlass.frag.glsl?raw";
const backdropFragment = `varying vec2 vUv;uniform float time;uniform float cyber;
void main(){vec2 p=vUv;vec3 col=vec3(.87,.90,.87);vec2 a=vec2(.32+sin(time*.15)*.09,.48+cos(time*.13)*.13);vec2 b=vec2(.69+cos(time*.1)*.1,.63+sin(time*.17)*.13);
float light1=exp(-length((p-a)*vec2(1.,1.3))*5.);float light2=exp(-length(p-b)*6.);
col=mix(col,mix(vec3(.48,.67,.53),vec3(.57,.2,.88),cyber),light1*.7);col=mix(col,mix(vec3(.90,.82,.61),vec3(.05,.86,.92),cyber),light2*.65);
vec2 grid=abs(fract(p*vec2(32.,24.)-.5)-.5)/fwidth(p*vec2(32.,24.));float line=1.-min(min(grid.x,grid.y),1.);col=mix(col,vec3(.42,.53,.47),line*.11);
float noise=fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);gl_FragColor=vec4(col+(noise-.5)*.025,1.);}`;
const flatVertex =
  "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
let gpuChecked = false;
function World({ reduced, core }: { reduced: boolean; core: boolean }) {
  const { gl, size, invalidate } = useThree();
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2),
    [],
  );
  const fbo = useFBO(
    Math.min(size.width * gl.getPixelRatio(), 1600),
    Math.min(size.height * gl.getPixelRatio(), 1200),
    { depthBuffer: false },
  );
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const bg = useRef<THREE.ShaderMaterial>(null);
  const current = useRef({ ...useGlass.getState().target });
  const velocities = useRef<Record<string, number>>({});
  const rippleIndex = useRef(0);
  const uniforms = useMemo(
    () => ({
      uBackground: { value: fbo.texture },
      uResolution: { value: new THREE.Vector2() },
      uIor: { value: 1.52 },
      uDispersion: { value: 0.012 },
      uRoughness: { value: 0.08 },
      uTime: { value: 0 },
      uAmplitude: { value: 0.055 },
      uFrequency: { value: 24 },
      uDecay: { value: 1.4 },
      uRipples: {
        value: Array.from({ length: 8 }, () => new THREE.Vector3(-1, -1, -100)),
      },
    }),
    [fbo.texture],
  );
  const bgUniforms = useMemo(
    () => ({ time: { value: 0 }, cyber: { value: 0 } }),
    [],
  );
  useEffect(() => useGlass.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    const handle = (e: Event) => {
      const point = (e as CustomEvent<{ x: number; y: number }>).detail;
      const liveUniforms = material.current?.uniforms;
      if (!liveUniforms || reduced) return;
      liveUniforms.uRipples.value[rippleIndex.current % 8].set(
        point.x,
        1 - point.y,
        liveUniforms.uTime.value,
      );
      rippleIndex.current++;
      invalidate();
    };
    window.addEventListener("glass-ripple", handle);
    return () => window.removeEventListener("glass-ripple", handle);
  }, [invalidate, reduced]);
  useFrame((state, dt) => {
    if (!material.current || !bg.current) return;
    const liveUniforms = material.current.uniforms;
    const backgroundUniforms = bg.current.uniforms;
    const s = useGlass.getState();
    const values = current.current;
    for (const key of Object.keys(values) as (keyof typeof values)[]) {
      const next = springStep(
        values[key],
        velocities.current[key] || 0,
        s.target[key],
        s.target.stiffness,
        s.target.damping,
        dt,
      );
      values[key] = reduced ? s.target[key] : next.x;
      velocities.current[key] = next.v;
    }
    backgroundUniforms.time.value = reduced ? 0 : state.clock.elapsedTime;
    backgroundUniforms.cyber.value = s.preset === 2 ? 1 : 0;
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    liveUniforms.uResolution.value.set(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
    );
    liveUniforms.uTime.value = state.clock.elapsedTime;
    liveUniforms.uIor.value = Math.max(1, values.ior);
    liveUniforms.uDispersion.value = Math.max(0, values.dispersion);
    liveUniforms.uRoughness.value = Math.max(0, Math.min(1, values.roughness));
    liveUniforms.uAmplitude.value = Math.max(0, values.amplitude);
    liveUniforms.uFrequency.value = values.frequency;
    liveUniforms.uDecay.value = Math.max(0.01, values.decay);
    if (mesh.current) {
      mesh.current.rotation.x = reduced ? 0.2 : 0.2 + state.pointer.y * 0.18;
      mesh.current.rotation.y = reduced
        ? -0.22
        : -0.22 + state.pointer.x * 0.25;
      mesh.current.rotation.z = reduced
        ? -0.35
        : -0.35 + Math.sin(state.clock.elapsedTime * 0.3) * 0.045;
      mesh.current.position.y = reduced
        ? 0
        : Math.sin(state.clock.elapsedTime * 0.65) * 0.065;
    }
  });
  return (
    <>
      {createPortal(
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={bg}
            vertexShader={flatVertex}
            fragmentShader={backdropFragment}
            uniforms={bgUniforms}
          />
        </mesh>,
        scene,
      )}
      <mesh frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}"
          fragmentShader="varying vec2 vUv;uniform sampler2D background;void main(){gl_FragColor=texture2D(background,vUv);}"
          uniforms={{ background: { value: fbo.texture } }}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={mesh} scale={size.width < 500 ? 1.05 : 1.25}>
        {core ? (
          <icosahedronGeometry args={[1.15, 1]} />
        ) : (
          <torusGeometry args={[0.92, 0.36, 64, 160]} />
        )}
        <shaderMaterial
          ref={material}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
}
class Boundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useGlass.setState({ renderer: "css" });
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function GlassScene({ core = false }: { core?: boolean }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const renderer = useGlass((s) => s.renderer);
  const quality = useGlass((s) => s.quality);
  const roughness = useGlass((s) => s.target.roughness);
  const ior = useGlass((s) => s.target.ior);
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    if (gpuChecked) return;
    gpuChecked = true;
    getGPUTier()
      .then((r) =>
        useGlass.setState({
          quality: r.tier,
          renderer: r.tier === 0 ? "css" : "webgl",
        }),
      )
      .catch(() => {});
  }, []);
  useEffect(() => {
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (host.current) observer.observe(host.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  const fallback = (
    <div className="css-specimen">
      <div
        className="css-lens"
        style={{
          backdropFilter: `blur(${2 + roughness * 28}px)${/Chrome|Chromium|Edg\//.test(navigator.userAgent) ? " url(#liquid-displacement)" : ""}`,
          transform: `scale(${0.9 + (ior - 1) * 0.15})`,
        }}
      />
      <span>CSS glass · simplified rendering</span>
    </div>
  );
  return (
    <div ref={host} className="scene" aria-hidden="true">
      {renderer === "css" ? (
        fallback
      ) : (
        <Boundary fallback={fallback}>
          <Canvas
            dpr={[1, quality < 2 ? 1.25 : 1.75]}
            frameloop={active && !reduced ? "always" : "demand"}
            camera={{ position: [0, 0, 5], fov: 42 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.debug.checkShaderErrors = true;
              gl.domElement.addEventListener("webglcontextlost", () => {
                if (gl.domElement.isConnected)
                  useGlass.setState({ renderer: "css" });
              });
            }}
          >
            <World reduced={reduced} core={core} />
          </Canvas>
        </Boundary>
      )}
    </div>
  );
}

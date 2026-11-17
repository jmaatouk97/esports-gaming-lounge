import { useEffect, useRef } from "react";
import { useThemePreset, type BackgroundMode } from "../theme";

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uSpeed;
uniform float uIntensity;
uniform float uLight;
uniform int uMode;
uniform vec3 uA;
uniform vec3 uB;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * vnoise(p);
    p = p * 2.02 + vec2(17.0, 9.0);
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  float t = uTime * (0.15 + uSpeed * 1.1);

  vec3 base = mix(vec3(0.012, 0.014, 0.022), vec3(0.945, 0.955, 0.982), uLight);
  vec3 col = base;
  float vig = smoothstep(1.35, 0.2, length(p));

  if (uMode == 1) {
    // LED dot matrix
    vec2 gp = uv * vec2(aspect, 1.0) * vec2(64.0, 40.0);
    vec2 id = floor(gp);
    vec2 f = fract(gp) - 0.5;
    float dotMask = smoothstep(0.38, 0.16, length(f));
    float wave = 0.5 + 0.5 * sin(id.x * 0.11 + id.y * 0.4 - t * 2.2);
    float flick = hash21(id + floor(t * 4.0));
    float active = step(0.68 - uIntensity * 0.26, mix(flick, wave, 0.62));
    float sweep = smoothstep(0.16, 0.0, abs(uv.y - fract(t * 0.07)));
    float v = dotMask * clamp(active * 0.95 + sweep * 0.38, 0.0, 1.0) * vig;
    vec3 led = mix(uA, uB, 0.22);
    led = mix(led, led * 0.42, uLight);
    col = mix(base, led, clamp(v * (0.4 + uIntensity * 0.95) * mix(1.0, 0.7, uLight), 0.0, 1.0));
    col = mix(col, led, 0.05 * (1.0 - smoothstep(0.0, 0.02, abs(f.y))) * vig);
  } else if (uMode == 2) {
    // Aurora mesh
    float n1 = fbm(p * 1.25 + vec2(t * 0.18, -t * 0.12));
    float n2 = fbm(p * 1.9 + vec2(-t * 0.11, t * 0.14) + n1 * 2.0);
    float band = smoothstep(0.28, 0.78, n2);
    float band2 = smoothstep(0.35, 1.0, n1);
    vec3 aurora = mix(uA, uB, band2);
    float amp = (0.22 + uIntensity * 0.58) * mix(1.0, 0.45, uLight);
    col = mix(col, aurora, clamp(band * amp * (0.4 + 0.6 * vig), 0.0, 1.0));
    col += uA * 0.08 * smoothstep(0.35, 1.2, p.y) * mix(1.0, 0.4, uLight);
  } else if (uMode == 3) {
    // Vector grid
    vec2 q = p;
    q.x /= (0.18 + uv.y * 0.95);
    q *= 5.0 + uIntensity * 5.0;
    q.y += t * 1.2;
    vec2 g = abs(fract(q) - 0.5);
    float lines = smoothstep(0.46, 0.5, max(g.x, g.y));
    float glow = smoothstep(0.5, 0.0, abs(uv.y - 0.35));
    float scan = smoothstep(0.02, 0.0, abs(uv.y - fract(t * 0.1)));
    col += mix(uA, uB, uv.y) * lines * (0.09 + uIntensity * 0.42) * (0.4 + glow) * mix(1.0, 0.62, uLight);
    col += uA * scan * 0.3 * uIntensity;
    col *= 0.72 + 0.28 * vig;
  } else if (uMode == 4) {
    // Film grain wash
    float n = hash21(gl_FragCoord.xy + floor(t * 45.0) * 17.0);
    float blot = fbm(p * 3.0 + t * 0.05);
    float grain = (n - 0.5) * mix(0.14, 0.08, uLight) * (0.25 + uIntensity);
    col += grain;
    col += uA * blot * 0.09 * uIntensity * mix(1.0, 0.45, uLight);
    col *= 0.9 + 0.1 * vig;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

const MODE_INDEX: Record<Exclude<BackgroundMode, "none">, number> = {
  led: 1,
  aurora: 2,
  grid: 3,
  grain: 4,
};

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("Background shader failed to compile:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function BackgroundShader() {
  const { background, preset, mode } = useThemePreset();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const settingsRef = useRef({
    mode: background.mode,
    speed: background.speed,
    intensity: background.intensity,
    paused: background.paused,
    palette: preset.colors,
    light: mode === "light",
  });
  const needsDrawRef = useRef(true);
  const timeRef = useRef(0);

  useEffect(() => {
    settingsRef.current = {
      mode: background.mode,
      speed: background.speed,
      intensity: background.intensity,
      paused: background.paused,
      palette: preset.colors,
      light: mode === "light",
    };
    needsDrawRef.current = true;
    if (canvasRef.current) {
      canvasRef.current.style.opacity = background.mode === "none" ? "0" : "1";
    }
  }, [background, preset, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }
    glRef.current = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Background shader failed to link:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    uniformsRef.current = {
      uRes: gl.getUniformLocation(program, "uRes"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uSpeed: gl.getUniformLocation(program, "uSpeed"),
      uIntensity: gl.getUniformLocation(program, "uIntensity"),
      uLight: gl.getUniformLocation(program, "uLight"),
      uMode: gl.getUniformLocation(program, "uMode"),
      uA: gl.getUniformLocation(program, "uA"),
      uB: gl.getUniformLocation(program, "uB"),
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        needsDrawRef.current = true;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = (time: number) => {
      const settings = settingsRef.current;
      const u = uniformsRef.current;
      const [r1, g1, b1] = hexToRgb(settings.palette[0]);
      const [r2, g2, b2] = hexToRgb(settings.palette[1]);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uSpeed, settings.speed / 100);
      gl.uniform1f(u.uIntensity, settings.intensity / 100);
      gl.uniform1f(u.uLight, settings.light ? 1 : 0);
      gl.uniform1i(u.uMode, MODE_INDEX[settings.mode as Exclude<BackgroundMode, "none">] ?? 0);
      gl.uniform3f(u.uA, r1, g1, b1);
      gl.uniform3f(u.uB, r2, g2, b2);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let frame = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const settings = settingsRef.current;
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      if (settings.mode === "none") {
        if (needsDrawRef.current) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          needsDrawRef.current = false;
        }
      } else if (!settings.paused && !reduced && !document.hidden) {
        timeRef.current += delta;
        draw(timeRef.current);
      } else if (needsDrawRef.current) {
        draw(timeRef.current);
        needsDrawRef.current = false;
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      glRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-canvas" aria-hidden="true" />;
}

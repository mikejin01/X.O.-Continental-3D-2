import { useRef, useEffect, useCallback } from 'react';

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(gl, vs, fs) {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vs);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vertShader || !fragShader) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function createFBO(gl, w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fbo };
}

/* ── Shared vertex shader ── */
const VERT = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 vUv;
  void main() {
    vUv = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/* ── Pass 1: Trail update (ping-pong) ── */
const TRAIL_FRAG = `
  precision highp float;
  uniform sampler2D uPrevTrail;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform vec2 uPixel;
  uniform float uAspect;
  uniform float uActive;
  varying vec2 vUv;

  const float PI = 3.14159265;

  void main() {
    vec2 vel = uMouse - uPrevMouse;
    float speed = length(vel);
    vec2 blurDir = speed > 0.0001 ? normalize(vel) : vec2(1.0, 0.0);

    vec3 sum = vec3(0.0);
    for (int i = -2; i <= 2; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 offset = blurDir * float(i) * 2.0 + vec2(-blurDir.y, blurDir.x) * float(j) * 1.0;
        sum += texture2D(uPrevTrail, vUv + offset * uPixel * 2.5).rgb;
      }
    }
    vec3 blurred = sum / 15.0;

    blurred *= 0.97;

    if (speed > 0.00005 && uActive > 0.05) {
      float angle = atan(vel.y, vel.x);
      float hue = angle / (2.0 * PI) + 0.5;

      float h6 = fract(hue) * 6.0;
      float f = fract(h6);
      vec3 col;
      if      (h6 < 1.0) col = vec3(1.0, f,   0.0);
      else if (h6 < 2.0) col = vec3(1.0-f, 1.0, 0.0);
      else if (h6 < 3.0) col = vec3(0.0, 1.0, f);
      else if (h6 < 4.0) col = vec3(0.0, 1.0-f, 1.0);
      else if (h6 < 5.0) col = vec3(f, 0.0, 1.0);
      else               col = vec3(1.0, 0.0, 1.0-f);

      vec2 d = vUv - uMouse;
      d.x *= uAspect;
      float along = dot(d, blurDir);
      float perp = dot(d, vec2(-blurDir.y, blurDir.x));

      float stripFalloff = perp * perp * 800.0 + along * along * 50.0;
      float spot = exp(-stripFalloff) * min(speed * 45.0, 0.8);

      vec3 lineColor = mix(col, col + vec3(0.3), spot) * spot;

      blurred += lineColor * 0.7;
    }

    blurred = min(blurred, vec3(1.0));
    gl_FragColor = vec4(blurred, 1.0);
  }
`;

/* ── Pass 2: Composite (to screen) ── */
const COMP_FRAG = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform sampler2D uTrail;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform float uTime;
  uniform float uAspect;
  uniform float uActive;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    vec2 diff = uv - uMouse;
    diff.x *= uAspect;
    float dist = length(diff);

    float bulgeRadius = 0.3;
    float bulgeStrength = 0.25;

    vec2 bulgeDisp = vec2(0.0);
    if (dist < bulgeRadius) {
      float t = dist / bulgeRadius;
      float weight = 1.0 - t * t * (3.0 - 2.0 * t);
      if (dist > 0.001) {
        vec2 dir = diff / dist;
        dir.x /= uAspect;
        bulgeDisp = dir * weight * bulgeStrength * dist * uActive;
      }
    }

    vec4 texColor = texture2D(uTexture, uv + bulgeDisp);

    float darkening = 0.0;
    if (dist < bulgeRadius && uActive > 0.01) {
      float t = dist / bulgeRadius;
      float nz = sqrt(max(0.0, 1.0 - t * t));

      vec3 normal = vec3(0.0, 0.0, 1.0);
      if (dist > 0.001) {
        normal = normalize(vec3(diff.x / uAspect, diff.y, nz * 0.6));
      }

      vec3 lightDir = normalize(vec3(-0.3, 0.5, 1.0));
      float ndotl = max(dot(normal, lightDir), 0.0);

      float sphereMask = (1.0 - t * t) * uActive;
      darkening = sphereMask * 0.2 * (1.0 - ndotl * 0.6);
    }

    vec3 color = texColor.rgb * (1.0 - darkening);

    vec3 trailRgb = texture2D(uTrail, uv).rgb;
    color += trailRgb;

    gl_FragColor = vec4(min(color, vec3(1.0)), 1.0);
  }
`;

export default function HeroCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const prevMouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const activeRef = useRef(0);
  const activeTargetRef = useRef(0);
  const rafRef = useRef(0);

  const createTextCanvas = useCallback((width, height) => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const glW = Math.round(width * dpr);
    const glH = Math.round(height * dpr);

    const superScale = 3;
    const hiRes = document.createElement('canvas');
    hiRes.width = glW * superScale;
    hiRes.height = glH * superScale;
    const hiCtx = hiRes.getContext('2d');
    hiCtx.scale(dpr * superScale, dpr * superScale);
    hiCtx.clearRect(0, 0, width, height);

    const fontSize = width * 0.36;
    hiCtx.font = `400 ${fontSize}px "Humane", sans-serif`;
    hiCtx.textAlign = 'center';
    hiCtx.textBaseline = 'alphabetic';
    hiCtx.fillStyle = '#ffffff';
    hiCtx.letterSpacing = `${fontSize * 0.015}px`;

    const text = 'X.O. CONTINENTAL';

    const metrics = hiCtx.measureText(text);
    const maxWidth = width * 0.72;
    if (metrics.width > maxWidth) {
      const scaledSize = fontSize * (maxWidth / metrics.width);
      hiCtx.font = `400 ${scaledSize}px "Humane", sans-serif`;
      hiCtx.letterSpacing = `${scaledSize * 0.015}px`;
    }

    hiCtx.fillText(text, width / 2, height * 0.633);

    const final = document.createElement('canvas');
    final.width = glW;
    final.height = glH;
    const fCtx = final.getContext('2d');
    fCtx.imageSmoothingEnabled = true;
    fCtx.imageSmoothingQuality = 'high';
    fCtx.drawImage(hiRes, 0, 0, glW, glH);

    return final;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanupFn;

    function init() {
      if (cancelled || canvasRef.current) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);

      const canvas = document.createElement('canvas');
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      container.appendChild(canvas);
      canvasRef.current = canvas;

      const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
      if (!gl) { console.error('WebGL not available'); return; }

      const trailProg = linkProgram(gl, VERT, TRAIL_FRAG);
      const compProg = linkProgram(gl, VERT, COMP_FRAG);
      if (!trailProg || !compProg) return;

      const positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
      const texCoords = new Float32Array([0,1, 1,1, 0,0, 1,0]);

      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const texBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

      function bindQuad(prog) {
        const posLoc = gl.getAttribLocation(prog, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        const texLoc = gl.getAttribLocation(prog, 'a_texCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
      }

      const textCanvas = createTextCanvas(width, height);
      const textTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);

      const trailW = Math.floor(width * dpr * 0.5);
      const trailH = Math.floor(height * dpr * 0.5);
      let fboA = createFBO(gl, trailW, trailH);
      let fboB = createFBO(gl, trailW, trailH);

      const tLoc = {
        prevTrail: gl.getUniformLocation(trailProg, 'uPrevTrail'),
        mouse:     gl.getUniformLocation(trailProg, 'uMouse'),
        prevMouse: gl.getUniformLocation(trailProg, 'uPrevMouse'),
        pixel:     gl.getUniformLocation(trailProg, 'uPixel'),
        aspect:    gl.getUniformLocation(trailProg, 'uAspect'),
        active:    gl.getUniformLocation(trailProg, 'uActive'),
      };

      const cLoc = {
        texture:   gl.getUniformLocation(compProg, 'uTexture'),
        trail:     gl.getUniformLocation(compProg, 'uTrail'),
        mouse:     gl.getUniformLocation(compProg, 'uMouse'),
        prevMouse: gl.getUniformLocation(compProg, 'uPrevMouse'),
        time:      gl.getUniformLocation(compProg, 'uTime'),
        aspect:    gl.getUniformLocation(compProg, 'uAspect'),
        active:    gl.getUniformLocation(compProg, 'uActive'),
      };

      const startTime = performance.now();

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);

        const lerpFast = 0.12;
        const lerpSlow = 0.08;

        smoothMouseRef.current.x += (targetMouseRef.current.x - smoothMouseRef.current.x) * lerpFast;
        smoothMouseRef.current.y += (targetMouseRef.current.y - smoothMouseRef.current.y) * lerpFast;

        prevMouseRef.current.x = mouseRef.current.x;
        prevMouseRef.current.y = mouseRef.current.y;
        mouseRef.current.x += (smoothMouseRef.current.x - mouseRef.current.x) * lerpSlow;
        mouseRef.current.y += (smoothMouseRef.current.y - mouseRef.current.y) * lerpSlow;

        activeRef.current += (activeTargetRef.current - activeRef.current) * 0.05;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const pmx = prevMouseRef.current.x;
        const pmy = prevMouseRef.current.y;
        const act = activeRef.current;
        const aspect = width / height;

        gl.useProgram(trailProg);
        bindQuad(trailProg);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo);
        gl.viewport(0, 0, trailW, trailH);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
        gl.uniform1i(tLoc.prevTrail, 0);
        gl.uniform2f(tLoc.mouse, mx, my);
        gl.uniform2f(tLoc.prevMouse, pmx, pmy);
        gl.uniform2f(tLoc.pixel, 1.0 / trailW, 1.0 / trailH);
        gl.uniform1f(tLoc.aspect, aspect);
        gl.uniform1f(tLoc.active, act);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        const tmp = fboA;
        fboA = fboB;
        fboB = tmp;

        gl.useProgram(compProg);
        bindQuad(compProg);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textTex);
        gl.uniform1i(cLoc.texture, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
        gl.uniform1i(cLoc.trail, 1);

        gl.uniform2f(cLoc.mouse, mx, my);
        gl.uniform2f(cLoc.prevMouse, pmx, pmy);
        gl.uniform1f(cLoc.time, (performance.now() - startTime) / 1000);
        gl.uniform1f(cLoc.aspect, aspect);
        gl.uniform1f(cLoc.active, act);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      animate();

      const handleResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        const newTextCanvas = createTextCanvas(w, h);
        gl.bindTexture(gl.TEXTURE_2D, textTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newTextCanvas);
      };
      window.addEventListener('resize', handleResize);

      cleanupFn = () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('resize', handleResize);
        if (container.contains(canvas)) container.removeChild(canvas);
        canvasRef.current = null;
      };
    }

    document.fonts.load('400 100px "Humane"').then(() => { if (!cancelled) init(); });
    const fallback = setTimeout(() => { if (!cancelled) init(); }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      cleanupFn?.();
    };
  }, [createTextCanvas]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
    targetMouseRef.current.y = 1 - (e.clientY - rect.top) / rect.height;
    activeTargetRef.current = 1;
  }, []);

  const handleMouseLeave = useCallback(() => {
    activeTargetRef.current = 0;
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-canvas"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}

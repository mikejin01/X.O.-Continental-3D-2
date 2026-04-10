/**
 * Injects the custom hero directly into the iframe's DOM.
 *   V1 = UnicornStudio animated background
 *   V2 = Original Webflow video hero
 *   V3 = WebGL text canvas with mouse-follow distortion & color trails
 *
 * Everything lives in one document so the navbar, scroll, and GSAP
 * animations all work normally.
 */

const BASE = import.meta.env.BASE_URL

/* ═══════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════ */

const HERO_CSS = `
/* ── Font faces ── */
@font-face {
  font-family: 'Coolvetica Rg Cond';
  src: url('${BASE}fonts/CoolveticaRgCond.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Humane';
  src: url('${BASE}fonts/Humane-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* ── Hero overlay container ── */
.xo-hero-overlay {
  position: absolute;
  inset: 10px;
  z-index: 4;
  overflow: hidden;
  background: #000;
  border-radius: 2rem;
  transition: opacity 0.4s ease;
}
.xo-hero-overlay.is-hidden {
  opacity: 0;
  pointer-events: none;
}

/* ── UnicornStudio (V1) ── */
.xo-hero-unicorn {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.xo-hero-unicorn.is-hidden { display: none; }
.xo-hero-unicorn a[href*="unicorn"] {
  display: none !important;
}
.xo-hero-unicorn canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* ── WebGL canvas (V3) ── */
.xo-hero-canvas-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.xo-hero-canvas-wrap.is-hidden { display: none; }
.xo-hero-canvas-wrap canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* ── Gradient overlays (top & bottom fade to black) ── */
.xo-hero-overlay::before,
.xo-hero-overlay::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 30%;
  pointer-events: none;
  z-index: 2;
}
.xo-hero-overlay::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%);
  border-radius: 2rem 2rem 0 0;
}
.xo-hero-overlay::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, transparent 100%);
  border-radius: 0 0 2rem 2rem;
}

/* ── Subtitle ── */
.xo-hero-subtitle-wrap {
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 26.9vh;
  pointer-events: none;
}
.xo-hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 19.2px;
  color: #fff;
  text-align: center;
  line-height: 1.3;
  max-width: 300px;
  margin: 0;
}

/* ── Bottom bar ── */
.xo-hero-bottom {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 0 calc(2rem - 10px);
}
.xo-hero-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: end;
  max-width: 100rem;
  margin: 0 auto;
}
.xo-hero-bottom-left {
  display: flex;
  flex-direction: column;
}
.xo-hero-bottom-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.xo-hero-bottom-right {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

/* ── Services list ── */
.xo-hero-services {
  display: flex;
  flex-direction: column;
}
.xo-hero-service-item {
  font-family: 'Coolvetica Rg Cond', Arial, sans-serif;
  font-size: 19.2px;
  font-weight: 300;
  text-transform: uppercase;
  color: #fff;
  letter-spacing: 0.7px;
  line-height: 1.4;
}

/* ── Scroll indicator ── */
.xo-hero-scroll-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.xo-hero-scroll-arrow {
  width: 16px;
  height: 16px;
  background-image: url('https://cdn.prod.website-files.com/697344b93b0e03014bb98903/6973b6306fd8c2ae6c357490_arrow-down.webp');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.xo-hero-scroll-text {
  font-family: 'Coolvetica Rg Cond', Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #fff;
}

/* ── Badge card ── */
.xo-hero-badge-card {
  display: block;
  width: 205px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.xo-hero-badge-card:hover {
  transform: translateY(-2px);
}
.xo-hero-badge-photo {
  width: 205px;
  height: 130px;
  border-radius: 7px;
  background-image: url('${BASE}images/badge-photo.jpg');
  background-size: cover;
  background-position: center;
}
.xo-hero-badge-text {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 205px;
  height: 42px;
  background: rgba(255,255,255,0.97);
  border-radius: 7px;
  padding: 10px 13px 10px 11px;
  margin-top: 3px;
  position: relative;
  overflow: hidden;
}
.xo-hero-badge-circle {
  position: absolute;
  bottom: 10px;
  left: 12px;
  width: 0;
  height: 0;
  background: rgb(67,83,255);
  border-radius: 100%;
  transition: width 0.45s cubic-bezier(0.4,0,0.2,1),
              height 0.45s cubic-bezier(0.4,0,0.2,1),
              bottom 0.45s cubic-bezier(0.4,0,0.2,1),
              left 0.45s cubic-bezier(0.4,0,0.2,1);
  z-index: 0;
}
.xo-hero-badge-card:hover .xo-hero-badge-circle {
  width: 300px;
  height: 300px;
  bottom: -130px;
  left: -50px;
}
.xo-hero-badge-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
}
.xo-hero-badge-card:hover .xo-hero-badge-icon {
  transform: scale(0.8);
  filter: brightness(0) invert(1);
}
.xo-hero-badge-icon img {
  width: 16px;
  height: 16px;
}
.xo-hero-badge-text-wrap {
  overflow: hidden;
  height: 18px;
  position: relative;
  z-index: 1;
}
.xo-hero-badge-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #000;
  line-height: 18px;
  white-space: nowrap;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), color 0.35s ease;
}
.xo-hero-badge-cta {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  line-height: 18px;
  white-space: nowrap;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
}
.xo-hero-badge-card:hover .xo-hero-badge-label {
  transform: translateY(-100%);
  color: #fff;
}
.xo-hero-badge-card:hover .xo-hero-badge-cta {
  transform: translateY(-100%);
}

/* ── Toggle button ── */
.xo-hero-toggle-wrap {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}
.xo-hero-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease;
  font-family: 'Inter', sans-serif;
}
.xo-hero-toggle:hover {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.25);
}
.xo-hero-toggle-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  transition: background 0.25s ease;
}
.xo-hero-toggle-dot.active {
  background: rgb(67,83,255);
}
.xo-hero-toggle-label {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

/* ── V1/V3 active: hide original Webflow hero content ── */
.section-home-header.xo-v1 .header-content-wrap,
.section-home-header.xo-v1 .background-video-wrap,
.section-home-header.xo-v1 .header-bottom-wrap,
.section-home-header.xo-v1 .gsap-component {
  visibility: hidden !important;
}

/* ── Entrance animation initial states ── */
.xo-hero-subtitle,
.xo-hero-service-item,
.xo-hero-scroll-indicator,
.xo-hero-badge-card {
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 991px) {
  .xo-hero-subtitle { font-size: 16px; }
  .xo-hero-subtitle-wrap { max-width: 260px; }
  .xo-hero-badge-card,
  .xo-hero-badge-photo,
  .xo-hero-badge-text { width: 180px; }
  .xo-hero-badge-photo { height: 115px; }
}
@media (max-width: 767px) {
  .xo-hero-bottom { padding: 0 calc(1.25rem - 10px); bottom: 24px; }
  .xo-hero-services { display: none; }
  .xo-hero-badge-card,
  .xo-hero-badge-photo,
  .xo-hero-badge-text { width: 160px; }
  .xo-hero-badge-photo { height: 100px; }
  .xo-hero-subtitle { font-size: 14px; }
  .xo-hero-subtitle-wrap { max-width: 240px; }
  .xo-hero-toggle-wrap { bottom: 24px; }
}
`

/* ═══════════════════════════════════════════
   OVERLAY HTML
   ═══════════════════════════════════════════ */

const OVERLAY_HTML = `
<div class="xo-hero-unicorn" data-us-project="ls2GMMfphEx75JbBhSXt"></div>
<div class="xo-hero-canvas-wrap is-hidden"></div>
<div class="xo-hero-subtitle-wrap">
  <p class="xo-hero-subtitle">We design and build digital experiences through strategy, branding, and technology.</p>
</div>
<div class="xo-hero-bottom">
  <div class="xo-hero-bottom-grid">
    <div class="xo-hero-bottom-left">
      <div class="xo-hero-services">
        <span class="xo-hero-service-item">Web Design</span>
        <span class="xo-hero-service-item">Social Media</span>
        <span class="xo-hero-service-item">Marketing</span>
        <span class="xo-hero-service-item">Development</span>
        <span class="xo-hero-service-item">SEO Optimization</span>
      </div>
    </div>
    <div class="xo-hero-bottom-center">
      <div class="xo-hero-scroll-indicator">
        <div class="xo-hero-scroll-arrow"></div>
        <span class="xo-hero-scroll-text">Scroll to explore</span>
      </div>
    </div>
    <div class="xo-hero-bottom-right">
      <a href="#work" class="xo-hero-badge-card">
        <div class="xo-hero-badge-photo"></div>
        <div class="xo-hero-badge-text">
          <div class="xo-hero-badge-circle"></div>
          <div class="xo-hero-badge-icon">
            <img src="${BASE}images/lightning.png" alt="" width="16" height="16" />
          </div>
          <div class="xo-hero-badge-text-wrap">
            <p class="xo-hero-badge-label">Explore Our Work</p>
            <p class="xo-hero-badge-cta">View Projects</p>
          </div>
        </div>
      </a>
    </div>
  </div>
</div>
`

/* ═══════════════════════════════════════════
   MAIN INJECTOR
   ═══════════════════════════════════════════ */

export function injectHero(doc, win) {
  const heroSection = doc.querySelector('.section-home-header')
  if (!heroSection) return

  const grid = heroSection.querySelector('.header-component-grid')
  if (!grid) return

  const navbar = doc.querySelector('.navbar')

  // 1. Inject styles
  const style = doc.createElement('style')
  style.textContent = HERO_CSS
  doc.head.appendChild(style)

  // 2. Ensure grid is a positioning context
  grid.style.position = 'relative'

  // 3. Create the overlay (shared by V1 and V3)
  const overlay = doc.createElement('div')
  overlay.className = 'xo-hero-overlay'
  overlay.innerHTML = OVERLAY_HTML
  grid.appendChild(overlay)

  const unicornEl = overlay.querySelector('.xo-hero-unicorn')
  const canvasWrap = overlay.querySelector('.xo-hero-canvas-wrap')

  // 4. Create toggle button (always visible, above both V1/V2/V3)
  const toggleWrap = doc.createElement('div')
  toggleWrap.className = 'xo-hero-toggle-wrap'
  toggleWrap.innerHTML = `
    <button class="xo-hero-toggle" aria-label="Switch hero design">
      <span class="xo-hero-toggle-dot active"></span>
      <span class="xo-hero-toggle-label">V1</span>
    </button>
  `
  grid.appendChild(toggleWrap)

  const toggleBtn = toggleWrap.querySelector('.xo-hero-toggle')
  const toggleDot = toggleWrap.querySelector('.xo-hero-toggle-dot')
  const toggleLabel = toggleWrap.querySelector('.xo-hero-toggle-label')

  // ── State ──
  let variant = 'v1' // 'v1' | 'v2' | 'v3'
  let v3State = null  // lazy-initialised WebGL state
  heroSection.classList.add('xo-v1')

  // Set navbar initial state for entrance animation
  if (navbar) {
    navbar.style.opacity = '0'
    navbar.style.transform = 'translateY(-20px)'
  }

  function setVariant(v) {
    variant = v

    if (v === 'v1') {
      overlay.classList.remove('is-hidden')
      heroSection.classList.add('xo-v1')
      toggleDot.classList.add('active')
      toggleLabel.textContent = 'V1'
      unicornEl.classList.remove('is-hidden')
      canvasWrap.classList.add('is-hidden')
      if (v3State) v3State.stop()
      runOverlayEntrance(win, overlay, navbar)
    } else if (v === 'v2') {
      overlay.classList.add('is-hidden')
      heroSection.classList.remove('xo-v1')
      toggleDot.classList.remove('active')
      toggleLabel.textContent = 'V2'
      if (v3State) v3State.stop()
      if (navbar && win.gsap) {
        win.gsap.set(navbar, { opacity: 1, y: 0 })
      }
    } else if (v === 'v3') {
      overlay.classList.remove('is-hidden')
      heroSection.classList.add('xo-v1')
      toggleDot.classList.add('active')
      toggleLabel.textContent = 'V3'
      unicornEl.classList.add('is-hidden')
      canvasWrap.classList.remove('is-hidden')
      // Lazy-init WebGL after layout reflow
      win.requestAnimationFrame(() => {
        if (!v3State) {
          v3State = initV3Canvas(canvasWrap, overlay, doc, win)
        }
        v3State.start()
        runOverlayEntrance(win, overlay, navbar)
      })
    }
  }

  toggleBtn.addEventListener('click', () => {
    if (variant === 'v1') setVariant('v2')
    else if (variant === 'v2') setVariant('v3')
    else setVariant('v1')
  })

  // 5. Load UnicornStudio SDK
  const script = doc.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.6/dist/unicornStudio.umd.js'
  script.onload = () => {
    if (win.UnicornStudio) {
      win.UnicornStudio.init({ scale: 1, dpi: 1.5 })
    }
    runOverlayEntrance(win, overlay, navbar)
  }
  doc.body.appendChild(script)
}

/* ═══════════════════════════════════════════
   ENTRANCE ANIMATION  (shared by V1 & V3)
   ═══════════════════════════════════════════ */

function runOverlayEntrance(win, overlay, navbar) {
  const gsap = win.gsap
  if (!gsap) return

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // Navbar slides down into view
  if (navbar) {
    tl.fromTo(
      navbar,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      0.3
    )
  }

  // Background layer (unicorn or canvas — whichever is visible)
  const visibleBg =
    overlay.querySelector('.xo-hero-unicorn:not(.is-hidden)') ||
    overlay.querySelector('.xo-hero-canvas-wrap:not(.is-hidden)')
  if (visibleBg) {
    tl.fromTo(
      visibleBg,
      { opacity: 0 },
      { opacity: 1, duration: 1.6, ease: 'power2.inOut', delay: 0.3 },
      0
    )
  }

  tl.fromTo(
    overlay.querySelector('.xo-hero-subtitle'),
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
    1.0
  )

  tl.fromTo(
    overlay.querySelectorAll('.xo-hero-service-item'),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power2.out' },
    1.3
  )

  tl.fromTo(
    overlay.querySelector('.xo-hero-scroll-indicator'),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
    1.4
  )

  tl.fromTo(
    overlay.querySelector('.xo-hero-badge-card'),
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
    1.4
  )
}

/* ═══════════════════════════════════════════
   V3  –  WebGL TEXT CANVAS
   ═══════════════════════════════════════════ */

/* ── Shader helpers ── */

function glCompile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function glLink(gl, vs, fs) {
  const v = glCompile(gl, gl.VERTEX_SHADER, vs)
  const f = glCompile(gl, gl.FRAGMENT_SHADER, fs)
  if (!v || !f) return null
  const p = gl.createProgram()
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(p))
    return null
  }
  return p
}

function glFBO(gl, w, h) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return { tex, fbo }
}

/* ── Shaders ── */

const V3_VERT = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 vUv;
  void main() {
    vUv = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const V3_TRAIL_FRAG = `
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
`

const V3_COMP_FRAG = `
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
`

/* ── Text texture generator ── */

function createV3TextCanvas(doc, win, width, height) {
  const dpr = Math.min(win.devicePixelRatio || 2, 2)
  const glW = Math.round(width * dpr)
  const glH = Math.round(height * dpr)

  const superScale = 3
  const hiRes = doc.createElement('canvas')
  hiRes.width = glW * superScale
  hiRes.height = glH * superScale
  const hiCtx = hiRes.getContext('2d')
  hiCtx.scale(dpr * superScale, dpr * superScale)
  hiCtx.clearRect(0, 0, width, height)

  let fontSize = width * 0.36
  hiCtx.font = `400 ${fontSize}px "Humane", sans-serif`
  hiCtx.textAlign = 'center'
  hiCtx.textBaseline = 'alphabetic'
  hiCtx.fillStyle = '#ffffff'
  hiCtx.letterSpacing = `${fontSize * 0.015}px`

  const text = 'X.O. CONTINENTAL'
  const metrics = hiCtx.measureText(text)
  const maxWidth = width * 0.72
  if (metrics.width > maxWidth) {
    fontSize = fontSize * (maxWidth / metrics.width)
    hiCtx.font = `400 ${fontSize}px "Humane", sans-serif`
    hiCtx.letterSpacing = `${fontSize * 0.015}px`
  }
  hiCtx.fillText(text, width / 2, height * 0.633)

  const final = doc.createElement('canvas')
  final.width = glW
  final.height = glH
  const fCtx = final.getContext('2d')
  fCtx.imageSmoothingEnabled = true
  fCtx.imageSmoothingQuality = 'high'
  fCtx.drawImage(hiRes, 0, 0, glW, glH)
  return final
}

/* ── V3 initialiser ── */

function initV3Canvas(container, overlay, doc, win) {
  const width = container.clientWidth
  const height = container.clientHeight
  const dpr = Math.min(win.devicePixelRatio || 2, 2)

  const canvas = doc.createElement('canvas')
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  container.appendChild(canvas)

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
  if (!gl) { console.error('WebGL not available'); return { start() {}, stop() {} } }

  const trailProg = glLink(gl, V3_VERT, V3_TRAIL_FRAG)
  const compProg = glLink(gl, V3_VERT, V3_COMP_FRAG)
  if (!trailProg || !compProg) return { start() {}, stop() {} }

  // Full-screen quad
  const positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1])
  const texCoords = new Float32Array([0,1, 1,1, 0,0, 1,0])

  const posBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const texBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuf)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

  function bindQuad(prog) {
    const posLoc = gl.getAttribLocation(prog, 'a_position')
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
    const texLoc = gl.getAttribLocation(prog, 'a_texCoord')
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf)
    gl.enableVertexAttribArray(texLoc)
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0)
  }

  // Text texture (created after font loads)
  const textTex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, textTex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  function uploadText(w, h) {
    const tc = createV3TextCanvas(doc, win, w, h)
    gl.bindTexture(gl.TEXTURE_2D, textTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc)
  }

  // Load font then upload text
  if (doc.fonts && doc.fonts.load) {
    doc.fonts.load('400 100px "Humane"').then(() => uploadText(width, height))
  }
  // Fallback: upload immediately (may use fallback font)
  const fallbackTimer = setTimeout(() => uploadText(width, height), 3000)

  // Ping-pong FBOs for trail
  const trailW = Math.floor(width * dpr * 0.5)
  const trailH = Math.floor(height * dpr * 0.5)
  let fboA = glFBO(gl, trailW, trailH)
  let fboB = glFBO(gl, trailW, trailH)

  // Trail program uniforms
  const tLoc = {
    prevTrail: gl.getUniformLocation(trailProg, 'uPrevTrail'),
    mouse:     gl.getUniformLocation(trailProg, 'uMouse'),
    prevMouse: gl.getUniformLocation(trailProg, 'uPrevMouse'),
    pixel:     gl.getUniformLocation(trailProg, 'uPixel'),
    aspect:    gl.getUniformLocation(trailProg, 'uAspect'),
    active:    gl.getUniformLocation(trailProg, 'uActive'),
  }

  // Composite program uniforms
  const cLoc = {
    texture:   gl.getUniformLocation(compProg, 'uTexture'),
    trail:     gl.getUniformLocation(compProg, 'uTrail'),
    mouse:     gl.getUniformLocation(compProg, 'uMouse'),
    prevMouse: gl.getUniformLocation(compProg, 'uPrevMouse'),
    time:      gl.getUniformLocation(compProg, 'uTime'),
    aspect:    gl.getUniformLocation(compProg, 'uAspect'),
    active:    gl.getUniformLocation(compProg, 'uActive'),
  }

  // Mouse state
  const mouse = { x: 0.5, y: 0.5 }
  const prevMouse = { x: 0.5, y: 0.5 }
  const targetMouse = { x: 0.5, y: 0.5 }
  const smoothMouse = { x: 0.5, y: 0.5 }
  let active = 0
  let activeTarget = 0

  overlay.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect()
    if (rect.width === 0) return
    targetMouse.x = (e.clientX - rect.left) / rect.width
    targetMouse.y = 1 - (e.clientY - rect.top) / rect.height
    activeTarget = 1
  })
  overlay.addEventListener('mouseleave', () => { activeTarget = 0 })

  // Animation loop
  let rafId = 0
  let running = false
  const startTime = performance.now()
  let curWidth = width
  let curHeight = height

  function animate() {
    if (!running) { rafId = 0; return }
    rafId = win.requestAnimationFrame(animate)

    const lerpFast = 0.12
    const lerpSlow = 0.08
    smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerpFast
    smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerpFast
    prevMouse.x = mouse.x
    prevMouse.y = mouse.y
    mouse.x += (smoothMouse.x - mouse.x) * lerpSlow
    mouse.y += (smoothMouse.y - mouse.y) * lerpSlow
    active += (activeTarget - active) * 0.05

    const mx = mouse.x, my = mouse.y
    const pmx = prevMouse.x, pmy = prevMouse.y
    const aspect = curWidth / curHeight

    // Pass 1: Update trail buffer
    gl.useProgram(trailProg)
    bindQuad(trailProg)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo)
    gl.viewport(0, 0, trailW, trailH)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, fboA.tex)
    gl.uniform1i(tLoc.prevTrail, 0)
    gl.uniform2f(tLoc.mouse, mx, my)
    gl.uniform2f(tLoc.prevMouse, pmx, pmy)
    gl.uniform2f(tLoc.pixel, 1.0 / trailW, 1.0 / trailH)
    gl.uniform1f(tLoc.aspect, aspect)
    gl.uniform1f(tLoc.active, active)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    const tmp = fboA; fboA = fboB; fboB = tmp

    // Pass 2: Composite to screen
    gl.useProgram(compProg)
    bindQuad(compProg)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textTex)
    gl.uniform1i(cLoc.texture, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, fboA.tex)
    gl.uniform1i(cLoc.trail, 1)
    gl.uniform2f(cLoc.mouse, mx, my)
    gl.uniform2f(cLoc.prevMouse, pmx, pmy)
    gl.uniform1f(cLoc.time, (performance.now() - startTime) / 1000)
    gl.uniform1f(cLoc.aspect, aspect)
    gl.uniform1f(cLoc.active, active)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  // Resize handler
  function handleResize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return
    curWidth = w
    curHeight = h
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    uploadText(w, h)
  }
  win.addEventListener('resize', handleResize)

  return {
    start() {
      running = true
      if (!rafId) animate()
    },
    stop() {
      running = false
      if (rafId) { win.cancelAnimationFrame(rafId); rafId = 0 }
    },
  }
}

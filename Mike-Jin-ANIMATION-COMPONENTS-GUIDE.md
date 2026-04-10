# XO Continental — Animation Component Recipes
> **Portable guide** for reusing all 5 interactive animation effects from the home page in any React / Next.js app.

---

## Dependencies

Install once for your new project:

```bash
npm install gsap
```

> [!NOTE]
> Some effects use **GSAP Club plugins** (`SplitText`, `ScrollTrigger`). If you have a GSAP Club membership, install the full `gsap` package. Otherwise, `ScrollTrigger` is free — `SplitText` requires a Club Green license. A CSS-only fallback is shown where possible.

---

## 1. 🖱️ Mouse-Trail Image Animation

**What it does:** When the mouse moves >100px, a floating image (cycling through a list) appears at the cursor, scales in, then fades out and drifts down.

### How it works
- Track `mousemove` on a container
- Clone a hidden template image and position it at the cursor
- GSAP timeline: `scale(0.5) → scale(1)`, then `opacity: 0 + translateY(8rem)`, then remove

### React Component

```jsx
// components/MouseTrailGallery.jsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './MouseTrailGallery.module.css'

const IMAGES = [
  '/images/service-seo.jpg',
  '/images/service-social.jpg',
  '/images/service-branding.jpg',
  '/images/service-webdev.jpg',
]

export default function MouseTrailGallery({ children }) {
  const containerRef = useRef(null)
  const activeIndexRef = useRef(0)
  const posRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const getNextSrc = () => {
      activeIndexRef.current = (activeIndexRef.current + 1) % IMAGES.length
      return IMAGES[activeIndexRef.current]
    }

    const handleMouseMove = (e) => {
      const dx = Math.abs(posRef.current.x - e.pageX)
      const dy = Math.abs(posRef.current.y - e.pageY)
      if (dx < 100 && dy < 100) return

      posRef.current = { x: e.pageX, y: e.pageY }

      const img = document.createElement('img')
      img.src = getNextSrc()
      img.className = styles.trailImage

      const wrap = document.createElement('div')
      wrap.className = styles.trailWrap
      wrap.appendChild(img)
      el.appendChild(wrap)

      const tl = gsap.timeline({ onComplete: () => wrap.remove() })
      tl.set(wrap, { x: e.pageX, y: e.pageY - window.scrollY })
      tl.fromTo(wrap, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, ease: 'power3.out' })
      tl.to(img, { opacity: 0, y: '8rem', duration: 0.5 })
    }

    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className={styles.container}>
      {children}
    </div>
  )
}
```

```css
/* components/MouseTrailGallery.module.css */
.container {
  position: relative;
  overflow: hidden; /* remove if you want images to escape the container */
}

.trailWrap {
  position: fixed; /* or 'absolute' */
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 999;
  width: 200px;
  height: 260px;
  transform-origin: top left;
}

.trailImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}
```

### Usage
```jsx
<MouseTrailGallery>
  <YourHeroContent />
</MouseTrailGallery>
```

---

## 2. 🎬 3D Hero Section (Full-Screen Video Background)

**What it does:** A full-screen video loops behind the hero text with a dark overlay. Text is centered on top.

### How it works
- CSS `position: absolute` video fills the container
- A semi-transparent overlay `div` sits on top
- Content is positioned with `z-index` above both

### React Component

```jsx
// components/HeroSection.jsx
import styles from './HeroSection.module.css'

export default function HeroSection({ videoSrc, title, subtitle }) {
  return (
    <header className={styles.hero}>
      {/* Background Video */}
      <div className={styles.videoWrap}>
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  )
}
```

```css
/* components/HeroSection.module.css */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.videoWrap {
  position: absolute;
  inset: 0;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5); /* adjust darkness */
}

.content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
}

.title {
  font-size: clamp(3rem, 10vw, 10rem);
  line-height: 1;
  text-transform: uppercase;
}

.subtitle {
  font-size: 1.2rem;
  margin-top: 1.5rem;
  opacity: 0.8;
}
```

### Usage
```jsx
<HeroSection
  videoSrc="/hero-bg.mp4"
  title="X.O. Continental"
  subtitle="Digital Marketing Agency in New York"
/>
```

---

## 3. 📜 Scroll-Triggered Text Animation (SplitText)

**What it does:** Large text (like a paragraph or heading) fades and slides in **word by word** as you scroll it into view.

### How it works
- GSAP `SplitText` splits the text into individual words
- `ScrollTrigger` watches when the element enters the viewport
- `gsap.from()` animates from `opacity:0, y:60` to visible

### React Component (with GSAP Club plugins)

```jsx
// components/ScrollRevealText.jsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText' // requires Club Green license

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function ScrollRevealText({ children, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const split = new SplitText(el, { type: 'words' })

    const ctx = gsap.context(() => {
      gsap.from(split.words, {
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, el)

    return () => {
      ctx.revert()
      split.revert()
    }
  }, [])

  return (
    <p ref={ref} className={className} style={{ overflow: 'hidden' }}>
      {children}
    </p>
  )
}
```

### CSS-Only Fallback (no SplitText license)

```jsx
// components/ScrollRevealText.jsx — no SplitText needed
import { useEffect, useRef, useState } from 'react'
import styles from './ScrollRevealText.module.css'

export default function ScrollRevealText({ text, className }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <p ref={ref} className={`${styles.text} ${className || ''}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className={styles.word}
          style={{
            transitionDelay: `${i * 0.05}s`,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(60px)',
          }}
        >
          {word}{' '}
        </span>
      ))}
    </p>
  )
}
```

```css
/* components/ScrollRevealText.module.css */
.text {
  overflow: hidden;
}

.word {
  display: inline-block;
  transition: opacity 0.8s ease, transform 0.8s ease;
}
```

### Usage
```jsx
<ScrollRevealText text="We design digital experiences that empower brands to stand out." />
```

---

## 4. 🎲 3D Rotating CSS Cube

**What it does:** A CSS 3D cube that rotates continuously, showing images on each face. Placed inside a "Why Us" / hero panel.

### How it works
- Six `div` faces positioned using `translate3d` + `rotateY/X`
- Parent has `transform-style: preserve-3d` + `perspective`
- CSS `animation` or GSAP `gsap.to()` rotates the `_3d-cube-box` element on Y axis

### React Component

```jsx
// components/RotatingCube.jsx
import styles from './RotatingCube.module.css'

export default function RotatingCube({ images }) {
  // images: { front, right, back, left, top, bottom }
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.box}>
          <div className={`${styles.face} ${styles.front}`}>
            <img src={images.front} alt="" />
          </div>
          <div className={`${styles.face} ${styles.right}`}>
            <img src={images.right} alt="" />
          </div>
          <div className={`${styles.face} ${styles.back}`}>
            <img src={images.back} alt="" />
          </div>
          <div className={`${styles.face} ${styles.left}`}>
            <img src={images.left} alt="" />
          </div>
          <div className={`${styles.face} ${styles.top}`}>
            <img src={images.top} alt="" />
          </div>
          <div className={`${styles.face} ${styles.bottom}`}>
            <img src={images.bottom} alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

```css
/* components/RotatingCube.module.css */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
}

.wrapper {
  perspective: 6000px;
  transform-style: preserve-3d;
  width: 25rem;
  height: 25rem;
  position: relative;
  /* Initial tilt — matches XO site exactly */
  transform: scale(0.65) rotateX(-16deg) rotateY(12deg) rotateZ(16deg);
  animation: rotateCube 12s linear infinite;
}

.box {
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
  position: relative;
}

/* Face size = 25rem, offset = half = 12.5rem ≈ 15rem (with gap) */
.face {
  position: absolute;
  width: 25rem;
  height: 25rem;
  perspective: 2000px;
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  align-items: center;
}

.face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
}

.front  { transform: translate3d(0, 0, 15rem); }
.right  { transform: translate(15rem) rotateY(90deg); }
.back   { transform: translate3d(0, 0, -15rem) rotateY(180deg); }
.left   { transform: translate(-15rem) rotateY(-90deg); }
.top    { transform: translate(0, -15rem) rotateX(90deg); }
.bottom { transform: translate(0, 15rem) rotateX(-90deg); }

@keyframes rotateCube {
  from { transform: scale(0.65) rotateX(-16deg) rotateY(0deg) rotateZ(16deg); }
  to   { transform: scale(0.65) rotateX(-16deg) rotateY(360deg) rotateZ(16deg); }
}
```

### Usage
```jsx
<RotatingCube images={{
  front:  '/images/cube-1.png',
  right:  '/images/cube-2.png',
  back:   '/images/cube-3.png',
  left:   '/images/cube-4.png',
  top:    '/images/cube-3.png',
  bottom: '/images/cube-4.png',
}} />
```

---

## 5. 📌 CTA Sticky Scroll Animation

**What it does:** The CTA section is `300vh` tall. As you scroll through it, the inner panel stays **pinned** (sticky) for the full scroll distance, creating a dramatic immersive pause effect before the content below enters.

### How it works
- Outer wrapper: `height: 300vh`
- Inner container: `position: sticky; top: 0; height: 100vh; overflow: hidden`
- Background video fills the sticky container
- GSAP `ScrollTrigger` can optionally scale/fade content as user scrolls through

### React Component

```jsx
// components/StickyCtaSection.jsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './StickyCtaSection.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function StickyCtaSection({ videoSrc, title, buttonLabel, buttonHref }) {
  const containerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Optional: scale up title as user scrolls through
      gsap.fromTo(contentRef.current,
        { scale: 0.8, opacity: 0.5 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className={styles.callToAction}>
      <div className={styles.container}>
        {/* Video background */}
        <div className={styles.videoWrap}>
          <video autoPlay loop muted playsInline className={styles.video}>
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className={styles.overlay} />
        </div>

        {/* Content */}
        <div className={styles.contentWrap}>
          <div ref={contentRef} className={styles.content}>
            <h2 className={styles.title}>{title}</h2>
            <a href={buttonHref} className={styles.button}>{buttonLabel}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
```

```css
/* components/StickyCtaSection.module.css */
.callToAction {
  height: 300vh; /* tall outer wrapper creates scroll room */
}

.container {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  border-bottom-left-radius: 3rem;
  border-bottom-right-radius: 3rem;
}

.videoWrap {
  position: absolute;
  inset: 0;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.contentWrap {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.title {
  font-size: clamp(4rem, 10vw, 10rem);
  color: white;
  text-transform: uppercase;
  text-align: center;
  line-height: 1;
}

.button {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: white;
  color: black;
  border-radius: 100px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.button:hover {
  transform: scale(1.05);
}
```

### Usage
```jsx
<StickyCtaSection
  videoSrc="/hero-bg.mp4"
  title="Let's Build Something Together"
  buttonLabel="Book a Free Call"
  buttonHref="/contact"
/>
```

---

## 📦 Recommended Project Setup

If you want all of these in a clean Next.js app:

```bash
npx create-next-app@latest my-app --app --src-dir --import-alias "@/*"
cd my-app
npm install gsap
```

Project structure:
```
src/
  components/
    MouseTrailGallery.jsx  + .module.css   → Effect #1
    HeroSection.jsx        + .module.css   → Effect #2
    ScrollRevealText.jsx   + .module.css   → Effect #3
    RotatingCube.jsx       + .module.css   → Effect #4
    StickyCtaSection.jsx   + .module.css   → Effect #5
  app/
    page.jsx  ← assemble all components here
```

> [!TIP]
> For Next.js, wrap any component that uses GSAP or browser APIs in `'use client'` at the top since GSAP requires the DOM.

```jsx
// All 5 components need this at the top
'use client'
```

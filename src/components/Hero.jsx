import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Hero.css';
import HeroUnicorn from './HeroUnicorn';
import HeroOriginal from './HeroOriginal';

const services = [
  'Web Design',
  'Social Media',
  'Marketing',
  'Development',
  'SEO Optimization',
];

export default function Hero() {
  const sectionRef = useRef(null);
  const [variant, setVariant] = useState('v1'); // v1 = UnicornStudio, v2 = Original

  useEffect(() => {
    if (variant !== 'v1') return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-canvas',
        { opacity: 0 },
        { opacity: 1, duration: 1.6, ease: 'power2.inOut', delay: 0.3 },
        0
      );

      tl.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
        1.0
      );

      tl.fromTo(
        '.hero-service-item',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power2.out' },
        1.3
      );

      tl.fromTo(
        '.hero-scroll-indicator',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        1.4
      );

      tl.fromTo(
        '.hero-badge-card',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        1.4
      );
    }, section);

    return () => ctx.revert();
  }, [variant]);

  const toggleVariant = () => setVariant((v) => (v === 'v1' ? 'v2' : 'v1'));

  return (
    <section ref={sectionRef} className="hero-section">
      {variant === 'v1' ? (
        <>
          <HeroUnicorn />

          <div className="hero-subtitle-wrap">
            <p className="hero-subtitle">
              We design and build digital experiences through strategy, branding, and
              technology.
            </p>
          </div>

          <div className="hero-bottom">
            <div className="hero-bottom-grid">
              <div className="hero-bottom-left">
                <div className="hero-services">
                  {services.map((s) => (
                    <span key={s} className="hero-service-item">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hero-bottom-center">
                <div className="hero-scroll-indicator">
                  <div className="hero-scroll-arrow" />
                  <span className="hero-scroll-text">Scroll to explore</span>
                </div>

                <button
                  className="hero-bg-toggle"
                  onClick={toggleVariant}
                  aria-label="Switch hero design"
                >
                  <span className="hero-bg-toggle-dot active" />
                  <span className="hero-bg-toggle-label">V1</span>
                </button>
              </div>

              <div className="hero-bottom-right">
                <a href="#work" className="hero-badge-card">
                  <div className="hero-badge-photo" />
                  <div className="hero-badge-text">
                    <div className="hero-badge-circle" />
                    <div className="hero-badge-icon">
                      <img src={`${import.meta.env.BASE_URL}images/lightning.png`} alt="" width="16" height="16" />
                    </div>
                    <div className="hero-badge-text-wrap">
                      <p className="hero-badge-label">Explore Our Work</p>
                      <p className="hero-badge-cta">View Projects</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <HeroOriginal />

          <div className="hero-bottom">
            <div className="hero-bottom-grid">
              <div className="hero-bottom-left" />

              <div className="hero-bottom-center">
                <button
                  className="hero-bg-toggle"
                  onClick={toggleVariant}
                  aria-label="Switch hero design"
                >
                  <span className="hero-bg-toggle-dot" />
                  <span className="hero-bg-toggle-label">V2</span>
                </button>
              </div>

              <div className="hero-bottom-right" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

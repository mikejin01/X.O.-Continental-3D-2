import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './HeroOriginal.css';

const BASE = import.meta.env.BASE_URL;

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/x.o.continental/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 9a3 3 0 100 6 3 3 0 000-6zm0-2a5 5 0 110 10 5 5 0 010-10zm6.5-.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM12 4c-2.474 0-2.878.007-3.884.06-.784.037-1.31.142-1.798.332a3.637 3.637 0 00-1.314.855 3.634 3.634 0 00-.855 1.314c-.19.489-.296 1.014-.332 1.798C3.764 9.369 3.758 9.773 3.758 12s.006 2.631.06 3.641c.036.784.142 1.31.332 1.798.168.434.369.746.702 1.08.337.336.648.537 1.08.703.49.19 1.015.296 1.799.332 1.01.047 1.414.053 3.888.053s2.878-.006 3.888-.053c.784-.036 1.31-.142 1.798-.332a3.64 3.64 0 001.08-.703c.337-.337.537-.648.703-1.08.19-.49.296-1.015.332-1.799.047-1.01.053-1.414.053-3.888s-.006-2.878-.053-3.888c-.036-.784-.142-1.31-.332-1.798a3.637 3.637 0 00-.703-1.08 3.634 3.634 0 00-1.08-.702c-.49-.19-1.015-.296-1.799-.332C14.878 4.006 14.474 4 12 4zm0-2c2.717 0 3.056.01 4.123.06 1.064.049 1.79.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.637.416 1.363.465 2.427.05 1.067.06 1.406.06 4.123s-.01 3.056-.06 4.123c-.049 1.064-.218 1.79-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.637.247-1.363.416-2.427.465-1.067.05-1.406.06-4.123.06s-3.056-.01-4.123-.06c-1.064-.049-1.79-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153A4.902 4.902 0 012.525 18.55c-.247-.637-.416-1.363-.465-2.427C2.01 15.056 2 14.717 2 12s.01-3.056.06-4.123c.049-1.064.218-1.79.465-2.427A4.902 4.902 0 013.678 3.678 4.902 4.902 0 015.45 2.525c.637-.247 1.363-.416 2.427-.465C8.944 2.01 9.283 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/xo-continental/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.94 5a1.94 1.94 0 11-3.88 0 1.94 1.94 0 013.88 0zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/people/XO-Continental-Marketing/61577776691224/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
      </svg>
    ),
  },
  {
    label: 'Phone',
    href: 'tel:+17187015918',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.75 21 3 13.25 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.75-.25 1.02l-2.2 2.2z" />
      </svg>
    ),
  },
];

const MARQUEE_SERVICES = [
  'Brand Strategy',
  'Visual Identity',
  'Website Design',
  'Brand Consulting',
];

export default function HeroOriginal() {
  const sectionRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-og-logo',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2 },
        0.3
      );

      tl.fromTo(
        '.hero-og-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.4 },
        0.5
      );

      tl.fromTo(
        '.hero-og-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        1.0
      );

      tl.fromTo(
        '.hero-og-social-link',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
        1.2
      );

      tl.fromTo(
        '.hero-og-marquee-component',
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        1.4
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Vertical marquee animation
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const items = el.querySelectorAll('.hero-og-marquee-text');
    if (items.length === 0) return;

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % items.length;
      const offset = current * -1.5;
      gsap.to(el, { y: `${offset}rem`, duration: 0.5, ease: 'power2.inOut' });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={sectionRef} className="hero-og">
      {/* Background video */}
      <div className="hero-og-video-wrap">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-og-video"
        >
          <source src={`${BASE}site/videos/14471915_3840_2160_30fps-1-transcode.mp4`} type="video/mp4" />
          <source src={`${BASE}site/videos/14471915_3840_2160_30fps-1-transcode.webm`} type="video/webm" />
        </video>
        <div className="hero-og-overlay" />
      </div>

      {/* Center content */}
      <div className="hero-og-content">
        <div className="hero-og-logo">
          <img
            src={`${BASE}site/images/xo-logo.png`}
            alt="X.O. Continental Logo"
          />
        </div>
        <h1 className="hero-og-title">X.O. Continental</h1>
        <p className="hero-og-description">
          Digital Marketing Agency in New York Driving Measurable Growth
        </p>
      </div>

      {/* Bottom bar */}
      <div className="hero-og-bottom">
        <div className="hero-og-bottom-inner">
          <div className="hero-og-socials">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} Link`}
                className="hero-og-social-link"
              >
                <span className="hero-og-social-icon">{link.icon}</span>
              </a>
            ))}
          </div>

          <div className="hero-og-marquee-component">
            <div className="hero-og-marquee" ref={marqueeRef}>
              {MARQUEE_SERVICES.map((service) => (
                <div key={service} className="hero-og-marquee-text">
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

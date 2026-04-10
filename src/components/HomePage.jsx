import { useEffect, useRef, useState } from 'react'
import { injectHero } from './heroInjector'

const BASE = import.meta.env.BASE_URL

function replaceBrandText(value) {
  return value
    .replace(/\bUnusually\b/g, 'X.O. Continental')
    .replace(/\(2010-26©\)/g, '2025-2026©')
}

function replaceBrandInDocument(doc) {
  if (!doc) return

  doc.title = replaceBrandText(doc.title)

  doc.querySelectorAll('[content]').forEach((element) => {
    const current = element.getAttribute('content')
    if (current) element.setAttribute('content', replaceBrandText(current))
  })

  doc.querySelectorAll('[alt], [title], [aria-label], [placeholder]').forEach((element) => {
    ;['alt', 'title', 'aria-label', 'placeholder'].forEach((attributeName) => {
      const current = element.getAttribute(attributeName)
      if (current) element.setAttribute(attributeName, replaceBrandText(current))
    })
  })

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    if (node.nodeValue && node.nodeValue.includes('Unusually')) {
      node.nodeValue = replaceBrandText(node.nodeValue)
    }
    node = walker.nextNode()
  }

  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')
    if (src && src.startsWith('/client%20logos/')) {
      img.setAttribute('src', `${BASE}${src.slice(1)}`)
    }
  })


  const SOCIAL_LINKS = {
    'Instagram Link': 'https://www.instagram.com/x.o.continental/',
    'Linkedin Link': 'https://www.linkedin.com/company/xo-continental/',
    'Facebook Link': 'https://www.facebook.com/people/XO-Continental-Marketing/61577776691224/',
    'Phone Link': 'tel:+17187015918'
  }

  doc.querySelectorAll('a[aria-label]').forEach((link) => {
    let label = link.getAttribute('aria-label')

    if (label === 'Behance Link') {
      link.setAttribute('aria-label', 'Facebook Link')
      label = 'Facebook Link'
      link.querySelectorAll('.social-icon.w-embed').forEach((svg) => {
        svg.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>'
      })
    } else if (label === 'Dribbble Link' || label === 'Website Link') {
      link.setAttribute('aria-label', 'Phone Link')
      label = 'Phone Link'
      link.querySelectorAll('.social-icon.w-embed').forEach((svg) => {
        svg.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" fill="currentColor"><path d="M6.62,10.79c1.44,2.83,3.76,5.14,6.59,6.59l2.2-2.2c0.27-0.27,0.67-0.36,1.02-0.24c1.12,0.37,2.33,0.57,3.57,0.57c0.55,0,1,0.45,1,1V20c0,0.55-0.45,1-1,1C10.75,21,3,13.25,3,4c0-0.55,0.45-1,1-1h3.5c0.55,0,1,0.45,1,1c0,1.24,0.2,2.45,0.57,3.57c0.11,0.35,0.03,0.75-0.25,1.02L6.62,10.79z"></path></svg>'
      })
    }

    if (SOCIAL_LINKS[label]) {
      link.setAttribute('href', SOCIAL_LINKS[label])
    }
  })

  // Hide Shared Success and SEO sections
  const hideSelectors = ['.section-home-testimonial', '.section-home-pricing']
  hideSelectors.forEach((sel) => {
    const section = doc.querySelector(sel)
    if (section) section.style.display = 'none'
  })

  // Update footer copyright year
  const footerContentBlock = doc.querySelector('.footer-bottom .footer-content-block')
  if (footerContentBlock) {
    const copyrightText = footerContentBlock.querySelector('.footer-text')
    if (copyrightText && copyrightText.textContent.includes('©')) {
      copyrightText.textContent = '© 2026 X.O. Continental'
    }
  }
}

export default function HomePage() {
  const frameRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const handleLoad = () => {
      const doc = frame.contentDocument
      if (!doc) return

      replaceBrandInDocument(doc)
      injectHero(doc, frame.contentWindow, () => setReady(true))
    }

    frame.addEventListener('load', handleLoad)
    return () => frame.removeEventListener('load', handleLoad)
  }, [])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#000',
          transition: 'opacity 0.5s ease',
          opacity: ready ? 0 : 1,
          pointerEvents: ready ? 'none' : 'all',
        }}
      />
      <iframe
        ref={frameRef}
        title="Home"
        src={`${BASE}site/index.html`}
        className="webflow-frame"
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </>
  )
}

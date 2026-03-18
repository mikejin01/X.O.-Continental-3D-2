import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const BRAND_NAME = 'X.O. Continental'
const BRAND_PATTERN = /\bUnusually\b/g
const COPYRIGHT_PATTERN = /\(2010-26©\)/g

function replaceBrandText(value) {
  return value.replace(BRAND_PATTERN, BRAND_NAME).replace(COPYRIGHT_PATTERN, '2024-2026©')
}

function replaceBrandInDocument(doc) {
  if (!doc) {
    return
  }

  doc.title = replaceBrandText(doc.title)

  doc.querySelectorAll('[content]').forEach((element) => {
    const current = element.getAttribute('content')
    if (current) {
      element.setAttribute('content', replaceBrandText(current))
    }
  })

  doc.querySelectorAll('[alt], [title], [aria-label], [placeholder]').forEach((element) => {
    ;['alt', 'title', 'aria-label', 'placeholder'].forEach((attributeName) => {
      const current = element.getAttribute(attributeName)
      if (current) {
        element.setAttribute(attributeName, replaceBrandText(current))
      }
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

  // Fix client logo paths
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')
    if (src && src.startsWith('/client%20logos/')) {
      const fixedSrc = `${import.meta.env.BASE_URL}${src.slice(1)}`
      img.setAttribute('src', fixedSrc)
    }
  })

  // Replace social icons
  // Behance -> Facebook
  doc.querySelectorAll('a[aria-label="Behance Link"]').forEach((link) => {
    link.setAttribute('aria-label', 'Facebook Link')
    link.setAttribute('href', 'https://www.facebook.com/')
    const svgContent = link.querySelector('.social-icon.w-embed')
    if (svgContent) {
      svgContent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>'
    }
  })

  // Dribbble -> Phone
  doc.querySelectorAll('a[aria-label="Dribbble Link"]').forEach((link) => {
    link.setAttribute('aria-label', 'Phone Link')
    link.setAttribute('href', '#')
    const svgContent = link.querySelector('.social-icon.w-embed')
    if (svgContent) {
      svgContent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" fill="currentColor"><path d="M6.62,10.79c1.44,2.83,3.76,5.14,6.59,6.59l2.2-2.2c0.27-0.27,0.67-0.36,1.02-0.24c1.12,0.37,2.33,0.57,3.57,0.57c0.55,0,1,0.45,1,1V20c0,0.55-0.45,1-1,1C10.75,21,3,13.25,3,4c0-0.55,0.45-1,1-1h3.5c0.55,0,1,0.45,1,1c0,1.24,0.2,2.45,0.57,3.57c0.11,0.35,0.03,0.75-0.25,1.02L6.62,10.79z"></path></svg>'
    }
  })
}

function WebflowPage({ src }) {
  const frameRef = useRef(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) {
      return
    }

    const updateBranding = () => replaceBrandInDocument(frame.contentDocument)

    frame.addEventListener('load', updateBranding)
    updateBranding()

    return () => {
      frame.removeEventListener('load', updateBranding)
    }
  }, [src])

  return (
    <iframe
      ref={frameRef}
      title={src}
      src={`${import.meta.env.BASE_URL}${src.startsWith('/') ? src.slice(1) : src}`}
      className="webflow-frame"
      loading="eager"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WebflowPage src="/site/index.html" />} />
      <Route path="/about" element={<WebflowPage src="/site/about.html" />} />
      <Route path="/contact" element={<WebflowPage src="/site/contact.html" />} />
      <Route path="/services" element={<WebflowPage src="/site/services.html" />} />
      <Route path="/projects" element={<WebflowPage src="/site/projects.html" />} />
      <Route path="/blog" element={<WebflowPage src="/site/blog.html" />} />
      <Route
        path="/detail_blog-post"
        element={<WebflowPage src="/site/detail_blog-post.html" />}
      />
      <Route
        path="/detail_project"
        element={<WebflowPage src="/site/detail_project.html" />}
      />
      <Route
        path="/coming-soon"
        element={<WebflowPage src="/site/coming-soon.html" />}
      />
      <Route path="/401" element={<WebflowPage src="/site/401.html" />} />
      <Route path="/404" element={<WebflowPage src="/site/404.html" />} />
      <Route
        path="/template-info/style-guide"
        element={<WebflowPage src="/site/template-info/style-guide.html" />}
      />
      <Route
        path="/template-info/licenses"
        element={<WebflowPage src="/site/template-info/licenses.html" />}
      />
      <Route
        path="/template-info/changelog"
        element={<WebflowPage src="/site/template-info/changelog.html" />}
      />
      <Route
        path="/template-info/instructions"
        element={<WebflowPage src="/site/template-info/instructions.html" />}
      />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

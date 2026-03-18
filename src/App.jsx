import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const BRAND_NAME = 'X.O. Continental'
const BRAND_PATTERN = /\bUnusually\b/g

function replaceBrandText(value) {
  return value.replace(BRAND_PATTERN, BRAND_NAME)
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

  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')
    if (src && src.startsWith('/client%20logos/')) {
      const fixedSrc = `${import.meta.env.BASE_URL}${src.slice(1)}`
      img.setAttribute('src', fixedSrc)
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

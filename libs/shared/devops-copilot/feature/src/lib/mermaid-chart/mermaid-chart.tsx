import mermaid from 'mermaid'
import { useEffect, useRef } from 'react'

export const MermaidChart = ({ code }: { code: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const id = 'mermaid-' + Math.random().toString(36).slice(2)
    try {
      mermaid
        .render(id, code)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg
          }
        })
        .catch(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = '<pre>' + code + '</pre>'
          }
        })
    } catch (e) {
      if (containerRef.current) {
        containerRef.current.innerHTML = '<pre>' + code + '</pre>'
      }
    }
  }, [code])

  return <div className="mermaid" ref={containerRef} />
}

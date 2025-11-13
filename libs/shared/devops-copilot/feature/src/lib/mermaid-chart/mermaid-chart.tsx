import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'

const isLikelyCompleteDiagram = (code: string): boolean => {
  const trimmed = code.trim()
  if (!trimmed) return false

  const validStarts = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'gantt',
    'pie',
    'gitGraph',
  ]
  const hasValidStart = validStarts.some((start) => trimmed.startsWith(start))
  if (!hasValidStart) return false

  if (trimmed.startsWith('graph') || trimmed.startsWith('flowchart')) {
    const hasCompleteNode = /[A-Z]\[.+?\]/.test(trimmed)
    if (!hasCompleteNode) return false
  }

  return true
}

export const MermaidChart = ({ code }: { code: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lastRenderedCode, setLastRenderedCode] = useState<string>('')

  useEffect(() => {
    if (!containerRef.current) return

    const trimmedCode = code.trim()

    if (trimmedCode === lastRenderedCode) return

    if (!isLikelyCompleteDiagram(trimmedCode)) {
      return
    }

    const id = 'mermaid-' + Math.random().toString(36).slice(2)
    try {
      mermaid
        .render(id, trimmedCode)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg
            setLastRenderedCode(trimmedCode)
          }
        })
        .catch(() => {
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
            setLastRenderedCode(trimmedCode)
          }
        })
    } catch (e) {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        setLastRenderedCode(trimmedCode)
      }
    }
  }, [code, lastRenderedCode])

  return <div className="mermaid" ref={containerRef} />
}

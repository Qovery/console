import { useMemo } from 'react'
import { RenderMarkdown } from '../../devops-render-markdown/devops-render-markdown'
import { MermaidChart } from '../../mermaid-chart/mermaid-chart'

const StreamingMermaidChart = ({ code, index }: { code: string; index: number }) => {
  const memoizedCode = useMemo(() => code, [code])
  return <MermaidChart key={`mermaid-${index}`} code={memoizedCode} />
}

export const renderStreamingMessageWithMermaid = (input: string) => {
  const parts = []
  let lastIndex = 0
  const regex = /```mermaid([\s\S]*?)```/g
  let match
  let mermaidIndex = 0

  while ((match = regex.exec(input)) !== null) {
    const start = match.index
    const end = regex.lastIndex
    const mermaidCode = match[1].trim()

    if (start > lastIndex) {
      const textPart = input.slice(lastIndex, start)
      if (textPart) {
        parts.push(<RenderMarkdown key={'md-' + lastIndex}>{textPart}</RenderMarkdown>)
      }
    }
    parts.push(
      <StreamingMermaidChart key={`streaming-mermaid-${mermaidIndex}`} code={mermaidCode} index={mermaidIndex} />
    )
    mermaidIndex++
    lastIndex = end
  }

  if (lastIndex < input.length) {
    const textPart = input.slice(lastIndex)
    if (textPart) {
      parts.push(<RenderMarkdown key={'md-' + lastIndex}>{textPart}</RenderMarkdown>)
    }
  }
  return parts
}

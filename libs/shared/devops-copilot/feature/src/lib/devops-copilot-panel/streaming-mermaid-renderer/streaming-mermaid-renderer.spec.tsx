import { render, screen } from '@qovery/shared/util-tests'
import { renderStreamingMessageWithMermaid } from './streaming-mermaid-renderer'

jest.mock('../../devops-render-markdown/devops-render-markdown', () => ({
  RenderMarkdown: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}))

jest.mock('../../mermaid-chart/mermaid-chart', () => ({
  MermaidChart: ({ code }: { code: string }) => <div data-testid="mermaid-chart">{code}</div>,
}))

describe('renderStreamingMessageWithMermaid', () => {
  it('should render plain text without mermaid blocks', () => {
    const input = 'This is plain text'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    expect(screen.getByTestId('markdown')).toHaveTextContent('This is plain text')
    expect(screen.queryByTestId('mermaid-chart')).not.toBeInTheDocument()
  })

  it('should render single mermaid block', () => {
    const input = '```mermaid\ngraph TD\nA --> B\n```'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    expect(screen.getByTestId('mermaid-chart')).toBeInTheDocument()
  })

  it('should render text before mermaid block', () => {
    const input = 'Here is a chart:\n```mermaid\ngraph TD\nA --> B\n```'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    expect(screen.getByTestId('markdown')).toHaveTextContent('Here is a chart:')
    expect(screen.getByTestId('mermaid-chart')).toBeInTheDocument()
  })

  it('should render text after mermaid block', () => {
    const input = '```mermaid\ngraph TD\nA --> B\n```\nThis is after the chart'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    expect(screen.getByTestId('mermaid-chart')).toBeInTheDocument()
    expect(screen.getByTestId('markdown')).toHaveTextContent('This is after the chart')
  })

  it('should render multiple mermaid blocks', () => {
    const input = '```mermaid\ngraph TD\nA --> B\n```\nSome text\n```mermaid\nflowchart LR\nX --> Y\n```'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    const mermaidCharts = screen.getAllByTestId('mermaid-chart')
    expect(mermaidCharts).toHaveLength(2)
  })

  it('should render text between multiple mermaid blocks', () => {
    const input = 'First text\n```mermaid\nA\n```\nMiddle text\n```mermaid\nB\n```\nLast text'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    const markdownBlocks = screen.getAllByTestId('markdown')
    expect(markdownBlocks).toHaveLength(3)
    expect(markdownBlocks[0]).toHaveTextContent('First text')
    expect(markdownBlocks[1]).toHaveTextContent('Middle text')
    expect(markdownBlocks[2]).toHaveTextContent('Last text')
  })

  it('should trim whitespace from mermaid code', () => {
    const input = '```mermaid\n\n  graph TD\n  A --> B\n  \n```'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    expect(screen.getByTestId('mermaid-chart')).toBeInTheDocument()
  })

  it('should handle empty mermaid block', () => {
    const input = '```mermaid\n```'
    const result = renderStreamingMessageWithMermaid(input)

    render(<div>{result}</div>)

    expect(screen.getByTestId('mermaid-chart')).toBeInTheDocument()
  })

  it('should handle empty input', () => {
    const input = ''
    const result = renderStreamingMessageWithMermaid(input)

    expect(result).toEqual([])
  })

  it('should return correct number of elements', () => {
    const input = 'Text 1\n```mermaid\nA\n```\nText 2\n```mermaid\nB\n```\nText 3'
    const result = renderStreamingMessageWithMermaid(input)

    expect(result).toHaveLength(5)
  })

  it('should generate unique keys for mermaid charts', () => {
    const input = '```mermaid\nA\n```\n```mermaid\nB\n```'
    const result = renderStreamingMessageWithMermaid(input)

    // Just check that we have unique keys
    expect(result[0].key).toBeDefined()
    expect(result[1].key).toBeDefined()
    expect(result[0].key).not.toEqual(result[1].key)
  })
})

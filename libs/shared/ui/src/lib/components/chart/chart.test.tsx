import { ComposedChart, Line } from 'recharts'
import { render, screen } from '@qovery/shared/util-tests'
import { Chart } from './chart'

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock ResponsiveContainer
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container" style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  ),
}))

const sampleData = [
  { timestamp: 1704067200000, time: '00:00', cpu: 25, memory: 68 },
  { timestamp: 1704070800000, time: '01:00', cpu: 45, memory: 72 },
  { timestamp: 1704074400000, time: '02:00', cpu: 78, memory: 65 },
]

describe('Chart.Container', () => {
  describe('with data', () => {
    it('renders chart content when data is provided', () => {
      render(
        <Chart.Container className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      expect(screen.queryByText('Fetching data...')).not.toBeInTheDocument()
      expect(screen.queryByText('No data available')).not.toBeInTheDocument()
    })

    it('applies correct container classes', () => {
      const { container } = render(
        <Chart.Container className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      const chartContainer = container.firstChild as HTMLElement
      expect(chartContainer).toHaveClass('relative', 'flex', 'h-[300px]', 'justify-center', 'text-xs', 'w-full')
    })
  })

  describe('with no data', () => {
    it('shows no data message when isEmpty is true', () => {
      render(
        <Chart.Container isEmpty className="h-[300px] w-full">
          <ComposedChart data={[]}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.queryByText('Fetching data...')).not.toBeInTheDocument()
    })

    it('renders chart skeleton when isEmpty is true', () => {
      const { container } = render(
        <Chart.Container isEmpty className="h-[300px] w-full">
          <ComposedChart data={[]}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      const overlay = container.querySelector('[class*="absolute"][class*="inset-0"]')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass('visible', 'opacity-100')
    })

    it('has correct pointer events when isEmpty', () => {
      const { container } = render(
        <Chart.Container isEmpty className="h-[300px] w-full">
          <ComposedChart data={[]}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      const overlay = container.querySelector('[class*="absolute"][class*="inset-0"]')
      expect(overlay).toHaveStyle({ pointerEvents: 'none' })
    })
  })

  describe('with loading state', () => {
    it('shows loading message when isLoading is true', () => {
      render(
        <Chart.Container isLoading className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      expect(screen.getByText('Fetching data...')).toBeInTheDocument()
      expect(screen.queryByText('No data available')).not.toBeInTheDocument()
    })

    it('renders chart skeleton when isLoading is true', () => {
      const { container } = render(
        <Chart.Container isLoading className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      const overlay = container.querySelector('[class*="absolute"][class*="inset-0"]')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass('visible', 'opacity-100')
    })

    it('has correct pointer events when isLoading', () => {
      const { container } = render(
        <Chart.Container isLoading className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      const overlay = container.querySelector('[class*="absolute"][class*="inset-0"]')
      expect(overlay).toHaveStyle({ pointerEvents: 'auto' })
    })

    it('shows loader component when isLoading is true', () => {
      render(
        <Chart.Container isLoading className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      expect(screen.getByText('Fetching data...')).toBeInTheDocument()
    })
  })

  describe('priority of states', () => {
    it('shows loading state when both isLoading and isEmpty are true', () => {
      render(
        <Chart.Container isLoading isEmpty className="h-[300px] w-full">
          <ComposedChart data={[]}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      expect(screen.getByText('Fetching data...')).toBeInTheDocument()
      expect(screen.queryByText('No data available')).not.toBeInTheDocument()
    })
  })

  describe('default props', () => {
    it('renders without overlay when no state props are provided', () => {
      const { container } = render(
        <Chart.Container className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      const overlay = container.querySelector('[class*="absolute"][class*="inset-0"]')
      expect(overlay).not.toBeInTheDocument()
      expect(screen.queryByText('Fetching data...')).not.toBeInTheDocument()
      expect(screen.queryByText('No data available')).not.toBeInTheDocument()
    })
  })
})

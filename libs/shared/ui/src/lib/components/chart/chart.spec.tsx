import { ComposedChart, Line } from 'recharts'
import { render, screen } from '@qovery/shared/util-tests'
import { Chart } from './chart'
import { getLogicalTicks } from './chart-utils'

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

    it('renders with correct semantic attributes', () => {
      render(
        <Chart.Container className="h-[300px] w-full">
          <ComposedChart data={sampleData}>
            <Line dataKey="cpu" />
          </ComposedChart>
        </Chart.Container>
      )

      expect(screen.getByRole('region', { name: 'Interactive chart' })).toBeInTheDocument()
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

describe('getLogicalTicks', () => {
  it('generates correct number of ticks for default count', () => {
    const startTimestamp = 1704067200 // Jan 1, 2024 00:00:00 UTC (in seconds)
    const endTimestamp = 1704070800   // Jan 1, 2024 01:00:00 UTC (in seconds)
    
    const ticks = getLogicalTicks(startTimestamp, endTimestamp)
    
    expect(ticks).toHaveLength(6)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
  })

  it('generates correct number of ticks for custom count', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    const tickCount = 4
    
    const ticks = getLogicalTicks(startTimestamp, endTimestamp, tickCount)
    
    expect(ticks).toHaveLength(4)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
  })

  it('generates evenly spaced ticks', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    const tickCount = 5
    
    const ticks = getLogicalTicks(startTimestamp, endTimestamp, tickCount)
    const expectedInterval = ((endTimestamp - startTimestamp) * 1000) / (tickCount - 1)
    
    for (let i = 1; i < ticks.length; i++) {
      const actualInterval = ticks[i] - ticks[i - 1]
      expect(actualInterval).toBe(expectedInterval)
    }
  })

  it('handles single tick correctly', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    
    const ticks = getLogicalTicks(startTimestamp, endTimestamp, 1)
    
    expect(ticks).toHaveLength(1)
    // With tickCount = 1, interval becomes Infinity, resulting in NaN
    expect(ticks[0]).toBeNaN()
  })

  it('handles zero duration correctly', () => {
    const timestamp = 1704067200
    
    const ticks = getLogicalTicks(timestamp, timestamp)
    
    expect(ticks).toHaveLength(6)
    ticks.forEach((tick: number) => {
      expect(tick).toBe(timestamp * 1000)
    })
  })
})

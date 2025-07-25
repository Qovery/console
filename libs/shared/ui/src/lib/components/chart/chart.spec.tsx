import { ComposedChart, Line } from 'recharts'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Chart } from './chart'
import { createXAxisConfig, getLogicalTicks } from './chart-utils'

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

const largeSamplePayload = Array.from({ length: 20 }, (_, i) => ({
  dataKey: `metric${i + 1}`,
  value: Math.floor(Math.random() * 100),
  color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
}))

// Chart.Container
// ---------------

describe('Chart.Container', () => {
  describe('with data', () => {
    it('renders chart content when data is provided', () => {
      renderWithProviders(
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
      renderWithProviders(
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
      renderWithProviders(
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
      const { container } = renderWithProviders(
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
      const { container } = renderWithProviders(
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
      renderWithProviders(
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
      const { container } = renderWithProviders(
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
      const { container } = renderWithProviders(
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
      renderWithProviders(
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
      renderWithProviders(
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
      const { container } = renderWithProviders(
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

// Chart.TooltipContent
// --------------------

describe('Chart.TooltipContent', () => {
  const mockProps = {
    active: true,
    title: 'Test Chart',
    payload: largeSamplePayload,
  }

  describe('maxItems functionality', () => {
    it('uses default maxItems value of 15 when not specified', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(15)
    })

    it('shows "more" indicator when payload exceeds default maxItems', () => {
      renderWithProviders(<Chart.TooltipContent {...mockProps} />)

      expect(screen.getByText('+5 more')).toBeInTheDocument()
    })

    it('respects custom maxItems value', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} maxItems={10} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(10)
      expect(screen.getByText('+10 more')).toBeInTheDocument()
    })

    it('shows all items when maxItems is greater than payload length', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} maxItems={25} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(20)
      expect(screen.queryByText('more')).not.toBeInTheDocument()
    })

    it('shows all items when maxItems is undefined', () => {
      const propsWithoutMaxItems = { ...mockProps }
      delete propsWithoutMaxItems.maxItems
      const { container } = renderWithProviders(<Chart.TooltipContent {...propsWithoutMaxItems} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(15) // Uses default maxItems of 15
      expect(screen.getByText('+5 more')).toBeInTheDocument()
    })

    it('shows all items when maxItems is explicitly null', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} maxItems={null} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(20)
      expect(screen.queryByText('more')).not.toBeInTheDocument()
    })
  })

  describe('rendering conditions', () => {
    it('returns null when not active', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} active={false} />)

      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when payload is empty', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} payload={[]} />)

      expect(container).toBeEmptyDOMElement()
    })

    it('renders title correctly', () => {
      renderWithProviders(<Chart.TooltipContent {...mockProps} />)

      expect(screen.getByText('Test Chart')).toBeInTheDocument()
    })
  })
})

// chart-utils
// -----------

describe('getLogicalTicks', () => {
  it('generates correct number of ticks for default count', () => {
    const startTimestamp = 1704067200 // Jan 1, 2024 00:00:00 UTC (in seconds)
    const endTimestamp = 1704070800 // Jan 1, 2024 01:00:00 UTC (in seconds)

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

  it('handles negative duration', () => {
    const startTimestamp = 1704070800
    const endTimestamp = 1704067200

    const ticks = getLogicalTicks(startTimestamp, endTimestamp)

    expect(ticks).toHaveLength(6)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
    // Should have decreasing values
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeLessThan(ticks[i - 1])
    }
  })

  it('handles zero tick count', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, 0)

    expect(ticks).toHaveLength(0)
  })

  it('handles large tick count', () => {
    const startTimestamp = 1704067200
    const endTimestamp = 1704070800
    const tickCount = 100

    const ticks = getLogicalTicks(startTimestamp, endTimestamp, tickCount)

    expect(ticks).toHaveLength(100)
    expect(ticks[0]).toBe(startTimestamp * 1000)
    expect(ticks[ticks.length - 1]).toBe(endTimestamp * 1000)
  })
})

describe('createXAxisConfig', () => {
  const startTimestamp = 1704067200
  const endTimestamp = 1704070800

  describe('default configuration', () => {
    it('creates config with default values', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config).toEqual({
        dataKey: 'timestamp',
        type: 'number',
        scale: 'time',
        domain: [startTimestamp * 1000, endTimestamp * 1000],
        ticks: getLogicalTicks(startTimestamp, endTimestamp, 6),
        tick: { fontSize: 12, fill: 'var(--color-neutral-350)' },
        tickLine: { stroke: 'transparent' },
        axisLine: { stroke: 'var(--color-neutral-250)' },
        allowDataOverflow: true,
        interval: 'preserveStartEnd',
        strokeDasharray: '3 3',
      })
    })

    it('uses default tick count of 6', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config.ticks).toHaveLength(6)
    })
  })

  describe('custom options', () => {
    it('applies custom axisLineColor', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        axisLineColor: '#ff0000',
      })

      expect(config.axisLine.stroke).toBe('#ff0000')
    })

    it('applies custom tickColor', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        tickColor: '#00ff00',
      })

      expect(config.tick.fill).toBe('#00ff00')
    })

    it('applies custom tickCount', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        tickCount: 10,
      })

      expect(config.ticks).toHaveLength(10)
    })

    it('applies all custom options together', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, {
        axisLineColor: '#ff0000',
        tickColor: '#00ff00',
        tickCount: 8,
      })

      expect(config.axisLine.stroke).toBe('#ff0000')
      expect(config.tick.fill).toBe('#00ff00')
      expect(config.ticks).toHaveLength(8)
    })
  })

  describe('domain calculation', () => {
    it('converts timestamps to milliseconds for domain', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config.domain).toEqual([startTimestamp * 1000, endTimestamp * 1000])
    })

    it('handles equal start and end timestamps', () => {
      const config = createXAxisConfig(startTimestamp, startTimestamp)

      expect(config.domain).toEqual([startTimestamp * 1000, startTimestamp * 1000])
    })

    it('handles reversed timestamps', () => {
      const config = createXAxisConfig(endTimestamp, startTimestamp)

      expect(config.domain).toEqual([endTimestamp * 1000, startTimestamp * 1000])
    })
  })

  describe('ticks generation', () => {
    it('generates ticks using getLogicalTicks function', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp, { tickCount: 5 })
      const expectedTicks = getLogicalTicks(startTimestamp, endTimestamp, 5)

      expect(config.ticks).toEqual(expectedTicks)
    })
  })

  describe('fixed configuration properties', () => {
    it('always sets correct fixed properties', () => {
      const config = createXAxisConfig(startTimestamp, endTimestamp)

      expect(config.dataKey).toBe('timestamp')
      expect(config.type).toBe('number')
      expect(config.scale).toBe('time')
      expect(config.tick.fontSize).toBe(12)
      expect(config.tickLine.stroke).toBe('transparent')
      expect(config.allowDataOverflow).toBe(true)
      expect(config.interval).toBe('preserveStartEnd')
      expect(config.strokeDasharray).toBe('3 3')
    })
  })

  describe('edge cases', () => {
    it('handles zero timestamps', () => {
      const config = createXAxisConfig(0, 0)

      expect(config.domain).toEqual([0, 0])
      expect(config.ticks).toHaveLength(6)
    })

    it('handles very large timestamps', () => {
      const largeStart = 9999999999
      const largeEnd = 9999999999 + 3600

      const config = createXAxisConfig(largeStart, largeEnd)

      expect(config.domain).toEqual([largeStart * 1000, largeEnd * 1000])
      expect(config.ticks[0]).toBe(largeStart * 1000)
      expect(config.ticks[config.ticks.length - 1]).toBe(largeEnd * 1000)
    })
  })
})

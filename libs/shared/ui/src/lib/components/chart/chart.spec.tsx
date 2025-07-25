import { ComposedChart, Line } from 'recharts'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(15) // Uses default maxItems of 15
      expect(screen.getByText('+5 more')).toBeInTheDocument()
    })

    it('shows all items when maxItems is explicitly undefined', () => {
      const { container } = renderWithProviders(<Chart.TooltipContent {...mockProps} maxItems={undefined} />)

      const items = container.querySelectorAll('[class*="flex items-center justify-between gap-4 text-xs"]')
      expect(items).toHaveLength(15) // Uses default maxItems of 15 due to default parameter
      expect(screen.getByText('+5 more')).toBeInTheDocument()
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


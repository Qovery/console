import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ChartContent, type ReferenceLineEvent } from './local-chart'
import type { UnitType } from './tooltip'

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => ({
    startTimestamp: '1640994000',
    endTimestamp: '1640994600',
    useLocalTime: false,
    hideEvents: false,
    hoveredEventKey: null,
    setHoveredEventKey: jest.fn(),
    handleZoomTimeRangeChange: jest.fn(),
    registerZoomReset: jest.fn(),
    setIsAnyChartZoomed: jest.fn(),
    handleTimeRangeChange: jest.fn(),
    lastDropdownTimeRange: null,
    isAnyChartRefreshing: false,
  }),
}))

describe('ReferenceLineEvent Type', () => {
  it('should accept valid reference line event structures', () => {
    const eventTypes = ['event', 'metric', 'exit-code', 'k8s-event', 'probe'] as const

    eventTypes.forEach((type) => {
      const event: ReferenceLineEvent = {
        type,
        timestamp: 1640994000000,
        reason: `Test ${type}`,
        icon: 'info',
        key: `test-${type}`,
        color: '#ff0000',
      }

      expect(event.type).toBe(type)
    })
  })

  it('should handle optional color property', () => {
    const eventWithColor: ReferenceLineEvent = {
      type: 'event',
      timestamp: 1640994000000,
      reason: 'Deployment',
      icon: 'check',
      key: 'deploy-123',
      color: '#00ff00',
    }

    const eventWithoutColor: ReferenceLineEvent = {
      type: 'metric',
      timestamp: 1640994300000,
      reason: 'High CPU',
      icon: 'warning',
      key: 'cpu-alert',
    }

    expect(eventWithColor.color).toBe('#00ff00')
    expect(eventWithoutColor.color).toBeUndefined()
  })
})

describe('ChartContent', () => {
  const mockData = [
    { timestamp: 1640994000000, time: '12:00', fullTime: '2022-01-01 12:00:00', value: 10 },
    { timestamp: 1640994300000, time: '12:05', fullTime: '2022-01-01 12:05:00', value: 20 },
  ]

  const defaultProps = {
    data: mockData,
    unit: 'percent' as UnitType,
    label: 'Test Chart',
    isEmpty: false,
    isLoading: false,
  }

  it('should render chart container', () => {
    renderWithProviders(<ChartContent {...defaultProps} />)

    expect(screen.getByRole('region', { name: 'Interactive chart' })).toBeInTheDocument()
  })

  it('should render loading state', () => {
    renderWithProviders(<ChartContent {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Fetching data...')).toBeInTheDocument()
  })

  it('should render empty state', () => {
    renderWithProviders(<ChartContent {...defaultProps} isEmpty={true} />)

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})

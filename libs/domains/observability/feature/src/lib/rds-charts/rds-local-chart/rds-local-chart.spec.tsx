import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { RdsLocalChart } from './rds-local-chart'

jest.mock('../../rds-managed-db/util-filter/rds-managed-db-context', () => ({
  useRdsManagedDbContext: () => ({
    startTimestamp: '1640994000',
    endTimestamp: '1640994600',
    useLocalTime: false,
    handleZoomTimeRangeChange: jest.fn(),
    registerZoomReset: jest.fn(),
    setIsAnyChartZoomed: jest.fn(),
    handleTimeRangeChange: jest.fn(),
    lastDropdownTimeRange: null,
    isAnyChartRefreshing: false,
  }),
}))

describe('RdsLocalChart', () => {
  const mockData = [
    { timestamp: 1640994000000, time: '12:00', fullTime: '2022-01-01 12:00:00', value: 10 },
    { timestamp: 1640994300000, time: '12:05', fullTime: '2022-01-01 12:05:00', value: 20 },
  ]

  const defaultProps = {
    data: mockData,
    unit: '%',
    label: 'Test Chart',
    description: 'Test description',
    isEmpty: false,
    isLoading: false,
  }

  it('should render chart container', () => {
    renderWithProviders(<RdsLocalChart {...defaultProps} />)

    expect(screen.getByRole('region', { name: 'Interactive chart' })).toBeInTheDocument()
  })

  it('should render chart title', () => {
    renderWithProviders(<RdsLocalChart {...defaultProps} />)

    expect(screen.getByText('Test Chart')).toBeInTheDocument()
  })

  it('should render chart description', () => {
    renderWithProviders(<RdsLocalChart {...defaultProps} />)

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    renderWithProviders(<RdsLocalChart {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Fetching data...')).toBeInTheDocument()
  })

  it('should render empty state', () => {
    renderWithProviders(<RdsLocalChart {...defaultProps} isEmpty={true} />)

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})

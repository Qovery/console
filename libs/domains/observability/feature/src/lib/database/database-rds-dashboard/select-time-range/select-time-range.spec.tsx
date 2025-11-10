import '@testing-library/jest-dom'
import { useQueryParam } from 'use-query-params'
import { render, screen } from '@qovery/shared/util-tests'
import { SelectTimeRange } from './select-time-range'

const mockUseDashboardContext = jest.fn()

jest.mock('../../../util-filter/dashboard-context', () => ({
  useDashboardContext: () => mockUseDashboardContext(),
}))

jest.mock('use-query-params', () => ({
  useQueryParam: jest.fn(),
  StringParam: jest.fn(),
}))

jest.mock('date-fns', () => ({
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
}))

jest.mock('../../../util-filter/time-range', () => ({
  timeRangeOptions: [
    { value: '5m', label: 'Last 5 minutes' },
    { value: '15m', label: 'Last 15 minutes' },
    { value: '30m', label: 'Last 30 minutes' },
    { value: '1h', label: 'Last 1 hour' },
    { value: '3h', label: 'Last 3 hours' },
    { value: '6h', label: 'Last 6 hours' },
    { value: '12h', label: 'Last 12 hours' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '2d', label: 'Last 2 days' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
  ],
}))

jest.mock('@qovery/shared/util-dates', () => ({
  dateFullFormat: jest.fn((date) => {
    const d = new Date(date)
    return `${d.getDate()} Nov, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  }),
}))

const defaultContext = {
  setStartDate: jest.fn(),
  setEndDate: jest.fn(),
  startDate: '2023-11-01T10:00:00.000Z',
  endDate: '2023-11-01T10:30:00.000Z',
  endTimestamp: '1698836200000',
  startTimestamp: '1698834400000',
  handleTimeRangeChange: jest.fn(),
  timeRange: '1h' as const,
  useLocalTime: false,
  resetChartZoom: jest.fn(),
  setIsDatePickerOpen: jest.fn(),
  lastDropdownTimeRange: '1h' as const,
  isLiveUpdateEnabled: false,
  setIsLiveUpdateEnabled: jest.fn(),
}

describe('SelectTimeRange for RDS', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useQueryParam as jest.Mock).mockReturnValue(['1h', jest.fn()])
    mockUseDashboardContext.mockReturnValue(defaultContext)
  })

  it('should render successfully', () => {
    const { container } = render(<SelectTimeRange />)
    expect(container).toBeTruthy()
  })

  it('should render calendar button when queryTimeRange is not custom', () => {
    render(<SelectTimeRange />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should render time range selector when queryTimeRange is not custom', () => {
    render(<SelectTimeRange />)
    expect(screen.getByTestId('input-select-small')).toBeInTheDocument()
  })
})

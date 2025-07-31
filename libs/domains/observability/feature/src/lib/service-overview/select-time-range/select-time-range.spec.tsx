import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SelectTimeRange } from './select-time-range'

const mockUseServiceOverviewContext = jest.fn()

jest.mock('../util-filter/service-overview-context', () => ({
  useServiceOverviewContext: () => mockUseServiceOverviewContext(),
}))

describe('SelectTimeRange', () => {
  const defaultMockContext = {
    setStartDate: jest.fn(),
    setEndDate: jest.fn(),
    startDate: '2023-11-01T10:00:00.000Z',
    endDate: '2023-11-01T10:30:00.000Z',
    endTimestamp: '1698836200000',
    startTimestamp: '1698834400000',
    handleTimeRangeChange: jest.fn(),
    timeRange: '30m' as const,
    setHasCalendarValue: jest.fn(),
    hasCalendarValue: false,
    useLocalTime: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseServiceOverviewContext.mockReturnValue(defaultMockContext)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SelectTimeRange />)
    expect(baseElement).toBeTruthy()
  })

  it('should render calendar button when hasCalendarValue is false', () => {
    renderWithProviders(<SelectTimeRange />)

    const calendarButton = screen.getByRole('button')
    expect(calendarButton).toBeInTheDocument()
  })

  it('should render time range selector when hasCalendarValue is false', () => {
    renderWithProviders(<SelectTimeRange />)

    const timeRangeSelect = screen.getByDisplayValue('Last 30 minutes')
    expect(timeRangeSelect).toBeInTheDocument()
  })
})

describe('SelectTimeRange with calendar value', () => {
  let mockHandleTimeRangeChange: jest.Mock
  let mockSetHasCalendarValue: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockHandleTimeRangeChange = jest.fn()
    mockSetHasCalendarValue = jest.fn()

    mockUseServiceOverviewContext.mockReturnValue({
      setStartDate: jest.fn(),
      setEndDate: jest.fn(),
      startDate: '2023-11-01T10:00:00.000Z',
      endDate: '2023-11-01T10:30:00.000Z',
      endTimestamp: '1698836200000',
      startTimestamp: '1698834400000',
      handleTimeRangeChange: mockHandleTimeRangeChange,
      timeRange: '30m' as const,
      setHasCalendarValue: mockSetHasCalendarValue,
      hasCalendarValue: true,
      useLocalTime: false,
    })
  })

  it('should render formatted date range when hasCalendarValue is true', () => {
    renderWithProviders(<SelectTimeRange />)

    expect(screen.getByText(/from:/)).toBeInTheDocument()
    expect(screen.getByText(/to:/)).toBeInTheDocument()
  })

  it('should not render time range selector when hasCalendarValue is true', () => {
    renderWithProviders(<SelectTimeRange />)

    expect(screen.queryByDisplayValue('Last 30 minutes')).not.toBeInTheDocument()
  })

  it('should call reset functions when clear button is clicked', async () => {
    const { userEvent } = renderWithProviders(<SelectTimeRange />)

    const clearButton = screen.getAllByRole('button')[1]
    await userEvent.click(clearButton)

    expect(mockSetHasCalendarValue).toHaveBeenCalledWith(false)
    expect(mockHandleTimeRangeChange).toHaveBeenCalledWith('30m')
  })
})

describe('SelectTimeRange date validation', () => {
  it('should handle invalid timestamps gracefully', () => {
    mockUseServiceOverviewContext.mockReturnValue({
      setStartDate: jest.fn(),
      setEndDate: jest.fn(),
      startDate: '2023-11-01T10:00:00.000Z',
      endDate: '2023-11-01T10:30:00.000Z',
      endTimestamp: 'invalid',
      startTimestamp: 'invalid',
      handleTimeRangeChange: jest.fn(),
      timeRange: '30m' as const,
      setHasCalendarValue: jest.fn(),
      hasCalendarValue: false,
      useLocalTime: false,
    })

    const { baseElement } = renderWithProviders(<SelectTimeRange />)
    expect(baseElement).toBeTruthy()
  })

  it('should handle valid timestamps correctly', () => {
    const validTimestamp = Date.now().toString()

    mockUseServiceOverviewContext.mockReturnValue({
      setStartDate: jest.fn(),
      setEndDate: jest.fn(),
      startDate: '2023-11-01T10:00:00.000Z',
      endDate: '2023-11-01T10:30:00.000Z',
      endTimestamp: validTimestamp,
      startTimestamp: validTimestamp,
      handleTimeRangeChange: jest.fn(),
      timeRange: '30m' as const,
      setHasCalendarValue: jest.fn(),
      hasCalendarValue: false,
      useLocalTime: false,
    })

    const { baseElement } = renderWithProviders(<SelectTimeRange />)
    expect(baseElement).toBeTruthy()
  })
})

import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ModalChart } from './modal-chart'

const mockUseServiceOverviewContext = jest.fn()

jest.mock('../util-filter/service-overview-context', () => ({
  useServiceOverviewContext: () => mockUseServiceOverviewContext(),
}))

jest.mock('../select-time-range/select-time-range', () => ({
  SelectTimeRange: () => <div data-testid="select-time-range">SelectTimeRange</div>,
}))

describe('ModalChart', () => {
  const defaultMockContext = {
    useLocalTime: false,
    setUseLocalTime: jest.fn(),
    hideEvents: false,
    setHideEvents: jest.fn(),
  }

  const defaultProps = {
    title: 'Test Chart Modal',
    open: true,
    onOpenChange: jest.fn(),
    children: <div data-testid="modal-content">Test Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseServiceOverviewContext.mockReturnValue(defaultMockContext)
  })

  it('should render successfully when open', () => {
    const { baseElement } = renderWithProviders(<ModalChart {...defaultProps} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display title when provided', () => {
    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByText('Test Chart Modal')).toBeInTheDocument()
  })

  it('should display description when provided', () => {
    const propsWithDescription = {
      ...defaultProps,
      description: 'This is a test description',
    }

    renderWithProviders(<ModalChart {...propsWithDescription} />)

    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('should render children content', () => {
    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should render SelectTimeRange component', () => {
    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByTestId('select-time-range')).toBeInTheDocument()
  })

  it('should render close button', () => {
    renderWithProviders(<ModalChart {...defaultProps} />)

    const buttons = screen.getAllByRole('button')
    const closeButton = buttons.find((button) => button.querySelector('.fa-xmark'))
    expect(closeButton).toBeInTheDocument()
  })

  it('should render timezone selector with correct default value', () => {
    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByDisplayValue('UTC')).toBeInTheDocument()
  })

  it('should render timezone selector with local time when useLocalTime is true', () => {
    mockUseServiceOverviewContext.mockReturnValue({
      ...defaultMockContext,
      useLocalTime: true,
    })

    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByDisplayValue('Local Time')).toBeInTheDocument()
  })
})

describe('ModalChart interactions', () => {
  const mockSetHideEvents = jest.fn()
  const mockSetUseLocalTime = jest.fn()
  const mockOnOpenChange = jest.fn()

  const defaultProps = {
    title: 'Test Chart Modal',
    open: true,
    onOpenChange: mockOnOpenChange,
    children: <div data-testid="modal-content">Test Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseServiceOverviewContext.mockReturnValue({
      useLocalTime: false,
      setUseLocalTime: mockSetUseLocalTime,
      hideEvents: false,
      setHideEvents: mockSetHideEvents,
    })
  })

  it('should display "Hide events" when events are visible', () => {
    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByText('Hide events')).toBeInTheDocument()
  })

  it('should display "Show events" when events are hidden', () => {
    mockUseServiceOverviewContext.mockReturnValue({
      useLocalTime: false,
      setUseLocalTime: mockSetUseLocalTime,
      hideEvents: true,
      setHideEvents: mockSetHideEvents,
    })

    renderWithProviders(<ModalChart {...defaultProps} />)

    expect(screen.getByText('Show events')).toBeInTheDocument()
  })

  it('should call setHideEvents when events toggle button is clicked', async () => {
    const { userEvent } = renderWithProviders(<ModalChart {...defaultProps} />)

    const eventsButton = screen.getByText('Hide events')
    await userEvent.click(eventsButton)

    expect(mockSetHideEvents).toHaveBeenCalledWith(true)
  })

  it('should call setUseLocalTime when timezone is changed', async () => {
    const { userEvent } = renderWithProviders(<ModalChart {...defaultProps} />)

    const timezoneSelect = screen.getByDisplayValue('UTC')
    await userEvent.selectOptions(timezoneSelect, 'local')

    expect(mockSetUseLocalTime).toHaveBeenCalledWith(true)
  })

  it('should call onOpenChange when overlay is clicked', async () => {
    const { userEvent } = renderWithProviders(<ModalChart {...defaultProps} />)

    const overlay = document.querySelector('.modal__overlay')
    expect(overlay).toBeInTheDocument()

    if (overlay) {
      await userEvent.click(overlay)
    }
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})

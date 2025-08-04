import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CardMetric } from './card-metric'

describe('CardMetric', () => {
  const defaultProps = {
    title: 'Test Metric',
    value: 42,
    status: 'GREEN' as const,
    description: 'Test description',
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully with basic props', () => {
    const { baseElement } = renderWithProviders(<CardMetric {...defaultProps} />)

    expect(baseElement).toBeTruthy()
    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render with loading state', () => {
    renderWithProviders(<CardMetric {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
  })

  it('should display GREEN status correctly', () => {
    renderWithProviders(<CardMetric {...defaultProps} status="GREEN" />)

    const dot = document.querySelector('.bg-green-500')
    expect(dot).toBeInTheDocument()
  })

  it('should display YELLOW status correctly', () => {
    renderWithProviders(<CardMetric {...defaultProps} status="YELLOW" />)

    const dot = document.querySelector('.bg-yellow-500')
    expect(dot).toBeInTheDocument()
  })

  it('should display RED status correctly', () => {
    renderWithProviders(<CardMetric {...defaultProps} status="RED" />)

    const dot = document.querySelector('.bg-red-500')
    expect(dot).toBeInTheDocument()
  })

  it('should render with unit', () => {
    renderWithProviders(<CardMetric {...defaultProps} value="95" unit="ms" />)

    expect(screen.getByText('95')).toBeInTheDocument()
  })

  it('should render without description', () => {
    renderWithProviders(<CardMetric {...defaultProps} description={undefined} />)

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('should show tooltip and icon when hasModalLink is true', () => {
    renderWithProviders(<CardMetric {...defaultProps} hasModalLink={true} />)

    const icon = document.querySelector('.fa-chart-line')
    expect(icon).toBeInTheDocument()
  })

  it('should show tooltip and icon when onClick is provided', () => {
    const mockOnClick = jest.fn()
    renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} />)

    const icon = document.querySelector('.fa-chart-line')
    expect(icon).toBeInTheDocument()
  })

  it('should call onClick when clicked and not loading', async () => {
    const mockOnClick = jest.fn()
    const { userEvent } = renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} isLoading={false} />)

    const buttons = screen.getAllByRole('button')
    const mainButton = buttons[0]
    await userEvent.click(mainButton)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when loading', async () => {
    const mockOnClick = jest.fn()
    const { userEvent } = renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} isLoading={true} />)

    const buttons = screen.getAllByRole('button')
    const mainButton = buttons[0]
    await userEvent.click(mainButton)

    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('should render with custom icon', () => {
    renderWithProviders(<CardMetric {...defaultProps} icon="database" hasModalLink={true} />)

    const icon = document.querySelector('.fa-database')
    expect(icon).toBeInTheDocument()
  })

  it('should have cursor-default class when no onClick', () => {
    renderWithProviders(<CardMetric {...defaultProps} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('cursor-default')
  })

  it('should have cursor-pointer class when onClick is provided and not loading', () => {
    const mockOnClick = jest.fn()
    renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} isLoading={false} />)

    const buttons = screen.getAllByRole('button')
    const mainButton = buttons[0]
    expect(mainButton).toHaveClass('cursor-pointer')
  })
})

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
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render with loading state', () => {
    renderWithProviders(<CardMetric {...defaultProps} isLoading={true} />)

    const skeleton = document.querySelector('[aria-busy="true"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('should display GREEN status correctly', () => {
    renderWithProviders(<CardMetric {...defaultProps} status="GREEN" />)

    expect(screen.getByText('Healthy')).toBeInTheDocument()
    const icon = document.querySelector('.fa-circle-check')
    expect(icon).toBeInTheDocument()
  })

  it('should display YELLOW status correctly', () => {
    renderWithProviders(<CardMetric {...defaultProps} status="YELLOW" />)

    expect(screen.getByText('Unhealthy')).toBeInTheDocument()
    const icon = document.querySelector('.fa-circle-exclamation')
    expect(icon).toBeInTheDocument()
  })

  it('should display RED status correctly', () => {
    renderWithProviders(<CardMetric {...defaultProps} status="RED" />)

    expect(screen.getByText('Unhealthy')).toBeInTheDocument()
    const icon = document.querySelector('.fa-circle-exclamation')
    expect(icon).toBeInTheDocument()
  })

  it('should render with unit', () => {
    renderWithProviders(<CardMetric {...defaultProps} unit="ms" />)

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render without description', () => {
    renderWithProviders(<CardMetric {...defaultProps} description={undefined} />)

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('should show tooltip and icon when hasModalLink is true', () => {
    renderWithProviders(<CardMetric {...defaultProps} hasModalLink={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should show tooltip and icon when onClick is provided', () => {
    const mockOnClick = jest.fn()
    renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should call onClick when clicked and not loading', async () => {
    const mockOnClick = jest.fn()
    const { userEvent } = renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} isLoading={false} />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when loading', async () => {
    const mockOnClick = jest.fn()
    const { userEvent } = renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} isLoading={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeEnabled()

    await userEvent.click(button)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should render with custom icon', () => {
    renderWithProviders(<CardMetric {...defaultProps} icon="database" hasModalLink={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should have cursor-default class when no onClick', () => {
    renderWithProviders(<CardMetric {...defaultProps} />)

    const section = screen.getByRole('region')
    expect(section).toHaveClass('cursor-default')
  })

  it('should have cursor-pointer class when onClick is provided and not loading', () => {
    const mockOnClick = jest.fn()
    renderWithProviders(<CardMetric {...defaultProps} onClick={mockOnClick} isLoading={false} />)

    const section = screen.getByRole('region')
    expect(section).toHaveClass('cursor-pointer')
  })
})

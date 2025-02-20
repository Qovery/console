import { type EnvironmentStatus, ServiceDeploymentStatusEnum, StateEnum, type Status } from 'qovery-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { AIAnalysisButton } from './ai-analysis-button'

describe('AIAnalysisButton', () => {
  const mockOnClick = jest.fn()

  const mockServiceStatus: Status = {
    id: '506f611a-04a4-4e2b-8c3d-8349580eea06',
    state: 'DEPLOYMENT_ERROR',
    service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
    last_deployment_date: '2025-02-20T08:58:03.798027Z',
    is_part_last_deployment: true,
    steps: {
      total_duration_sec: 623,
      total_computing_duration_sec: 618,
      details: [
        {
          step_name: 'DEPLOYMENT',
          status: 'ERROR',
          duration_sec: 618,
        },
      ],
    },
    execution_id: '7eecab91-1d38-4533-85d5-10e6d5f69d7e-376',
    status_details: {
      action: 'DEPLOY',
      status: 'ERROR',
    },
    deployment_request_id: null,
  }

  const mockServiceStatusSuccess: Status = {
    ...mockServiceStatus,
    state: 'RUNNING',
    steps: {
      total_duration_sec: 623,
      total_computing_duration_sec: 618,
      details: [
        {
          step_name: 'DEPLOYMENT',
          status: 'SUCCESS',
          duration_sec: 618,
        },
      ],
    },
    status_details: {
      action: 'DEPLOY',
      status: 'SUCCESS',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully when service has deployment error', () => {
    const { baseElement } = renderWithProviders(
      <AIAnalysisButton onClick={mockOnClick} serviceStatus={mockServiceStatus} />
    )
    expect(baseElement).toBeTruthy()
  })

  it('should call onClick when clicked', () => {
    const { getByRole } = renderWithProviders(
      <AIAnalysisButton onClick={mockOnClick} serviceStatus={mockServiceStatus} />
    )

    getByRole('button').click()
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should not render when no error status', () => {
    const { container } = renderWithProviders(
      <AIAnalysisButton onClick={mockOnClick} serviceStatus={mockServiceStatusSuccess} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render with correct text and aria-label', () => {
    const { getByRole, getByText } = renderWithProviders(
      <AIAnalysisButton onClick={mockOnClick} serviceStatus={mockServiceStatus} />
    )

    expect(getByRole('button')).toHaveAttribute('aria-label', 'Analyze with AI')
    expect(getByText('Analyze Error with AI')).toBeInTheDocument()
  })

  it('should match snapshot', () => {
    const { container } = renderWithProviders(
      <AIAnalysisButton onClick={mockOnClick} serviceStatus={mockServiceStatus} />
    )
    expect(container).toMatchSnapshot()
  })
})

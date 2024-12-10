import { useMetrics, useRunningStatus } from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import SidebarPodStatuses, { type SidebarPodStatusesProps } from './sidebar-pod-statuses'

jest.mock('@qovery/domains/services/feature', () => ({
  useMetrics: jest.fn(),
  useRunningStatus: jest.fn(),
}))

const mockService = {
  id: '123',
  serviceType: 'APPLICATION',
  environment: {
    id: 'env-123',
  },
}

const defaultProps: SidebarPodStatusesProps = {
  organizationId: 'org-123',
  projectId: 'proj-123',
  service: mockService,
  children: <div>Content</div>,
}

const mockRunningPod = {
  name: 'pod-123',
  state: 'RUNNING',
  state_message: '',
  state_reason: '',
  started_at: '2024-01-01T00:00:00Z',
}

const mockErrorPod = {
  name: 'pod-error',
  state: 'ERROR',
  state_message: 'Container crashed',
  state_reason: 'Error',
  started_at: '2024-01-01T00:00:00Z',
}

describe('SidebarPodStatuses', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const metricsReturn = { data: [], isLoading: false }
    const runningStatusReturn = { data: { pods: [], state: 'RUNNING' }, isLoading: false }

    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue(metricsReturn)
    useRunningStatusMock.mockReturnValue(runningStatusReturn)
  })

  it('renders children when loading', () => {
    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({ isLoading: true })
    useRunningStatusMock.mockReturnValue({ isLoading: true })

    renderWithProviders(<SidebarPodStatuses {...defaultProps} />)

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders donut chart when pods are running', () => {
    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: [{ pod_name: 'pod-123' }],
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: [mockRunningPod], state: 'RUNNING' },
      isLoading: false,
    })

    const { container } = renderWithProviders(<SidebarPodStatuses {...defaultProps} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows error state when pods have errors', () => {
    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: [{ pod_name: 'pod-error' }],
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: [mockErrorPod], state: 'RUNNING' },
      isLoading: false,
    })

    renderWithProviders(<SidebarPodStatuses {...defaultProps} />)

    expect(screen.getByText('Pods were not successful')).toBeInTheDocument()
    expect(screen.getByText('1 failing')).toBeInTheDocument()
  })

  it('groups similar errors for services', () => {
    const errorPods = [
      { ...mockErrorPod, name: 'pod-error-1' },
      { ...mockErrorPod, name: 'pod-error-2' },
    ]

    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: errorPods.map((pod) => ({ pod_name: pod.name })),
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: errorPods, state: 'RUNNING' },
      isLoading: false,
    })

    renderWithProviders(<SidebarPodStatuses {...defaultProps} />)

    const errorMessages = screen.getAllByText('Error:Container crashed')
    expect(errorMessages).toHaveLength(1)
  })

  it('shows success message when no errors', async () => {
    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: [{ pod_name: 'pod-123' }],
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: [mockRunningPod], state: 'RUNNING' },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<SidebarPodStatuses {...defaultProps} />)

    const toggleButton = screen.getByRole('button')
    await userEvent.click(toggleButton)

    expect(screen.getByText('Everything running fine')).toBeInTheDocument()
    expect(screen.getByText('Any errors will be displayed here')).toBeInTheDocument()
  })

  it('renders correct pod status counts', async () => {
    const mixedPods = [
      mockRunningPod,
      { ...mockRunningPod, name: 'pod-124', state: 'WARNING' },
      { ...mockRunningPod, name: 'pod-125', state: 'STARTING' },
      mockErrorPod,
    ]

    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: mixedPods.map((pod) => ({ pod_name: pod.name })),
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: mixedPods, state: 'RUNNING' },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<SidebarPodStatuses {...defaultProps} />)

    const toggleButton = screen.getByRole('button')
    await userEvent.click(toggleButton)

    expect(screen.getByText('1 running')).toBeInTheDocument()
    expect(screen.getByText('1 warning')).toBeInTheDocument()
    expect(screen.getByText('1 starting')).toBeInTheDocument()
    expect(screen.getByText('1 failing')).toBeInTheDocument()
  })

  it('handles empty pod data', async () => {
    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: [],
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: [], state: 'RUNNING' },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<SidebarPodStatuses {...defaultProps} />)
    const toggleButton = screen.getByRole('button')
    await userEvent.click(toggleButton)

    expect(screen.getByText('No pods')).toBeInTheDocument()
  })

  it('displays correct status for completed job', async () => {
    const completedJobPod = {
      name: 'job-pod-123',
      state: 'COMPLETED',
      state_message: '',
      state_reason: '',
      started_at: '2024-01-01T00:00:00Z',
    }

    const jobService = {
      ...mockService,
      serviceType: 'JOB',
    }

    const useMetricsMock = useMetrics as jest.Mock
    const useRunningStatusMock = useRunningStatus as jest.Mock

    useMetricsMock.mockReturnValue({
      data: [{ pod_name: completedJobPod.name }],
      isLoading: false,
    })
    useRunningStatusMock.mockReturnValue({
      data: { pods: [completedJobPod], state: 'RUNNING' },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<SidebarPodStatuses {...defaultProps} service={jobService} />)

    const toggleButton = screen.getByRole('button')
    await userEvent.click(toggleButton)

    // Check for job-specific completed status message
    expect(screen.getByText('Job executions completed')).toBeInTheDocument()
    expect(screen.getByText('1 completed')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})

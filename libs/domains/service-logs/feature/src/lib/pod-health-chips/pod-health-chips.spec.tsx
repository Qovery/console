import { type ReactNode } from 'react'
import { useMetrics, useRunningStatus } from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PodHealthChips } from './pod-health-chips'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useSearch: () => ({}),
  useNavigate: () => jest.fn(),
  useParams: () => ({ organizationId: '1' }),
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({
    buildLocation: () => ({ href: '/' }),
  }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => (
    <a {...props} href={`${props.to}`}>
      {children}
    </a>
  ),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useMetrics: jest.fn(),
  useRunningStatus: jest.fn(),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  getColorByPod: jest.fn(() => '#123456'),
}))

const baseService = {
  id: 'service-1',
  environment: { id: 'env-1' },
  name: 'svc',
}

describe('PodHealthChips', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading skeleton when loading', () => {
    const mockUseMetrics = useMetrics as jest.Mock
    const mockUseRunningStatus = useRunningStatus as jest.Mock
    mockUseMetrics.mockReturnValue({ data: undefined, isLoading: true })
    mockUseRunningStatus.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderWithProviders(<PodHealthChips service={baseService} />)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('renders skeleton if no pods', () => {
    const mockUseMetrics = useMetrics as jest.Mock
    const mockUseRunningStatus = useRunningStatus as jest.Mock
    mockUseMetrics.mockReturnValue({ data: [], isLoading: false })
    mockUseRunningStatus.mockReturnValue({ data: { pods: [] }, isLoading: false })

    const { container } = renderWithProviders(<PodHealthChips service={baseService} />)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('renders status chips for pods', () => {
    const mockUseMetrics = useMetrics as jest.Mock
    const mockUseRunningStatus = useRunningStatus as jest.Mock
    mockUseMetrics.mockReturnValue({
      data: [
        { pod_name: 'pod-1', state: 'RUNNING' },
        { pod_name: 'pod-2', state: 'ERROR' },
      ],
      isLoading: false,
    })
    mockUseRunningStatus.mockReturnValue({
      data: {
        pods: [
          { name: 'pod-1', state: 'RUNNING' },
          { name: 'pod-2', state: 'ERROR' },
        ],
      },
      isLoading: false,
    })

    renderWithProviders(<PodHealthChips service={baseService} />)
    const chips = screen.getAllByText('1')
    expect(chips).toHaveLength(2)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('shows popover with pod names on hover', async () => {
    const mockUseMetrics = useMetrics as jest.Mock
    const mockUseRunningStatus = useRunningStatus as jest.Mock
    mockUseMetrics.mockReturnValue({
      data: [{ pod_name: 'pod-1', state: 'RUNNING' }],
      isLoading: false,
    })
    mockUseRunningStatus.mockReturnValue({
      data: { pods: [{ name: 'pod-1', state: 'RUNNING' }] },
      isLoading: false,
    })

    const { userEvent } = renderWithProviders(<PodHealthChips service={baseService} />)
    const chip = screen.getByText('1')
    await userEvent.hover(chip)
    expect(await screen.findByText(/1 instance running/i)).toBeInTheDocument()
  })
})

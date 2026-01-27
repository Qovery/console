import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'
import { GitWebhookStatusBadge } from './git-webhook-status-badge'

jest.mock('../hooks/use-git-webhook-status/use-git-webhook-status')

const mockUseGitWebhookStatus = useGitWebhookStatus as jest.MockedFunction<typeof useGitWebhookStatus>

describe('GitWebhookStatusBadge', () => {
  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state with "Checking..." badge', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('shows error state with error badge', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls refetch when clicking error retry button', async () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    const { userEvent } = renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    await userEvent.click(screen.getByRole('button'))

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('shows green "Working" badge for ACTIVE status', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'ACTIVE' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    expect(screen.getByText('Working')).toBeInTheDocument()
  })

  it('shows red "Not Configured" badge for NOT_CONFIGURED status', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'NOT_CONFIGURED' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    expect(screen.getByText('Not Configured')).toBeInTheDocument()
  })

  it('shows yellow "Misconfigured" badge for MISCONFIGURED status', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'MISCONFIGURED', missing_events: ['push', 'pull_request'] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    expect(screen.getByText('Misconfigured')).toBeInTheDocument()
  })

  it('shows neutral "Unable to Verify" badge for UNABLE_TO_VERIFY status', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'UNABLE_TO_VERIFY' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    expect(screen.getByText('Unable to Verify')).toBeInTheDocument()
  })

  it('has tooltip present for status badge', async () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'ACTIVE' },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as ReturnType<typeof useGitWebhookStatus>)

    const { userEvent } = renderWithProviders(<GitWebhookStatusBadge serviceId="service-123" />)

    await userEvent.hover(screen.getByText('Working'))

    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })
})

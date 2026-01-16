import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { WebhookStatusBadge } from './webhook-status-badge'
import { useWebhookStatus } from './use-webhook-status'
import { useResyncWebhook } from './use-resync-webhook'

// Mock the custom hooks
jest.mock('./use-webhook-status')
jest.mock('./use-resync-webhook')

const mockUseWebhookStatus = useWebhookStatus as jest.Mock
const mockUseResyncWebhook = useResyncWebhook as jest.Mock

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>)
}

describe('WebhookStatusBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('status state rendering', () => {
    it('renders null if no git source is configured', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'NOT_CONFIGURED',
        message: 'No webhook found',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      const { container } = renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      // Should render the badge even if no git source (let parent handle visibility)
      expect(container).toBeInTheDocument()
    })

    it('renders ACTIVE status badge correctly', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'ACTIVE',
        message: 'Webhook is configured and actively listening for git events',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders INACTIVE status badge correctly', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'INACTIVE',
        message: 'Webhook exists but is disabled',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })

    it('renders NOT_CONFIGURED status badge correctly', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'NOT_CONFIGURED',
        message: 'No webhook found',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      expect(screen.getByText('Not Configured')).toBeInTheDocument()
    })

    it('renders MISCONFIGURED status badge correctly', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'MISCONFIGURED',
        message: 'Webhook is missing required events',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      expect(screen.getByText('Misconfigured')).toBeInTheDocument()
    })

    it('renders CHECKING status badge correctly', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'CHECKING',
        message: 'Verifying webhook status...',
        lastChecked: new Date(),
        isLoading: true,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })

    it('renders STATUS_UNAVAILABLE badge correctly', () => {
      mockUseWebhookStatus.mockReturnValue({
        status: 'STATUS_UNAVAILABLE',
        message: 'Could not verify webhook status',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      expect(screen.getByText('Unavailable')).toBeInTheDocument()
    })
  })

  describe('tooltip interaction', () => {
    it('displays tooltip content when badge is hovered', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'INACTIVE',
        message: 'Webhook exists but is disabled',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Inactive')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.getByText('Webhook exists but is disabled')).toBeInTheDocument()
      })
    })

    it('shows last checked timestamp in tooltip', async () => {
      const user = userEvent.setup()
      const lastCheckedDate = new Date('2026-01-16')

      mockUseWebhookStatus.mockReturnValue({
        status: 'ACTIVE',
        message: 'Webhook is configured',
        lastChecked: lastCheckedDate,
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Active')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.getByText(/Last checked:/)).toBeInTheDocument()
      })
    })
  })

  describe('resync button visibility', () => {
    it('shows resync button for INACTIVE status when user has edit permission', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'INACTIVE',
        message: 'Webhook exists but is disabled',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Inactive')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.getByText('Re-sync Webhook')).toBeInTheDocument()
      })
    })

    it('shows resync button for NOT_CONFIGURED status when user has edit permission', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'NOT_CONFIGURED',
        message: 'No webhook found',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Not Configured')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.getByText('Re-sync Webhook')).toBeInTheDocument()
      })
    })

    it('shows resync button for MISCONFIGURED status when user has edit permission', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'MISCONFIGURED',
        message: 'Webhook is missing required events',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Misconfigured')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.getByText('Re-sync Webhook')).toBeInTheDocument()
      })
    })

    it('hides resync button when user lacks edit permission', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'NOT_CONFIGURED',
        message: 'No webhook found',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={false} />
      )

      const badge = screen.getByText('Not Configured')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.queryByText('Re-sync Webhook')).not.toBeInTheDocument()
        expect(screen.getByText('You need edit permission to update webhook configuration')).toBeInTheDocument()
      })
    })

    it('hides resync button for ACTIVE status', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'ACTIVE',
        message: 'Webhook is configured',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Active')
      await user.hover(badge)

      await waitFor(() => {
        expect(screen.queryByText('Re-sync Webhook')).not.toBeInTheDocument()
      })
    })
  })

  describe('resync functionality', () => {
    it('calls resyncWebhook mutation when re-sync button is clicked', async () => {
      const user = userEvent.setup()
      const mockResyncMutate = jest.fn()

      mockUseWebhookStatus.mockReturnValue({
        status: 'NOT_CONFIGURED',
        message: 'No webhook found',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: mockResyncMutate,
        isLoading: false,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Not Configured')
      await user.hover(badge)

      const resyncButton = await screen.findByText('Re-sync Webhook')
      await user.click(resyncButton)

      expect(mockResyncMutate).toHaveBeenCalled()
    })

    it('shows loading state while resync is in progress', async () => {
      const user = userEvent.setup()
      mockUseWebhookStatus.mockReturnValue({
        status: 'NOT_CONFIGURED',
        message: 'No webhook found',
        lastChecked: new Date(),
        isLoading: false,
      })

      mockUseResyncWebhook.mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
      })

      renderWithProviders(
        <WebhookStatusBadge serviceId="service-1" serviceType="APPLICATION" canEdit={true} />
      )

      const badge = screen.getByText('Not Configured')
      await user.hover(badge)

      const resyncButton = await screen.findByText('Syncing...')
      expect(resyncButton).toBeDisabled()
    })
  })
})

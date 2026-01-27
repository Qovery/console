import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'
import { useSyncGitWebhook } from '../hooks/use-sync-git-webhook/use-sync-git-webhook'
import { AutoDeploySection } from './auto-deploy-section'

jest.mock('../hooks/use-git-webhook-status/use-git-webhook-status')
jest.mock('../hooks/use-sync-git-webhook/use-sync-git-webhook')
jest.mock('../auto-deploy-setting/auto-deploy-setting', () => ({
  AutoDeploySetting: () => <div data-testid="auto-deploy-setting">AutoDeploySetting</div>,
}))
jest.mock('../git-webhook-status-badge/git-webhook-status-badge', () => ({
  GitWebhookStatusBadge: () => <div data-testid="webhook-status-badge">WebhookStatusBadge</div>,
}))

const mockUseGitWebhookStatus = useGitWebhookStatus as jest.MockedFunction<typeof useGitWebhookStatus>
const mockUseSyncGitWebhook = useSyncGitWebhook as jest.MockedFunction<typeof useSyncGitWebhook>

describe('AutoDeploySection', () => {
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSyncGitWebhook.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    } as unknown as ReturnType<typeof useSyncGitWebhook>)
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'ACTIVE' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useGitWebhookStatus>)
  })

  it('renders auto-deploy setting', () => {
    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    expect(screen.getByTestId('auto-deploy-setting')).toBeInTheDocument()
  })

  it('shows webhook section when auto-deploy is enabled and source is GIT', () => {
    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    expect(screen.getByTestId('webhook-status-badge')).toBeInTheDocument()
  })

  it('hides webhook section when auto-deploy is disabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: false },
      })
    )

    expect(screen.queryByTestId('webhook-status-badge')).not.toBeInTheDocument()
  })

  it('hides webhook section for CONTAINER_REGISTRY source', () => {
    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="CONTAINER_REGISTRY" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    expect(screen.queryByTestId('webhook-status-badge')).not.toBeInTheDocument()
  })

  it('shows "Update Webhook" button when webhook status is NOT_CONFIGURED', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'NOT_CONFIGURED' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    expect(screen.getByRole('button', { name: /update webhook/i })).toBeInTheDocument()
  })

  it('shows "Update Webhook" button when webhook status is MISCONFIGURED', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'MISCONFIGURED' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    expect(screen.getByRole('button', { name: /update webhook/i })).toBeInTheDocument()
  })

  it('hides "Update Webhook" button when webhook status is ACTIVE', () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'ACTIVE' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useGitWebhookStatus>)

    renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    expect(screen.queryByRole('button', { name: /update webhook/i })).not.toBeInTheDocument()
  })

  it('calls syncWebhook when clicking "Update Webhook" button', async () => {
    mockUseGitWebhookStatus.mockReturnValue({
      data: { status: 'NOT_CONFIGURED' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as ReturnType<typeof useGitWebhookStatus>)

    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<AutoDeploySection serviceId="service-123" source="GIT" />, {
        defaultValues: { auto_deploy: true },
      })
    )

    await userEvent.click(screen.getByRole('button', { name: /update webhook/i }))

    expect(mockMutate).toHaveBeenCalled()
  })
})

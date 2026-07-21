import * as posthog from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as installationValuesHooks from '../hooks/use-installation-helm-values/use-installation-helm-values'
import * as operatorHooks from '../platform-configuration/hooks/use-cluster-operator'
import { ClusterInstallationGuideModal } from './cluster-installation-guide-modal'

jest.mock('posthog-js/react', () => ({
  ...jest.requireActual('posthog-js/react'),
  useFeatureFlagEnabled: jest.fn(),
}))

describe('ClusterInstallationGuideModal', () => {
  const refetchOperatorBootstrap = jest.fn()

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    jest.mocked(posthog.useFeatureFlagEnabled).mockReturnValue(true)
    jest.spyOn(installationValuesHooks, 'useInstallationHelmValues').mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof installationValuesHooks.useInstallationHelmValues>)
    jest.spyOn(operatorHooks, 'useClusterOperatorStatus').mockReturnValue({
      data: {
        organizationId: 'org-123',
        clusterId: 'cluster-123',
        operatorConnected: false,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof operatorHooks.useClusterOperatorStatus>)
    jest.spyOn(operatorHooks, 'useClusterOperatorBootstrap').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchOperatorBootstrap,
    } as unknown as ReturnType<typeof operatorHooks.useClusterOperatorBootstrap>)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('shows an actionable error when the operator bootstrap cannot be loaded', async () => {
    const cluster = {
      id: 'cluster-123',
      organization: { id: 'org-123' },
      kubernetes: 'SELF_MANAGED',
      is_demo: false,
    } as Cluster

    const { userEvent } = renderWithProviders(
      <ClusterInstallationGuideModal mode="EDIT" cluster={cluster} type="ON_PREMISE" onClose={jest.fn()} />
    )

    expect(screen.getByText('Unable to load the operator installation guide.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetchOperatorBootstrap).toHaveBeenCalledTimes(1)
  })
})

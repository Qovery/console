import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Route } from './credentials'

let mockIsWideCredentialsEnabled = false

const mockCluster = {
  id: 'cluster-123',
  cloud_provider: 'AWS',
  kubernetes: 'MANAGED',
  wide_permissions: {
    using_restrictive_permissions: true,
    slack_webhook_url: 'https://hooks.slack.test/abc',
  },
}

const mockCloudProviderInfo = {
  cloud_provider: 'AWS',
  region: 'eu-west-3',
  credentials: { id: 'restricted-credential', name: 'restricted' },
  wide_permission_credentials: { id: 'wide-credential', name: 'wide' },
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  createFileRoute: () => (options: { component: unknown }) => ({ options }),
  useParams: () => ({ organizationId: 'org-123', clusterId: 'cluster-123' }),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: () => mockIsWideCredentialsEnabled,
}))

jest.mock('@qovery/domains/clusters/data-access', () => ({
  isClusterEksManaged: () => true,
}))

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  useCloudProviderCredentials: () => ({ data: [], isLoading: false }),
}))

jest.mock('@qovery/domains/clusters/feature', () => {
  const { useFormContext } = jest.requireActual('react-hook-form')

  return {
    ClusterCredentialsSettings: () => {
      const { watch } = useFormContext()
      return <output data-testid="legacy-credential">{watch('credentials') ?? ''}</output>
    },
    ClusterRestrictivePermissionsSettings: () => {
      const { watch } = useFormContext()
      return (
        <>
          <output data-testid="configured-credential">{watch('configured_credentials') ?? ''}</output>
          <output data-testid="restricted-credential">{watch('restricted_credentials') ?? ''}</output>
          <output data-testid="slack-webhook-url">{watch('slack_webhook_url') ?? ''}</output>
        </>
      )
    },
    getClusterCredentialsFormValuesAfterSave: jest.fn(),
    getCloudProviderInfoRequest: jest.fn(),
    getWidePermissionsRequest: jest.fn(),
    useCluster: () => ({ data: mockCluster, isFetching: false }),
    useClusterCloudProviderInfo: () => ({ data: mockCloudProviderInfo, isFetching: false }),
    useDeployCluster: () => ({ mutateAsync: jest.fn() }),
    useEditCloudProviderInfo: () => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isLoading: false }),
    useEditCluster: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  }
})

jest.mock('@qovery/shared/console-shared', () => ({
  SettingsHeading: () => null,
}))

jest.mock('@qovery/shared/ui', () => ({
  Button: ({ children, type }: { children: ReactNode; type: 'submit' | 'button' }) => (
    <button type={type}>{children}</button>
  ),
  Section: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  toast: jest.fn(),
  useModalConfirmation: () => ({ openModalConfirmation: jest.fn() }),
}))

const RouteComponent = Route.options.component as () => ReactNode

describe('Cluster credentials route', () => {
  beforeEach(() => {
    mockIsWideCredentialsEnabled = false
  })

  it('reinitializes the form when wide credentials become enabled for the same cluster', async () => {
    const { rerender } = renderWithProviders(<RouteComponent />)

    expect(await screen.findByTestId('legacy-credential')).toHaveTextContent('restricted-credential')

    mockIsWideCredentialsEnabled = true
    rerender(<RouteComponent />)

    expect(await screen.findByTestId('configured-credential')).toHaveTextContent('wide-credential')
    expect(screen.getByTestId('restricted-credential')).toHaveTextContent('restricted-credential')
    expect(screen.getByTestId('slack-webhook-url')).toHaveTextContent('https://hooks.slack.test/abc')
  })
})

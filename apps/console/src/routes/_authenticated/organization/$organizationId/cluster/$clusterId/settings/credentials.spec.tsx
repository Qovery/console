import { act } from '@testing-library/react'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Route } from './credentials'

let mockIsWideCredentialsEnabled = false
let mockConfirmationAction: (() => Promise<void>) | undefined
const mockSaveOrder: string[] = []
const mockEditCluster = jest.fn()
const mockEditClusterSilently = jest.fn()
const mockEditCloudProviderInfo = jest.fn()
const mockEditCloudProviderInfoWithoutUpdateAction = jest.fn()
const mockDeployCluster = jest.fn()
const mockOpenModalConfirmation = jest.fn()

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
      const { register, watch } = useFormContext()
      return (
        <>
          <input aria-label="Configured credentials" {...register('configured_credentials', { required: true })} />
          <input aria-label="Restricted credentials" {...register('restricted_credentials', { required: true })} />
          <input
            aria-label="Use restrictive permissions"
            type="checkbox"
            {...register('using_restrictive_permissions')}
          />
          <input aria-label="Slack webhook URL" {...register('slack_webhook_url')} />
          <output data-testid="configured-credential">{watch('configured_credentials') ?? ''}</output>
          <output data-testid="restricted-credential">{watch('restricted_credentials') ?? ''}</output>
          <output data-testid="slack-webhook-url">{watch('slack_webhook_url') ?? ''}</output>
        </>
      )
    },
    getClusterCredentialsFormValuesAfterSave: ({ formValues }: { formValues: unknown }) => formValues,
    getCloudProviderInfoRequest: (formValues: Record<string, unknown>) => {
      const usingRestrictivePermissions = Boolean(formValues['using_restrictive_permissions'])
      return {
        credentials: {
          id: usingRestrictivePermissions ? formValues['restricted_credentials'] : formValues['configured_credentials'],
        },
        ...(usingRestrictivePermissions && {
          wide_permission_credentials: { id: formValues['configured_credentials'] },
        }),
      }
    },
    getWidePermissionsRequest: jest.fn(),
    useCluster: () => ({ data: mockCluster, isFetching: false }),
    useClusterCloudProviderInfo: () => ({ data: mockCloudProviderInfo, isFetching: false }),
    useDeployCluster: () => ({ mutateAsync: mockDeployCluster }),
    useEditCloudProviderInfo: (options?: { showClusterUpdateAction?: boolean }) => ({
      mutate: mockEditCloudProviderInfo,
      mutateAsync:
        options?.showClusterUpdateAction === false ? mockEditCloudProviderInfoWithoutUpdateAction : jest.fn(),
      isLoading: false,
    }),
    useEditCluster: (options?: { silently?: boolean }) => ({
      mutateAsync: options?.silently ? mockEditClusterSilently : mockEditCluster,
      isLoading: false,
    }),
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
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

const RouteComponent = Route.options.component as () => ReactNode

describe('Cluster credentials route', () => {
  beforeEach(() => {
    mockIsWideCredentialsEnabled = false
    mockConfirmationAction = undefined
    mockSaveOrder.length = 0
    mockEditCluster.mockReset().mockImplementation(async () => {
      mockSaveOrder.push('cluster')
      return mockCluster
    })
    mockEditClusterSilently.mockReset().mockImplementation(async () => {
      mockSaveOrder.push('cluster')
      return mockCluster
    })
    mockEditCloudProviderInfo.mockReset()
    mockEditCloudProviderInfoWithoutUpdateAction.mockReset().mockImplementation(async () => {
      mockSaveOrder.push('cloud-provider-info')
      return mockCloudProviderInfo
    })
    mockDeployCluster.mockReset().mockImplementation(async () => {
      mockSaveOrder.push('deploy')
    })
    mockOpenModalConfirmation.mockReset().mockImplementation(({ action }: { action: () => Promise<void> }) => {
      mockConfirmationAction = action
    })
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

  it('confirms redeploying credential changes and runs the save steps in order', async () => {
    mockIsWideCredentialsEnabled = true
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await screen.findByTestId('configured-credential')
    await userEvent.click(screen.getByLabelText('Use restrictive permissions'))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockOpenModalConfirmation).toHaveBeenCalledTimes(1)
    expect(mockSaveOrder).toEqual([])
    expect(mockConfirmationAction).toBeDefined()

    await act(async () => {
      await mockConfirmationAction?.()
    })

    expect(mockSaveOrder).toEqual(['cluster', 'cloud-provider-info', 'deploy'])
  })

  it('does not prompt for redeploy when only the extended credential changes', async () => {
    mockIsWideCredentialsEnabled = true
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await userEvent.clear(screen.getByLabelText('Configured credentials'))
    await userEvent.type(screen.getByLabelText('Configured credentials'), 'other-wide-credential')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockOpenModalConfirmation).not.toHaveBeenCalled()
    expect(mockSaveOrder).toEqual(['cloud-provider-info'])
  })

  it('does not continue to credentials update or deployment when the cluster edit fails', async () => {
    mockIsWideCredentialsEnabled = true
    mockEditClusterSilently.mockRejectedValue(new Error('cluster update failed'))
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await userEvent.click(screen.getByLabelText('Use restrictive permissions'))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockConfirmationAction).toBeDefined()
    await expect(mockConfirmationAction!()).rejects.toThrow('cluster update failed')
    expect(mockSaveOrder).toEqual([])
    expect(mockEditClusterSilently).toHaveBeenCalledTimes(1)
    expect(mockEditCloudProviderInfoWithoutUpdateAction).not.toHaveBeenCalled()
    expect(mockDeployCluster).not.toHaveBeenCalled()
  })

  it('does not deploy when the credentials update fails', async () => {
    mockIsWideCredentialsEnabled = true
    mockEditCloudProviderInfoWithoutUpdateAction.mockRejectedValue(new Error('credentials update failed'))
    const { userEvent } = renderWithProviders(<RouteComponent />)

    await userEvent.click(screen.getByLabelText('Use restrictive permissions'))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockConfirmationAction).toBeDefined()
    await expect(mockConfirmationAction!()).rejects.toThrow('credentials update failed')
    expect(mockSaveOrder).toEqual(['cluster'])
    expect(mockEditCloudProviderInfoWithoutUpdateAction).toHaveBeenCalledTimes(1)
    expect(mockDeployCluster).not.toHaveBeenCalled()
  })
})

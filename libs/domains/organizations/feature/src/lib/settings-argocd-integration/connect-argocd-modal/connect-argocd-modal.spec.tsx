import { useCheckArgoCdConnection, useClusters, useSaveArgoCdCredentials } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ConnectArgoCdModal } from './connect-argocd-modal'

jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useClusters: jest.fn(),
  useCheckArgoCdConnection: jest.fn(),
  useSaveArgoCdCredentials: jest.fn(),
}))

describe('ConnectArgoCdModal', () => {
  const useClustersMock = useClusters as jest.MockedFunction<typeof useClusters>
  const useCheckArgoCdConnectionMock = useCheckArgoCdConnection as jest.MockedFunction<typeof useCheckArgoCdConnection>
  const useSaveArgoCdCredentialsMock = useSaveArgoCdCredentials as jest.MockedFunction<typeof useSaveArgoCdCredentials>

  const checkArgoCdConnection = jest.fn()
  const saveArgoCdCredentials = jest.fn()

  beforeEach(() => {
    checkArgoCdConnection.mockReset()
    saveArgoCdCredentials.mockReset()

    useClustersMock.mockReturnValue({
      data: [
        {
          id: 'cluster-1',
          name: 'Cluster 1',
          cloud_provider: 'AWS',
        },
      ],
      isLoading: false,
    } as ReturnType<typeof useClusters>)
    useCheckArgoCdConnectionMock.mockReturnValue({
      mutateAsync: checkArgoCdConnection,
      isLoading: false,
    } as ReturnType<typeof useCheckArgoCdConnection>)
    useSaveArgoCdCredentialsMock.mockReturnValue({
      mutateAsync: saveArgoCdCredentials,
      isLoading: false,
    } as ReturnType<typeof useSaveArgoCdCredentials>)
  })

  it('should check and save the ArgoCD connection on submit', async () => {
    checkArgoCdConnection.mockResolvedValue({ status: 'connected', app_count: 12 })
    saveArgoCdCredentials.mockResolvedValue({})
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <ConnectArgoCdModal
        organizationId="org-1"
        configuredClusterIds={['cluster-1']}
        integration={{
          clusterId: 'cluster-1',
          clusterName: 'Cluster 1',
          clusterCloudProvider: 'AWS',
          argoCdUrl: 'https://argocd.example.com',
        }}
        onClose={onClose}
      />
    )

    await userEvent.type(screen.getByLabelText('Access token'), 'my-secret-token')
    await userEvent.click(screen.getByRole('button', { name: 'Update connection' }))

    expect(checkArgoCdConnection).toHaveBeenCalledWith({
      clusterId: 'cluster-1',
      argoCdCredentialsRequest: {
        argocd_url: 'https://argocd.example.com',
        argocd_token: 'my-secret-token',
      },
    })
    expect(saveArgoCdCredentials).toHaveBeenCalledWith({
      clusterId: 'cluster-1',
      argoCdCredentialsRequest: {
        argocd_url: 'https://argocd.example.com',
        argocd_token: 'my-secret-token',
      },
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should display the API error inline when the connection check fails', async () => {
    checkArgoCdConnection.mockResolvedValue({ status: 'error', reason: 'authentication_failed' })
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <ConnectArgoCdModal
        organizationId="org-1"
        configuredClusterIds={['cluster-1']}
        integration={{
          clusterId: 'cluster-1',
          clusterName: 'Cluster 1',
          clusterCloudProvider: 'AWS',
          argoCdUrl: 'https://argocd.example.com',
        }}
        onClose={onClose}
      />
    )

    await userEvent.type(screen.getByLabelText('Access token'), 'bad-token')
    await userEvent.click(screen.getByRole('button', { name: 'Update connection' }))

    expect(
      await screen.findByText('The token was rejected by ArgoCD. Please generate a new token and try again.')
    ).toBeInTheDocument()
    expect(saveArgoCdCredentials).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})

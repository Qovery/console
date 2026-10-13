import { act } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type ClusterCredentials, KubernetesEnum } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import ClusterCredentialsSettings, {
  type ClusterCredentialsSettingsProps,
  filterCredentialsByCloudProvider,
  filterWidePermissionCredentials,
} from './cluster-credentials-settings'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({
      organizationId: 'org-123',
      clusterId: 'cluster-123',
    }),
    useRouterState: () => ({
      location: {
        pathname: '/',
      },
    }),
    useRouter: () => ({
      buildLocation: jest.fn(() => ({ href: '/' })),
    }),
    Link: React.forwardRef(
      (
        { children, ...props }: { children?: React.ReactNode; [key: string]: unknown },
        ref: React.Ref<HTMLAnchorElement>
      ) => React.createElement('a', { ref, ...props }, children)
    ),
  }
})

const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock

const props: ClusterCredentialsSettingsProps = {
  cloudProvider: CloudProviderEnum.AWS,
}

const eksManagedCluster = {
  ...clusterFactoryMock(1, CloudProviderEnum.AWS)[0],
  kubernetes: KubernetesEnum.MANAGED,
}
const eksSelfManagedCluster = { ...eksManagedCluster, kubernetes: KubernetesEnum.SELF_MANAGED }

function ClusterFields() {
  const { register, watch } = useFormContext()
  return (
    <>
      <input aria-label="Cluster name" {...register('name')} />
      <input aria-label="Cluster description" {...register('description')} />
      <input aria-label="Cluster region" {...register('region')} />
      <output data-testid="selected-credential">{watch('credentials')}</output>
    </>
  )
}

describe('ClusterCredentialsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProviderCredentialsMockSpy.mockReturnValue({
      data: [
        {
          name: 'my-credential',
          id: '000-000-000',
        },
      ],
      isLoading: false,
    })
  })

  it('shows a keyboard-accessible create action instead of an empty selector', async () => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [], isLoading: false })
    const { userEvent } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    expect(screen.getByText('No cloud credentials')).toBeInTheDocument()
    expect(screen.getByText('Connect your cloud account to continue.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Credentials')).not.toBeInTheDocument()
    expect(screen.queryByText('See and edit all Cloud credentials')).not.toBeInTheDocument()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Add New Credential' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    expect(mockOpenModal.mock.calls[0][0].content.props.cloudProvider).toBe('AWS')
  })

  it('shows create when no compatible EKS Anywhere credential exists', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings cloudProvider="AWS_EKS_ANYWHERE" />))
    expect(screen.getByRole('button', { name: 'Add New Credential' })).toBeInTheDocument()
  })

  it.each([true, false])('preserves cluster fields on modal close (created: %s)', async (created) => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [], isLoading: false })
    const ui = wrapWithReactHookForm(
      <>
        <ClusterFields />
        <ClusterCredentialsSettings {...props} />
      </>,
      {
        defaultValues: {
          name: 'production',
          description: 'Keep this description',
          region: 'eu-west-3',
          credentials: '',
        },
      }
    )
    const { userEvent, rerender } = renderWithProviders(ui, { wrapper: ({ children }) => children })
    await userEvent.type(screen.getByLabelText('Cluster name'), '-edited')
    await userEvent.click(screen.getByRole('button', { name: 'Add New Credential' }))
    const modal = mockOpenModal.mock.calls[0][0]
    const credential = { id: 'new-credential', name: 'New AWS credential' }
    if (created) useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [credential], isLoading: false })
    act(() => modal.content.props.onClose(created ? credential : undefined))
    rerender(ui)
    expect(screen.getByLabelText('Cluster name')).toHaveValue('production-edited')
    expect(screen.getByLabelText('Cluster description')).toHaveValue('Keep this description')
    expect(screen.getByLabelText('Cluster region')).toHaveValue('eu-west-3')
    expect(screen.getByTestId('selected-credential')).toHaveTextContent(created ? 'new-credential' : '')
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
  })

  it('keeps the add action for existing credentials and selects the new credential', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <>
          <ClusterFields />
          <ClusterCredentialsSettings {...props} />
        </>
      )
    )
    expect(screen.queryByText('See and edit all Cloud credentials')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Credentials'))
    await userEvent.click(await screen.findByText('New credential'))
    act(() => mockOpenModal.mock.calls[0][0].content.props.onClose({ id: 'new-credential' }))
    expect(screen.getByTestId('selected-credential')).toHaveTextContent('new-credential')
  })

  it('preserves the empty selector and settings link in cluster settings', () => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} isSetting />))
    expect(screen.getByLabelText('Credentials')).toBeInTheDocument()
    expect(screen.getByText('See and edit all Cloud credentials')).toBeInTheDocument()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should have loader when loading', () => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({
      data: [],
      isLoading: true,
    })
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should display credentials select', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />, {
        defaultValues: {
          credentials: '',
        },
      })
    )

    const realSelect = screen.getByLabelText('Credentials')
    await selectEvent.select(realSelect, ['my-credential'])

    expect(screen.getByTestId('input-credentials')).toBeInTheDocument()
  })

  it('should query AWS credentials for EKS Anywhere flow', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterCredentialsSettings cloudProvider="AWS_EKS_ANYWHERE" />, {
        defaultValues: {
          credentials: '',
        },
      })
    )

    expect(useCloudProviderCredentialsMockSpy).toHaveBeenCalledWith({
      organizationId: 'org-123',
      cloudProvider: 'AWS',
    })
  })

  it('should display the EKS credentials change warning in cluster settings for EKS clusters', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterCredentialsSettings {...props} isSetting cluster={eksManagedCluster} />)
    )

    expect(screen.getByTestId('eks-credentials-change-warning')).toBeInTheDocument()
    expect(screen.getByText('Changing credentials triggers a cluster redeployment')).toBeInTheDocument()
  })

  it('should not display the EKS credentials change warning for non EKS clusters', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterCredentialsSettings {...props} isSetting cluster={eksSelfManagedCluster} />)
    )

    expect(screen.queryByTestId('eks-credentials-change-warning')).not.toBeInTheDocument()
  })

  it('should not display the EKS credentials change warning outside cluster settings', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} cluster={eksManagedCluster} />))

    expect(screen.queryByTestId('eks-credentials-change-warning')).not.toBeInTheDocument()
  })

  it('should display the mirroring registry warning by default in cluster settings', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} isSetting />))

    expect(screen.getByTestId('mirroring-registry-credentials-warning')).toBeInTheDocument()
  })

  it('should not display the mirroring registry warning outside cluster settings', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} />))

    expect(screen.queryByTestId('mirroring-registry-credentials-warning')).not.toBeInTheDocument()
  })

  it('should filter non EKS Anywhere credentials in EKS Anywhere flow', () => {
    const credentials = [
      { id: '1', name: 'AWS role credential', object_type: 'AWS_ROLE' },
      { id: '2', name: 'EKS Anywhere credential', object_type: 'EKS_ANYWHERE_VSPHERE' },
    ] as ClusterCredentials[]

    expect(filterCredentialsByCloudProvider(credentials, 'AWS_EKS_ANYWHERE')).toEqual([
      { id: '2', name: 'EKS Anywhere credential', object_type: 'EKS_ANYWHERE_VSPHERE' },
    ])
  })

  it('should only keep AWS role credentials for extended permissions', () => {
    const credentials = [
      { id: '1', name: 'AWS role credential', object_type: 'AWS_ROLE' },
      { id: '2', name: 'AWS static credential', object_type: 'AWS' },
    ] as ClusterCredentials[]

    expect(filterWidePermissionCredentials(credentials)).toEqual([
      { id: '1', name: 'AWS role credential', object_type: 'AWS_ROLE' },
    ])
  })

  describe('wide credentials', () => {
    const awsCredentials = [
      { id: 'static-1', name: 'static-credential', object_type: 'AWS', access_key_id: 'AKIA' },
      { id: 'role-1', name: 'role-credential', object_type: 'AWS_ROLE', role_arn: 'arn:aws:iam::1:role/qovery' },
      { id: 'role-2', name: 'other-role-credential', object_type: 'AWS_ROLE', role_arn: 'arn:aws:iam::1:role/other' },
    ]

    function FormValues() {
      const { watch } = useFormContext()
      return (
        <>
          <output data-testid="value-credentials">{watch('credentials')}</output>
          <output data-testid="value-wide-permission-credentials">{watch('wide_permission_credentials')}</output>
        </>
      )
    }

    function FormValidity() {
      const {
        formState: { isValid },
      } = useFormContext()
      return <output data-testid="form-valid">{String(isValid)}</output>
    }

    const renderSettings = (
      defaultValues: Record<string, unknown>,
      settingsProps: Partial<ClusterCredentialsSettingsProps> = {}
    ) =>
      renderWithProviders(
        wrapWithReactHookForm(
          <>
            <ClusterCredentialsSettings
              {...props}
              isSetting
              cluster={eksManagedCluster}
              isWideCredentialsEnabled
              {...settingsProps}
            />
            <FormValues />
            <FormValidity />
          </>,
          { defaultValues }
        )
      )

    beforeEach(() => {
      useCloudProviderCredentialsMockSpy.mockReturnValue({ data: awsCredentials, isLoading: false })
    })

    it('should only warn about a redeploy for the restrictive credentials', () => {
      renderSettings({ credentials: 'static-1', using_restrictive_permissions: true })

      expect(screen.getByTestId('eks-credentials-change-warning')).toHaveTextContent(
        'Changing the restrictive credentials triggers a cluster redeployment'
      )
    })

    it('should not display the restrictive permissions toggle when wide credentials are disabled', () => {
      renderSettings({ credentials: 'static-1' }, { isWideCredentialsEnabled: false })

      expect(screen.queryByRole('switch', { name: 'Use restrictive permissions' })).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Extended credentials')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Credentials')).toBeInTheDocument()
    })

    it('should only display a single credentials select when restrictive permissions are off', () => {
      renderSettings({ credentials: 'static-1', using_restrictive_permissions: false })

      expect(screen.getByRole('switch', { name: 'Use restrictive permissions' })).not.toBeChecked()
      expect(screen.getByLabelText('Credentials')).toBeInTheDocument()
      expect(screen.queryByLabelText('Extended credentials')).not.toBeInTheDocument()
    })

    it('should display restrictive and extended credentials selects when restrictive permissions are on', async () => {
      const { userEvent } = renderSettings({ credentials: 'static-1', using_restrictive_permissions: false })

      await userEvent.click(screen.getByRole('switch', { name: 'Use restrictive permissions' }))

      expect(screen.getByLabelText('Restrictive credentials')).toBeInTheDocument()
      expect(screen.getByLabelText('Extended credentials')).toBeInTheDocument()
    })

    it('should only list AWS role credentials in the extended credentials select', async () => {
      renderSettings({ credentials: '', wide_permission_credentials: '', using_restrictive_permissions: true })

      selectEvent.openMenu(screen.getByLabelText('Extended credentials'))

      expect(await screen.findByText('role-credential')).toBeInTheDocument()
      expect(screen.getByText('other-role-credential')).toBeInTheDocument()
      expect(screen.queryByText('static-credential (AKIA)')).not.toBeInTheDocument()
    })

    it('should keep the initial values when toggling restrictive permissions off and on', async () => {
      const { userEvent } = renderSettings({
        credentials: 'static-1',
        wide_permission_credentials: 'role-1',
        using_restrictive_permissions: true,
      })
      const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })

      await userEvent.click(toggle)
      expect(screen.queryByLabelText('Extended credentials')).not.toBeInTheDocument()
      expect(screen.getByText('static-credential (AKIA)')).toBeInTheDocument()

      await userEvent.click(toggle)
      expect(screen.getByText('static-credential (AKIA)')).toBeInTheDocument()
      expect(screen.getByText('role-credential')).toBeInTheDocument()
      expect(screen.getByTestId('value-credentials')).toHaveTextContent('static-1')
      expect(screen.getByTestId('value-wide-permission-credentials')).toHaveTextContent('role-1')
    })

    it('should require the extended credentials only while restrictive permissions are on', async () => {
      const { userEvent } = renderSettings({
        credentials: 'static-1',
        wide_permission_credentials: '',
        using_restrictive_permissions: false,
      })
      const toggle = screen.getByRole('switch', { name: 'Use restrictive permissions' })

      await waitFor(() => expect(screen.getByTestId('form-valid')).toHaveTextContent('true'))

      await userEvent.click(toggle)
      await waitFor(() => expect(screen.getByTestId('form-valid')).toHaveTextContent('false'))

      await userEvent.click(toggle)
      await waitFor(() => expect(screen.getByTestId('form-valid')).toHaveTextContent('true'))
    })

    it('should only allow creating an AWS role credential from the extended credentials select', async () => {
      const { userEvent } = renderSettings({
        credentials: 'static-1',
        wide_permission_credentials: '',
        using_restrictive_permissions: true,
      })

      await userEvent.click(screen.getByLabelText('Extended credentials'))
      await userEvent.click(await screen.findByText('New credential'))

      const modalProps = mockOpenModal.mock.calls[0][0].content.props
      expect(modalProps.allowedTypes).toEqual(['STS'])

      act(() => modalProps.onClose({ id: 'role-new' }))
      expect(screen.getByTestId('value-wide-permission-credentials')).toHaveTextContent('role-new')
      expect(screen.getByTestId('value-credentials')).toHaveTextContent('static-1')
    })
  })
})

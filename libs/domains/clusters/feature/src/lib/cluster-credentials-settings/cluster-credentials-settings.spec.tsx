import { act } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterCredentialsSettings, {
  type ClusterCredentialsSettingsProps,
  filterCredentialsByCloudProvider,
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

  it('should keep the cloud credentials link without a mirroring registry warning in cluster settings', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettings {...props} isSetting />))

    expect(screen.getByText('See and edit all Cloud credentials')).toBeInTheDocument()
    expect(screen.queryByText(/credential change won't be applied to the mirroring registry/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/credentials trigger.*cluster redeployment/i)).not.toBeInTheDocument()
  })

  it('should not display the mirroring registry warning outside cluster settings either', () => {
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
})

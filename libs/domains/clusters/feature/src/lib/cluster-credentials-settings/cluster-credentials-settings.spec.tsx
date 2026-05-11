import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
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

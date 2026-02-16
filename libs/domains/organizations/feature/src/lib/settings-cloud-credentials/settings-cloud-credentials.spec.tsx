import { type OrganizationCrendentialsResponseListResultsInner } from 'qovery-typescript-axios'
import { useDeleteCloudProviderCredential } from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useOrganizationCredentials } from '../hooks/use-organization-credentials/use-organization-credentials'
import { SettingsCloudCredentials } from './settings-cloud-credentials'

jest.mock('../hooks/use-organization-credentials/use-organization-credentials')
jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  ...jest.requireActual('@qovery/domains/cloud-providers/feature'),
  useDeleteCloudProviderCredential: jest.fn(),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

describe('SettingsCloudCredentials', () => {
  const useOrganizationCredentialsMock = useOrganizationCredentials as jest.MockedFunction<
    typeof useOrganizationCredentials
  >
  const useDeleteCloudProviderCredentialMock = useDeleteCloudProviderCredential as jest.MockedFunction<
    typeof useDeleteCloudProviderCredential
  >

  let mockCredentials: OrganizationCrendentialsResponseListResultsInner[] = []

  beforeEach(() => {
    mockCredentials = []
    useOrganizationCredentialsMock.mockReturnValue({
      data: mockCredentials,
    } as ReturnType<typeof useOrganizationCredentials>)
    useDeleteCloudProviderCredentialMock.mockReturnValue({
      mutate: jest.fn(),
    } as ReturnType<typeof useDeleteCloudProviderCredential>)
  })

  it('should render', () => {
    const { baseElement } = renderWithProviders(<SettingsCloudCredentials />)
    expect(baseElement).toBeTruthy()
  })

  it('should render an empty state when there are no credentials', () => {
    renderWithProviders(<SettingsCloudCredentials />)

    screen.getByText('All credentials related to your clusters will appear here after creation.')
  })

  it('should render used and unused credentials with actions', () => {
    mockCredentials = [
      {
        credential: {
          id: '1',
          name: 'Credential 1',
          object_type: 'AWS',
          access_key_id: '123',
        },
        clusters: [
          {
            id: '1',
            name: 'Cluster 1',
          },
        ],
      },
      {
        credential: {
          id: '2',
          name: 'Credential 2',
          object_type: 'GCP',
        },
        clusters: [],
      },
    ]
    useOrganizationCredentialsMock.mockReturnValue({
      data: mockCredentials,
    } as ReturnType<typeof useOrganizationCredentials>)

    renderWithProviders(<SettingsCloudCredentials />)

    screen.getByText('Configured credentials')
    screen.getByText('Unused credentials')
    screen.getByText('Credential 1')
    screen.getByText('Credential 2')

    expect(screen.getAllByTestId('view-credential')).toHaveLength(1)
    expect(screen.getAllByTestId('delete-credential')).toHaveLength(1)
    expect(screen.getByTestId('delete-credential')).toBeEnabled()
  })

  it('should show the cloud provider options in the create menu', async () => {
    const { userEvent } = renderWithProviders(<SettingsCloudCredentials />)

    await userEvent.click(screen.getByText('New credential'))

    expect(await screen.findByText('AWS')).toBeInTheDocument()
    expect(screen.getByText('GCP')).toBeInTheDocument()
    expect(screen.getByText('Azure')).toBeInTheDocument()
    expect(screen.getByText('Scaleway')).toBeInTheDocument()

    const awsItem = screen.getByText('AWS').closest('[role="menuitem"]')
    expect(awsItem).toHaveClass('text-neutral')
  })
})

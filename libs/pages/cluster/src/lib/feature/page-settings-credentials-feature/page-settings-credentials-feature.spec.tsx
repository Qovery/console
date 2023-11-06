import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as organizationDomain from '@qovery/domains/organization'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { clusterFactoryMock, credentialsMock } from '@qovery/shared/factories'
import { type ClusterCredentialsEntity, type ClusterEntity } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsCredentialsFeature, { handleSubmit } from './page-settings-credentials-feature'

import SpyInstance = jest.SpyInstance

const mockCluster: ClusterEntity = clusterFactoryMock(1, CloudProviderEnum.AWS)[0]
const mockCredentials: ClusterCredentialsEntity[] = credentialsMock(2)
const useCloudProviderCredentialsMockSpy = jest.spyOn(organizationsDomain, 'useCloudProviderCredentials') as jest.Mock

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    getClusterState: () => ({
      loadingStatus: 'loaded',
      ids: [mockCluster.id],
      entities: {
        [mockCluster.id]: mockCluster,
      },
      error: null,
    }),
    selectClusterById: () => mockCluster,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: () => ({
    watch: () => jest.fn(),
    formState: {
      isValid: true,
    },
  }),
}))

describe('PageSettingsCredentialsFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve([
          {
            short_name: CloudProviderEnum.AWS,
            regions: [
              {
                name: 'Paris',
              },
            ],
          },
        ]),
    }))
    useCloudProviderCredentialsMockSpy.mockReturnValue({
      data: [
        {
          name: 'my-credential',
          id: '000-000-000',
        },
      ],
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsCredentialsFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the credential with fields', () => {
    const cloneClusterProviderInfo = handleSubmit(
      {
        credentials: mockCredentials[0].id,
      },
      mockCredentials,
      mockCluster
    )

    expect(cloneClusterProviderInfo.cloud_provider).toBe(mockCluster.cloud_provider)
    expect(cloneClusterProviderInfo.credentials).toStrictEqual({
      id: mockCredentials[0].id,
      name: mockCredentials[0].name,
    })
    expect(cloneClusterProviderInfo.region).toBe(mockCluster.region)
  })

  it('should dispatch postCloudProviderInfo if form is submitted', async () => {
    const postCloudProviderInfoSpy: SpyInstance = jest.spyOn(organizationDomain, 'postCloudProviderInfo')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { userEvent } = renderWithProviders(<PageSettingsCredentialsFeature />)
    screen.getByTestId('input-credentials')
    const realSelect = screen.getByLabelText('Credentials')

    await selectEvent.select(realSelect, 'my-credential')

    expect(screen.getByTestId('submit-button')).not.toBeDisabled()

    await userEvent.click(screen.getByTestId('submit-button'))

    const cloneClusterProviderInfo = handleSubmit(
      {
        credentials: '000-000-000',
      },
      [
        {
          name: 'my-credential',
          id: '000-000-000',
        },
      ],
      mockCluster
    )

    expect(postCloudProviderInfoSpy.mock.calls[0][0].organizationId).toStrictEqual('0')
    expect(postCloudProviderInfoSpy.mock.calls[0][0].clusterId).toStrictEqual(mockCluster.id)
    expect(postCloudProviderInfoSpy.mock.calls[0][0].clusterCloudProviderInfo).toStrictEqual(cloneClusterProviderInfo)
  })
})

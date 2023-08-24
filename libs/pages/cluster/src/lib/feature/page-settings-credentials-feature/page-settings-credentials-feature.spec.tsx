import { act, render, waitFor } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as storeOrganization from '@qovery/domains/organization'
import { clusterFactoryMock, credentialsMock, organizationFactoryMock } from '@qovery/shared/factories'
import { type ClusterCredentialsEntity, type ClusterEntity, type OrganizationEntity } from '@qovery/shared/interfaces'
import PageSettingsCredentialsFeature, { handleSubmit } from './page-settings-credentials-feature'

import SpyInstance = jest.SpyInstance

const mockCluster: ClusterEntity = clusterFactoryMock(1, CloudProviderEnum.AWS)[0]
const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]
const mockCredentials: ClusterCredentialsEntity[] = credentialsMock(2)

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
    getOrganizationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockOrganization.id],
      entities: {
        [mockOrganization.id]: mockOrganization,
      },
      error: null,
    }),
    selectOrganizationById: () => mockOrganization,
    fetchCredentialsList: () => mockCredentials,
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
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsCredentialsFeature />)
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
    const postCloudProviderInfoSpy: SpyInstance = jest.spyOn(storeOrganization, 'postCloudProviderInfo')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId, getByLabelText } = render(<PageSettingsCredentialsFeature />)
    getByTestId('input-credentials')
    const realSelect = getByLabelText('Credentials')

    const item = (mockOrganization.credentials?.items && mockOrganization.credentials?.items[0].id) || ''

    await waitFor(() => {
      selectEvent.select(realSelect, item)
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const cloneClusterProviderInfo = handleSubmit(
      {
        credentials: item,
      },
      mockOrganization.credentials?.items,
      mockCluster
    )

    expect(postCloudProviderInfoSpy.mock.calls[0][0].organizationId).toStrictEqual('0')
    expect(postCloudProviderInfoSpy.mock.calls[0][0].clusterId).toStrictEqual(mockCluster.id)
    expect(postCloudProviderInfoSpy.mock.calls[0][0].clusterCloudProviderInfo).toStrictEqual(cloneClusterProviderInfo)
  })
})

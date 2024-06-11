import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock, credentialsMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsCredentialsFeature, { handleSubmit } from './page-settings-credentials-feature'

const mockCluster = clusterFactoryMock(1, CloudProviderEnum.AWS)[0]
const mockCredentials = credentialsMock(2)
const useClusterCloudProviderInfoSpy = jest.spyOn(clustersDomain, 'useClusterCloudProviderInfo') as jest.Mock
const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock
const useEditCloudProviderInfoMockSpy = jest.spyOn(clustersDomain, 'useEditCloudProviderInfo') as jest.Mock

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

const cloudProviderInfo = {
  cloud_provider: CloudProviderEnum.AWS,
  credentials: {
    id: '0',
    name: 'credentials',
  },
  region: 'eu-west',
}

describe('PageSettingsCredentialsFeature', () => {
  const editCloudProviderInfo = jest.fn()
  beforeEach(() => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({
      data: [
        {
          name: 'my-credential',
          id: '000-000-000',
        },
      ],
    })
    useClusterCloudProviderInfoSpy.mockReturnValue({
      data: cloudProviderInfo,
    })
    useEditCloudProviderInfoMockSpy.mockReturnValue({
      mutateAsync: editCloudProviderInfo,
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

  it('should post CloudProviderInfo if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsCredentialsFeature />)
    screen.getByTestId('input-credentials')
    const realSelect = screen.getByLabelText('Credentials')

    await selectEvent.select(realSelect, 'my-credential')

    expect(screen.getByTestId('submit-button')).toBeEnabled()

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
      cloudProviderInfo
    )

    expect(editCloudProviderInfo).toHaveBeenCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      cloudProviderInfoRequest: cloneClusterProviderInfo,
    })
  })
})

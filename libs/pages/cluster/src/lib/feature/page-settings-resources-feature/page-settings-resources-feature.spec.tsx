import { KubernetesEnum } from 'qovery-typescript-axios'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

const useClusterMockSpy = jest.spyOn(clustersDomain, 'useCluster') as jest.Mock
const useEditClusterMockSpy = jest.spyOn(clustersDomain, 'useEditCluster') as jest.Mock
const useCloudProviderInstanceTypesMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useCloudProviderInstanceTypes'
) as jest.Mock

const mockInstanceType = [
  {
    name: 't2.micro',
    cpu: 1,
    ram_in_gb: 1,
    type: 't2.micro',
    architecture: 'arm64',
  },
  {
    name: 't2.small',
    cpu: 1,
    ram_in_gb: 2,
    type: 't2.small',
    architecture: 'arm64',
  },
  {
    name: 't2.medium',
    cpu: 2,
    ram_in_gb: 4,
    type: 't2.medium',
    architecture: 'x86_64',
  },
]

const mockCluster = clusterFactoryMock(1)[0]
mockCluster.kubernetes = KubernetesEnum.MANAGED
mockCluster.instance_type = 't2.micro'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsResourcesFeature', () => {
  const editCluster = jest.fn()
  beforeEach(() => {
    useClusterMockSpy.mockReturnValue({
      data: mockCluster,
      isLoading: false,
    })
    useEditClusterMockSpy.mockReturnValue({
      mutate: editCluster,
    })
    useCloudProviderInstanceTypesMockSpy.mockReturnValue({
      data: mockInstanceType,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should init the value in the inputs', async () => {
    renderWithProviders(<PageSettingsResourcesFeature />)

    screen.getByDisplayValue(mockCluster.disk_size?.toString() || '')
    screen.getByText(`min ${mockCluster?.min_running_nodes} - max ${mockCluster?.max_running_nodes}`)

    await screen.findByText('t2.micro (1CPU - 1GB RAM - arm64)')
  })

  it('should submit the values', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsResourcesFeature />)
    const button = screen.getByTestId('submit-button')

    expect(button).toBeDisabled()

    const input = screen.getByLabelText('Disk size (GB)')
    await userEvent.clear(input)
    await userEvent.type(input, '24')

    expect(button).not.toBeDisabled()

    const cloneCluster = handleSubmit(
      {
        disk_size: '24',
        nodes: [mockCluster.min_running_nodes, mockCluster.max_running_nodes],
        instance_type: 't2.micro',
      },
      mockCluster
    )

    await userEvent.click(button)

    expect(editCluster).toBeCalledWith({
      organizationId: '0',
      clusterId: mockCluster.id,
      clusterRequest: cloneCluster,
    })
  })
})

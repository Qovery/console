import {
  act,
  fireEvent,
  getByDisplayValue,
  getByLabelText,
  getByTestId,
  getByText,
  render,
  waitFor,
} from '__tests__/utils/setup-jest'
import { KubernetesEnum } from 'qovery-typescript-axios'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
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
      mutateAsync: editCluster,
    })
    useCloudProviderInstanceTypesMockSpy.mockReturnValue({
      data: mockInstanceType,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should init the value in the inputs', async () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)

    getByDisplayValue(baseElement, mockCluster.disk_size?.toString() || '')
    getByText(baseElement, `min ${mockCluster?.min_running_nodes} - max ${mockCluster?.max_running_nodes}`)

    await waitFor(() => {
      getByText(baseElement, 't2.micro (1CPU - 1GB RAM - arm64)')
    })
  })

  it('should submit the values', async () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    const button = getByTestId(baseElement, 'submit-button')

    expect(button).toBeDisabled()

    const input = getByLabelText(baseElement, 'Disk size (GB)')
    await act(() => {
      fireEvent.input(input, { target: { value: 24 } })
    })

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })

    const cloneCluster = handleSubmit(
      {
        disk_size: '24',
        nodes: [mockCluster.min_running_nodes, mockCluster.max_running_nodes],
        instance_type: 't2.micro',
      },
      mockCluster
    )

    await waitFor(() => {
      button.click()

      expect(editCluster).toBeCalledWith({
        organizationId: '0',
        clusterId: mockCluster.id,
        clusterRequest: cloneCluster,
      })
    })
  })
})

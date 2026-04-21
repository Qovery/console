import { type KarpenterNodePool, KubernetesEnum } from 'qovery-typescript-axios'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import * as clustersDomain from '@qovery/domains/clusters/feature'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsResourcesFeature, { backfillNodepoolSpot, handleSubmit } from './page-settings-resources-feature'

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

  describe('backfillNodepoolSpot', () => {
    const basePools = {
      requirements: [],
      stable_override: { consolidate_after_in_seconds: 30 },
      default_override: { consolidate_after_in_seconds: 60 },
      gpu_override: {
        requirements: [],
        disk_size_in_gib: 100,
        spot_enabled: true,
      },
      cronjob_override: { consolidate_after_in_seconds: 30 },
    } as unknown as KarpenterNodePool

    it('fills missing per-pool spot_enabled from cluster-level true', () => {
      const result = backfillNodepoolSpot(basePools, true) as unknown as Record<string, { spot_enabled?: boolean }>
      expect(result['stable_override'].spot_enabled).toBe(true)
      expect(result['default_override'].spot_enabled).toBe(true)
      expect(result['cronjob_override'].spot_enabled).toBe(true)
    })

    it('fills missing per-pool spot_enabled from cluster-level false', () => {
      const result = backfillNodepoolSpot(basePools, false) as unknown as Record<string, { spot_enabled?: boolean }>
      expect(result['stable_override'].spot_enabled).toBe(false)
      expect(result['default_override'].spot_enabled).toBe(false)
      expect(result['cronjob_override'].spot_enabled).toBe(false)
    })

    it('preserves explicit per-pool spot_enabled false against cluster-level true', () => {
      const pools = {
        ...basePools,
        stable_override: { consolidate_after_in_seconds: 30, spot_enabled: false },
      } as unknown as KarpenterNodePool
      const result = backfillNodepoolSpot(pools, true) as unknown as Record<string, { spot_enabled?: boolean }>
      expect(result['stable_override'].spot_enabled).toBe(false)
    })

    it('preserves explicit per-pool spot_enabled true against cluster-level false', () => {
      // gpu_override in basePools already has spot_enabled: true
      const result = backfillNodepoolSpot(basePools, false) as unknown as Record<string, { spot_enabled?: boolean }>
      expect(result['gpu_override'].spot_enabled).toBe(true)
    })

    it('leaves absent overrides undefined (does not materialize an empty override)', () => {
      const pools = { requirements: [] } as unknown as KarpenterNodePool
      const result = backfillNodepoolSpot(pools, true)
      expect(result.stable_override).toBeUndefined()
      expect(result.default_override).toBeUndefined()
      expect(result.gpu_override).toBeUndefined()
      expect(result.cronjob_override).toBeUndefined()
    })
  })

  it('should submit the values', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsResourcesFeature />)
    const button = screen.getByTestId('submit-button')

    const input = screen.getByLabelText('Disk size (GB)')
    await userEvent.clear(input)
    await userEvent.type(input, '24')

    expect(button).toBeEnabled()

    const cloneCluster = handleSubmit(
      {
        disk_size: '24',
        nodes: [mockCluster.min_running_nodes, mockCluster.max_running_nodes],
        instance_type: 't2.micro',
      },
      mockCluster
    )

    await userEvent.click(button)

    expect(editCluster).toHaveBeenCalledWith({
      organizationId: '123',
      clusterId: mockCluster.id,
      clusterRequest: cloneCluster,
    })
  })
})

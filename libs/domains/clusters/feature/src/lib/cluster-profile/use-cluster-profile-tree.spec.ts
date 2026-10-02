import { renderHook } from '@qovery/shared/util-tests'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformConfiguration } from '../platform-configuration/hooks/use-platform-configuration'
import { useClusterProfileTree } from './use-cluster-profile-tree'

jest.mock('../hooks/use-cluster/use-cluster')
jest.mock('../hooks/use-platform-templates/use-platform-templates')
jest.mock('../platform-configuration/hooks/use-platform-configuration')

const mockUseCluster = useCluster as jest.Mock
const mockUsePlatformTemplates = usePlatformTemplates as jest.Mock
const mockUsePlatformConfiguration = usePlatformConfiguration as jest.Mock

const props = { organizationId: 'organization-id', clusterId: 'cluster-id' }

describe('useClusterProfileTree', () => {
  beforeEach(() => {
    mockUseCluster.mockReturnValue({
      data: { kubernetes: 'SELF_MANAGED', cloud_provider: 'AWS' },
      isError: false,
      isLoading: false,
    })
    mockUsePlatformTemplates.mockReturnValue({ data: undefined, isError: false, isLoading: true })
    mockUsePlatformConfiguration.mockReturnValue({ data: null, isError: false, isLoading: false })
  })

  it('waits for the templates of a supported cluster', () => {
    const { result } = renderHook(() => useClusterProfileTree(props))

    expect(mockUsePlatformTemplates).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }))
    expect(result.current.isLoading).toBe(true)
  })

  it('stops loading when the cluster request fails', () => {
    mockUseCluster.mockReturnValue({ data: undefined, isError: true, isLoading: false })
    const { result } = renderHook(() => useClusterProfileTree(props))

    expect(mockUsePlatformTemplates).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    expect(result.current).toMatchObject({ isLoading: false, isError: true })
  })

  it('stops loading for a cluster without platform mode', () => {
    mockUseCluster.mockReturnValue({
      data: { kubernetes: 'PARTIALLY_MANAGED', cloud_provider: 'AWS' },
      isError: false,
      isLoading: false,
    })
    const { result } = renderHook(() => useClusterProfileTree(props))

    expect(result.current).toMatchObject({ isLoading: false, isError: false, profileTree: [] })
  })
})

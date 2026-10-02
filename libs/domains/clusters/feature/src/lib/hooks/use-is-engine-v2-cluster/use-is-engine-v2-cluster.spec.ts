import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { renderHook } from '@qovery/shared/util-tests'
import { useClusterOperatorStatus } from '../use-cluster-operator-status/use-cluster-operator-status'
import { useIsEngineV2Cluster } from './use-is-engine-v2-cluster'

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('../use-cluster-operator-status/use-cluster-operator-status')

const mockUseFeatureFlagEnabled = useFeatureFlagEnabled as jest.Mock
const mockUseClusterOperatorStatus = useClusterOperatorStatus as jest.Mock

const cluster = {
  id: 'cluster-id',
  organization: { id: 'organization-id' },
  kubernetes: 'SELF_MANAGED',
} as Pick<Cluster, 'id' | 'organization' | 'kubernetes'>

describe('useIsEngineV2Cluster', () => {
  beforeEach(() => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    mockUseClusterOperatorStatus.mockReturnValue({ data: { status: 'CURRENT' } })
  })

  it('detects a self-managed cluster attached to the Operator', () => {
    const { result } = renderHook(() => useIsEngineV2Cluster(cluster))

    expect(result.current).toBe(true)
  })

  it('ignores clusters not attached to the Operator', () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: { status: 'NOT_ATTACHED' } })
    const { result } = renderHook(() => useIsEngineV2Cluster(cluster))

    expect(result.current).toBe(false)
  })

  it('ignores a cached Operator status while the feature flag is disabled', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(false)
    const { result } = renderHook(() => useIsEngineV2Cluster(cluster))

    expect(mockUseClusterOperatorStatus).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    expect(result.current).toBe(false)
  })

  it('ignores a cached Operator status for managed clusters', () => {
    const { result } = renderHook(() => useIsEngineV2Cluster({ ...cluster, kubernetes: 'MANAGED' }))

    expect(result.current).toBe(false)
  })
})

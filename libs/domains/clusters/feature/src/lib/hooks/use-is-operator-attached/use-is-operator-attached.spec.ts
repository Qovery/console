import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Cluster } from 'qovery-typescript-axios'
import { renderHook } from '@qovery/shared/util-tests'
import { useClusterOperatorStatus } from '../use-cluster-operator-status/use-cluster-operator-status'
import { useIsOperatorAttached } from './use-is-operator-attached'

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('../use-cluster-operator-status/use-cluster-operator-status')

const mockUseFeatureFlagEnabled = useFeatureFlagEnabled as jest.Mock
const mockUseClusterOperatorStatus = useClusterOperatorStatus as jest.Mock

const cluster = {
  id: 'cluster-id',
  organization: { id: 'organization-id' },
  kubernetes: 'SELF_MANAGED',
} as Pick<Cluster, 'id' | 'organization' | 'kubernetes'>

describe('useIsOperatorAttached', () => {
  beforeEach(() => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
    mockUseClusterOperatorStatus.mockReturnValue({ data: { status: 'CURRENT' } })
  })

  it('detects a self-managed cluster attached to the Operator', () => {
    const { result } = renderHook(() => useIsOperatorAttached(cluster))

    expect(result.current).toBe(true)
  })

  it('ignores clusters not attached to the Operator', () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: { status: 'NOT_ATTACHED' } })
    const { result } = renderHook(() => useIsOperatorAttached(cluster))

    expect(result.current).toBe(false)
  })

  it('ignores a cached Operator status while the feature flag is disabled', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(false)
    const { result } = renderHook(() => useIsOperatorAttached(cluster))

    expect(mockUseClusterOperatorStatus).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    expect(result.current).toBe(false)
  })

  it('ignores a cached Operator status for managed clusters', () => {
    const { result } = renderHook(() => useIsOperatorAttached({ ...cluster, kubernetes: 'MANAGED' }))

    expect(result.current).toBe(false)
  })

  it('ignores self-managed clusters without Operator state', () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: null })
    const { result } = renderHook(() => useIsOperatorAttached(cluster))

    expect(result.current).toBe(false)
  })

  it('is unknown while the feature flags are loading', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(undefined)
    const { result } = renderHook(() => useIsOperatorAttached(cluster))

    expect(result.current).toBeUndefined()
  })

  it('is unknown while the cluster is loading', () => {
    const { result } = renderHook(() => useIsOperatorAttached(undefined))

    expect(mockUseClusterOperatorStatus).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    expect(result.current).toBeUndefined()
  })

  it('is unknown while the Operator status is loading', () => {
    mockUseClusterOperatorStatus.mockReturnValue({ data: undefined, isLoading: true })
    const { result } = renderHook(() => useIsOperatorAttached(cluster))

    expect(result.current).toBeUndefined()
  })
})

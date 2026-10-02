import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@qovery/shared/util-tests'
import { useClusterOperatorStatus } from './use-cluster-operator-status'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

const mockUseQuery = useQuery as jest.Mock

describe('useClusterOperatorStatus', () => {
  it('stops polling once the cluster is known to have no Operator', () => {
    renderHook(() =>
      useClusterOperatorStatus({ organizationId: 'org-123', clusterId: 'cluster-123', refetchInterval: 30_000 })
    )

    const { refetchInterval } = mockUseQuery.mock.calls[0][0]
    expect(refetchInterval({ status: 'CURRENT' })).toBe(30_000)
    expect(refetchInterval(undefined)).toBe(30_000)
    expect(refetchInterval(null)).toBe(false)
  })

  it('does not poll without interval', () => {
    renderHook(() => useClusterOperatorStatus({ organizationId: 'org-123', clusterId: 'cluster-123' }))

    expect(mockUseQuery.mock.calls.at(-1)[0].refetchInterval).toBeUndefined()
  })
})

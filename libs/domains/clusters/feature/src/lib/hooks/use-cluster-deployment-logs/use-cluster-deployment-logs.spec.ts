import { useQuery } from '@tanstack/react-query'
import { getClusterDeploymentLogsRefetchInterval, useClusterDeploymentLogs } from './use-cluster-deployment-logs'

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}))

jest.mock('@qovery/state/util-queries', () => ({
  queries: {
    clusters: {
      deploymentLogs: jest.fn(() => ({ queryKey: [], queryFn: jest.fn() })),
    },
  },
}))

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

describe('useClusterDeploymentLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not poll historical deployment logs by default', () => {
    useClusterDeploymentLogs({ organizationId: 'org-1', clusterId: 'cluster-1', deploymentId: 'deployment-1' })

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchInterval: false,
      })
    )
  })

  it.each(['QUEUED', 'ONGOING', 'CANCELING', 'EXECUTING'] as const)('polls logs while a deployment is %s', (status) => {
    expect(getClusterDeploymentLogsRefetchInterval(status)).toBe(3000)
  })

  it.each(['SUCCESS', 'ERROR', 'CANCELED', 'NEVER'] as const)(
    'stops polling logs when a deployment is %s',
    (status) => {
      expect(getClusterDeploymentLogsRefetchInterval(status)).toBe(false)
    }
  )
})

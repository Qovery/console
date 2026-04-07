import { renderWithProviders } from '@qovery/shared/util-tests'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'
import { ClusterServiceRunningStatusSockets } from './cluster-service-running-status-sockets'
import { useClusterServiceRunningStatusSocket } from './use-cluster-service-running-status-socket'

jest.mock('../use-environments-by-cluster/use-environments-by-cluster')
jest.mock('./use-cluster-service-running-status-socket')

const mockUseEnvironmentsByCluster = jest.mocked(useEnvironmentsByCluster)
const mockUseClusterServiceRunningStatusSocket = jest.mocked(useClusterServiceRunningStatusSocket)

describe('ClusterServiceRunningStatusSockets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should open one service running status socket per unique project in the cluster', () => {
    mockUseEnvironmentsByCluster.mockReturnValue({
      data: [
        {
          environment_id: 'env-1',
          environment_name: 'Production',
          project_id: 'project-b',
          project_name: 'Backoffice',
          services: [],
        },
        {
          environment_id: 'env-2',
          environment_name: 'Billing',
          project_id: 'project-a',
          project_name: 'API',
          services: [],
        },
        {
          environment_id: 'env-3',
          environment_name: 'Staging',
          project_id: 'project-a',
          project_name: 'API',
          services: [],
        },
      ],
    } as ReturnType<typeof useEnvironmentsByCluster>)

    renderWithProviders(<ClusterServiceRunningStatusSockets organizationId="org-1" clusterId="cluster-1" />)

    expect(mockUseClusterServiceRunningStatusSocket).toHaveBeenCalledTimes(2)
    expect(mockUseClusterServiceRunningStatusSocket).toHaveBeenNthCalledWith(1, {
      organizationId: 'org-1',
      clusterId: 'cluster-1',
      projectId: 'project-a',
    })
    expect(mockUseClusterServiceRunningStatusSocket).toHaveBeenNthCalledWith(2, {
      organizationId: 'org-1',
      clusterId: 'cluster-1',
      projectId: 'project-b',
    })
  })
})

import { renderWithProviders } from '@qovery/shared/util-tests'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'
import { ClusterServiceDeploymentStatusSockets } from './cluster-service-deployment-status-sockets'
import { useClusterServiceDeploymentStatusSocket } from './use-cluster-service-deployment-status-socket'

jest.mock('../use-environments-by-cluster/use-environments-by-cluster')
jest.mock('./use-cluster-service-deployment-status-socket')

const mockUseEnvironmentsByCluster = jest.mocked(useEnvironmentsByCluster)
const mockUseClusterServiceDeploymentStatusSocket = jest.mocked(useClusterServiceDeploymentStatusSocket)

describe('ClusterServiceDeploymentStatusSockets', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should open one deployment status socket per environment with services in the cluster', () => {
    mockUseEnvironmentsByCluster.mockReturnValue({
      data: [
        {
          environment_id: 'env-2',
          environment_name: 'Production',
          project_id: 'project-b',
          project_name: 'Backoffice',
          services: [{ id: 'service-2', name: 'api', type: 'APPLICATION' }],
        },
        {
          environment_id: 'env-1',
          environment_name: 'Billing',
          project_id: 'project-a',
          project_name: 'API',
          services: [{ id: 'service-1', name: 'gateway', type: 'APPLICATION' }],
        },
        {
          environment_id: 'env-3',
          environment_name: 'Empty',
          project_id: 'project-c',
          project_name: 'Empty',
          services: [],
        },
      ],
    } as ReturnType<typeof useEnvironmentsByCluster>)

    renderWithProviders(<ClusterServiceDeploymentStatusSockets organizationId="org-1" clusterId="cluster-1" />)

    expect(mockUseClusterServiceDeploymentStatusSocket).toHaveBeenCalledTimes(2)
    expect(mockUseClusterServiceDeploymentStatusSocket).toHaveBeenNthCalledWith(1, {
      organizationId: 'org-1',
      clusterId: 'cluster-1',
      projectId: 'project-a',
      environmentId: 'env-1',
    })
    expect(mockUseClusterServiceDeploymentStatusSocket).toHaveBeenNthCalledWith(2, {
      organizationId: 'org-1',
      clusterId: 'cluster-1',
      projectId: 'project-b',
      environmentId: 'env-2',
    })
  })
})

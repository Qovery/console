import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ClusterEnvironmentResponse, type Status } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { queries } from '@qovery/state/util-queries'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'
import { useClusterDeploymentErrorServices } from './use-cluster-deployment-error-services'

jest.mock('../use-environments-by-cluster/use-environments-by-cluster')

const mockUseEnvironmentsByCluster = jest.mocked(useEnvironmentsByCluster)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const environmentsByCluster: ClusterEnvironmentResponse[] = [
  {
    environment_id: 'env-1',
    environment_name: 'Production',
    project_id: 'project-1',
    project_name: 'App',
    services: [
      { id: 'service-1', name: 'api', type: 'APPLICATION' },
      { id: 'service-2', name: 'worker', type: 'APPLICATION' },
      { id: 'service-3', name: 'cron', type: 'JOB' },
    ],
  },
  {
    environment_id: 'env-2',
    environment_name: 'Billing',
    project_id: 'project-2',
    project_name: 'Backoffice',
    services: [
      { id: 'service-4', name: 'gateway', type: 'APPLICATION' },
      { id: 'service-5', name: 'db', type: 'DATABASE' },
    ],
  },
  {
    environment_id: 'env-3',
    environment_name: 'Analytics',
    project_id: 'project-3',
    project_name: 'Data',
    services: [{ id: 'service-6', name: 'etl', type: 'APPLICATION' }],
  },
]

function setServiceDeploymentState(
  queryClient: QueryClient,
  environmentId: string,
  serviceId: string,
  state: Status['state']
) {
  queryClient.setQueryData(queries.services.deploymentStatus(environmentId, serviceId).queryKey, {
    id: serviceId,
    state,
  })
}

describe('useClusterDeploymentErrorServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEnvironmentsByCluster.mockReturnValue({
      data: environmentsByCluster,
    } as ReturnType<typeof useEnvironmentsByCluster>)
  })

  it('should expose deployment error services and apply compact truncation', async () => {
    const queryClient = new QueryClient()

    setServiceDeploymentState(queryClient, 'env-1', 'service-1', 'DEPLOYMENT_ERROR')
    setServiceDeploymentState(queryClient, 'env-1', 'service-2', 'BUILD_ERROR')
    setServiceDeploymentState(queryClient, 'env-1', 'service-3', 'INVALID_CREDENTIALS')
    setServiceDeploymentState(queryClient, 'env-2', 'service-4', 'STOP_ERROR')
    setServiceDeploymentState(queryClient, 'env-2', 'service-5', 'DELETE_ERROR')
    setServiceDeploymentState(queryClient, 'env-3', 'service-6', 'RESTART_ERROR')

    const { result } = renderHook(
      () => useClusterDeploymentErrorServices({ organizationId: 'org-1', clusterId: 'cluster-1' }),
      {
        wrapper: createWrapper(queryClient),
      }
    )

    await waitFor(() => {
      expect(result.current.errorServiceCount).toBe(6)
    })

    expect(result.current.serviceCount).toBe(6)
    expect(result.current.errorServices).toEqual([
      {
        environmentId: 'env-1',
        environmentName: 'Production',
        projectId: 'project-1',
        projectName: 'App',
        serviceId: 'service-1',
        serviceName: 'api',
        state: 'DEPLOYMENT_ERROR',
        stateLabel: 'Deployment error',
      },
      {
        environmentId: 'env-1',
        environmentName: 'Production',
        projectId: 'project-1',
        projectName: 'App',
        serviceId: 'service-2',
        serviceName: 'worker',
        state: 'BUILD_ERROR',
        stateLabel: 'Build error',
      },
      {
        environmentId: 'env-1',
        environmentName: 'Production',
        projectId: 'project-1',
        projectName: 'App',
        serviceId: 'service-3',
        serviceName: 'cron',
        state: 'INVALID_CREDENTIALS',
        stateLabel: 'Invalid credentials',
      },
      {
        environmentId: 'env-2',
        environmentName: 'Billing',
        projectId: 'project-2',
        projectName: 'Backoffice',
        serviceId: 'service-4',
        serviceName: 'gateway',
        state: 'STOP_ERROR',
        stateLabel: 'Stop error',
      },
      {
        environmentId: 'env-2',
        environmentName: 'Billing',
        projectId: 'project-2',
        projectName: 'Backoffice',
        serviceId: 'service-5',
        serviceName: 'db',
        state: 'DELETE_ERROR',
        stateLabel: 'Delete error',
      },
    ])
    expect(result.current.hiddenErrorServiceCount).toBe(1)
  })

  it('should ignore deployment statuses that are not errors', async () => {
    const queryClient = new QueryClient()

    setServiceDeploymentState(queryClient, 'env-1', 'service-1', 'DEPLOYED')
    setServiceDeploymentState(queryClient, 'env-1', 'service-2', 'READY')
    setServiceDeploymentState(queryClient, 'env-1', 'service-3', 'DEPLOYING')

    const { result } = renderHook(
      () => useClusterDeploymentErrorServices({ organizationId: 'org-1', clusterId: 'cluster-1' }),
      {
        wrapper: createWrapper(queryClient),
      }
    )

    await waitFor(() => {
      expect(result.current.serviceCount).toBe(6)
    })

    expect(result.current.errorServiceCount).toBe(0)
    expect(result.current.errorServices).toEqual([])
    expect(result.current.hiddenErrorServiceCount).toBe(0)
  })
})

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { type ClusterEnvironmentResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { queries } from '@qovery/state/util-queries'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'
import { useClusterRunningErrorServices } from './use-cluster-running-error-services'

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

function setServiceRunningState(
  queryClient: QueryClient,
  environmentId: string,
  serviceId: string,
  state: 'ERROR' | 'RUNNING'
) {
  queryClient.setQueryData(queries.services.runningStatus(environmentId, serviceId).queryKey, {
    id: serviceId,
    certificates: [],
    pods: [],
    scaled_object: null,
    state,
  })
}

describe('useClusterRunningErrorServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEnvironmentsByCluster.mockReturnValue({
      data: environmentsByCluster,
    } as ReturnType<typeof useEnvironmentsByCluster>)
  })

  it('should expose error services and apply compact truncation', async () => {
    const queryClient = new QueryClient()

    setServiceRunningState(queryClient, 'env-1', 'service-1', 'ERROR')
    setServiceRunningState(queryClient, 'env-1', 'service-2', 'ERROR')
    setServiceRunningState(queryClient, 'env-1', 'service-3', 'ERROR')
    setServiceRunningState(queryClient, 'env-2', 'service-4', 'ERROR')
    setServiceRunningState(queryClient, 'env-2', 'service-5', 'ERROR')
    setServiceRunningState(queryClient, 'env-3', 'service-6', 'ERROR')

    const { result } = renderHook(
      () => useClusterRunningErrorServices({ organizationId: 'org-1', clusterId: 'cluster-1' }),
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
      },
      {
        environmentId: 'env-1',
        environmentName: 'Production',
        projectId: 'project-1',
        projectName: 'App',
        serviceId: 'service-2',
        serviceName: 'worker',
      },
      {
        environmentId: 'env-1',
        environmentName: 'Production',
        projectId: 'project-1',
        projectName: 'App',
        serviceId: 'service-3',
        serviceName: 'cron',
      },
      {
        environmentId: 'env-2',
        environmentName: 'Billing',
        projectId: 'project-2',
        projectName: 'Backoffice',
        serviceId: 'service-4',
        serviceName: 'gateway',
      },
      {
        environmentId: 'env-2',
        environmentName: 'Billing',
        projectId: 'project-2',
        projectName: 'Backoffice',
        serviceId: 'service-5',
        serviceName: 'db',
      },
    ])
    expect(result.current.hiddenErrorServiceCount).toBe(1)
  })

  it('should hide stale errors when the cluster running status socket is closed', async () => {
    const queryClient = new QueryClient()

    setServiceRunningState(queryClient, 'env-1', 'service-1', 'ERROR')
    queryClient.setQueryData(queries.environments.checkRunningStatusClosed('cluster-1').queryKey, {
      clusterId: 'cluster-1',
      reason: 'NotFound: cluster status unavailable',
    })

    const { result } = renderHook(
      () => useClusterRunningErrorServices({ organizationId: 'org-1', clusterId: 'cluster-1' }),
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

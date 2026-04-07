import { useQueries, useQuery } from '@tanstack/react-query'
import { type ClusterEnvironmentResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { queries } from '@qovery/state/util-queries'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'

const MAX_DISPLAYED_ERROR_SERVICES = 5

interface ClusterServiceDescriptor {
  environmentId: string
  environmentName: string
  projectId: string
  projectName: string
  serviceId: string
  serviceName: string
}

export interface ClusterRunningErrorServiceItem {
  environmentId: string
  environmentName: string
  projectId: string
  projectName: string
  serviceId: string
  serviceName: string
}

export interface UseClusterRunningErrorServicesProps {
  organizationId: string
  clusterId: string
}

function getClusterServices(environments: ClusterEnvironmentResponse[]): ClusterServiceDescriptor[] {
  return environments.flatMap(({ environment_id, environment_name, project_id, project_name, services }) =>
    services.map(({ id, name }) => ({
      environmentId: environment_id,
      environmentName: environment_name,
      projectId: project_id,
      projectName: project_name,
      serviceId: id,
      serviceName: name,
    }))
  )
}

export function useClusterRunningErrorServices({ organizationId, clusterId }: UseClusterRunningErrorServicesProps) {
  const { data: environments = [] } = useEnvironmentsByCluster({
    organizationId,
    clusterId,
  })

  const { data: checkRunningStatusClosed } = useQuery({
    ...queries.environments.checkRunningStatusClosed(clusterId),
    enabled: Boolean(clusterId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  const clusterServices = useMemo(() => getClusterServices(environments), [environments])

  const runningStatusResults = useQueries({
    queries: clusterServices.map(({ environmentId, serviceId }) => ({
      ...queries.services.runningStatus(environmentId, serviceId),
      enabled: Boolean(environmentId) && Boolean(serviceId),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    })),
  })

  const runningStates = runningStatusResults.map(({ data }) => data?.state)

  const { allErrorServices, errorServiceCount, errorServices, hiddenErrorServiceCount } = useMemo(() => {
    if (checkRunningStatusClosed?.reason) {
      return {
        allErrorServices: [] as ClusterRunningErrorServiceItem[],
        errorServiceCount: 0,
        errorServices: [] as ClusterRunningErrorServiceItem[],
        hiddenErrorServiceCount: 0,
      }
    }

    const allErrorServices = clusterServices
      .filter((_, index) => runningStates[index] === 'ERROR')
      .map(
        ({
          environmentId,
          environmentName,
          projectId,
          projectName,
          serviceId,
          serviceName,
        }): ClusterRunningErrorServiceItem => ({
          environmentId,
          environmentName,
          projectId,
          projectName,
          serviceId,
          serviceName,
        })
      )

    return {
      allErrorServices,
      errorServiceCount: allErrorServices.length,
      errorServices: allErrorServices.slice(0, MAX_DISPLAYED_ERROR_SERVICES),
      hiddenErrorServiceCount: Math.max(allErrorServices.length - MAX_DISPLAYED_ERROR_SERVICES, 0),
    }
  }, [clusterServices, checkRunningStatusClosed?.reason, runningStates])

  return {
    serviceCount: clusterServices.length,
    allErrorServices,
    errorServiceCount,
    errorServices,
    hiddenErrorServiceCount,
  }
}

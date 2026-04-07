import { useQueries } from '@tanstack/react-query'
import { type ClusterEnvironmentResponse, type Status } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import { useEnvironmentsByCluster } from '../use-environments-by-cluster/use-environments-by-cluster'

const MAX_DISPLAYED_ERROR_SERVICES = 20
const DEPLOYMENT_ERROR_STATES = [
  'BUILD_ERROR',
  'DEPLOYMENT_ERROR',
  'DELETE_ERROR',
  'STOP_ERROR',
  'RESTART_ERROR',
  'INVALID_CREDENTIALS',
] as const satisfies Status['state'][]

interface ClusterServiceDescriptor {
  environmentId: string
  environmentName: string
  projectId: string
  projectName: string
  serviceId: string
  serviceName: string
}

export interface ClusterDeploymentErrorServiceItem {
  environmentId: string
  environmentName: string
  projectId: string
  projectName: string
  serviceId: string
  serviceName: string
  state: Status['state']
  stateLabel: string
}

export interface UseClusterDeploymentErrorServicesProps {
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

function isDeploymentErrorState(state: Status['state'] | undefined): state is (typeof DEPLOYMENT_ERROR_STATES)[number] {
  return state !== undefined && DEPLOYMENT_ERROR_STATES.includes(state)
}

function formatDeploymentStateLabel(state: Status['state']) {
  return upperCaseFirstLetter(state.replace(/_/g, ' '))
}

export function useClusterDeploymentErrorServices({
  organizationId,
  clusterId,
}: UseClusterDeploymentErrorServicesProps) {
  const { data: environments = [] } = useEnvironmentsByCluster({
    organizationId,
    clusterId,
  })

  const clusterServices = useMemo(() => getClusterServices(environments), [environments])

  const deploymentStatusResults = useQueries({
    queries: clusterServices.map(({ environmentId, serviceId }) => ({
      ...queries.services.deploymentStatus(environmentId, serviceId),
      enabled: Boolean(environmentId) && Boolean(serviceId),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    })),
  })

  const deploymentStates = deploymentStatusResults.map(({ data }) => data?.state)

  const { allErrorServices, errorServiceCount, errorServices, hiddenErrorServiceCount } = useMemo(() => {
    const allErrorServices = clusterServices
      .map((service, index) => ({
        ...service,
        state: deploymentStates[index],
      }))
      .filter(({ state }): state is ClusterServiceDescriptor & { state: Status['state'] } =>
        isDeploymentErrorState(state)
      )
      .map(
        ({
          environmentId,
          environmentName,
          projectId,
          projectName,
          serviceId,
          serviceName,
          state,
        }): ClusterDeploymentErrorServiceItem => ({
          environmentId,
          environmentName,
          projectId,
          projectName,
          serviceId,
          serviceName,
          state,
          stateLabel: formatDeploymentStateLabel(state),
        })
      )

    return {
      allErrorServices,
      errorServiceCount: allErrorServices.length,
      errorServices: allErrorServices.slice(0, MAX_DISPLAYED_ERROR_SERVICES),
      hiddenErrorServiceCount: Math.max(allErrorServices.length - MAX_DISPLAYED_ERROR_SERVICES, 0),
    }
  }, [clusterServices, deploymentStates])

  return {
    serviceCount: clusterServices.length,
    allErrorServices,
    errorServiceCount,
    errorServices,
    hiddenErrorServiceCount,
  }
}

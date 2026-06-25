import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { queries } from '@qovery/state/util-queries'
import {
  formatDeploymentStatusLabel,
  getServiceRunningStatus,
} from '../use-service-deployment-and-running-statuses/service-status-utils'

export interface UseServicesProps {
  environmentId?: string
  suspense?: boolean
}

export function useServices({ environmentId, suspense = false }: UseServicesProps) {
  const { data: services, isLoading: isServicesLoading } = useQuery({
    ...queries.services.list(environmentId!),
    select(services) {
      return [...services].sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
    },
    enabled: Boolean(environmentId),
    suspense,
  })

  const runningStatusResults = useQueries({
    queries: (services ?? []).map(({ id }) => ({
      ...queries.services.runningStatus(environmentId!, id),
    })),
  })

  const deploymentStatusResults = useQueries({
    queries: (services ?? []).map(({ id }) => ({
      ...queries.services.deploymentStatus(environmentId!, id),
    })),
  })

  const data = useMemo(() => {
    const nextData = (services ?? []).map((service, index) => {
      const runningStatus = runningStatusResults[index].data
      const deploymentStatus = deploymentStatusResults[index].data

      const deploymentStatusLabel = formatDeploymentStatusLabel(deploymentStatus)
      const runningStatusOverride = getServiceRunningStatus({ service, runningStatus, deploymentStatus })

      return {
        ...service,
        runningStatus: runningStatusOverride,
        ...(deploymentStatus
          ? {
              deploymentStatus: {
                ...deploymentStatus,
                stateLabel: deploymentStatusLabel,
              },
            }
          : {}),
      }
    })

    return nextData
  }, [
    services,
    // https://github.com/TanStack/query/issues/5137
    // As we currently use tanstack query V4, we cannot use combine to avoid infinite renders
    // So we need to use service "state" to memoize data for usage like tanstack table.
    // As useMemo cannot have variable params length, we need JSON.stringify to not be bound by the services length
    JSON.stringify([
      ...runningStatusResults.map(({ data }) => data?.state),
      ...deploymentStatusResults.map(({ data }) => data?.state),
    ]),
  ])

  return {
    data,
    isLoading:
      [...runningStatusResults, ...deploymentStatusResults].some(({ isLoading }) => isLoading) || isServicesLoading,
  }
}

export default useServices

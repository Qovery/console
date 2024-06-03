import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { P, match } from 'ts-pattern'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesProps {
  environmentId?: string
}

export function useServices({ environmentId }: UseServicesProps) {
  const { data: services, isLoading: isServicesLoading } = useQuery({
    ...queries.services.list(environmentId!),
    select(services) {
      services.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return services
    },
    enabled: Boolean(environmentId),
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

  const data = useMemo(
    () =>
      (services ?? [])
        .map((service, index) => {
          const runningStatus = runningStatusResults[index].data
          const deploymentStatus = deploymentStatusResults[index].data

          const runningStatusLabel = upperCaseFirstLetter(runningStatus?.state.replace('_', ' ') ?? 'STOPPED')
          const deploymentStatusLabel = upperCaseFirstLetter(
            (deploymentStatus?.state === 'READY' ? 'NEVER_DEPLOYED' : deploymentStatus?.state)?.replace('_', ' ') ??
              'STOPPED'
          )
          const isManagedDb = service.serviceType === 'DATABASE' && service.mode === 'MANAGED'

          const runningStatusOverride = match({ runningStatus, isManagedDb })
            .with({ runningStatus: P.any, isManagedDb: true }, () => ({
              ...deploymentStatus,
              state: match(deploymentStatus?.state)
                .with('DEPLOYED', () => 'RUNNING' as const)
                .otherwise(() => 'UNKNOWN' as const),
              stateLabel: match(deploymentStatus?.state)
                .with('DEPLOYED', () => 'Running')
                .otherwise(() => 'Unknown'),
            }))
            .with({ runningStatus: P.nullish, isManagedDb: false }, () => ({
              state: undefined,
              stateLabel: 'Stopped',
            }))
            .with({ runningStatus: P.not(P.nullish) }, ({ runningStatus }) => ({
              ...runningStatus,
              stateLabel: runningStatusLabel,
            }))
            .exhaustive()

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
        // Hide deleted services
        // https://qovery.atlassian.net/browse/FRT-1141
        .filter(({ deploymentStatus }) => deploymentStatus?.state !== 'DELETED'),
    [
      services,
      // https://github.com/TanStack/query/issues/5137
      // As we currently use tanstack query V4, we cannot use combine to avoid infinite renders
      // So we need to use service "state" to memoize data for usage like tanstack table.
      // As useMemo cannot have variable params length, we need JSON.stringify to not be bound by the services length
      JSON.stringify([
        ...runningStatusResults.map(({ data }) => data?.state),
        ...deploymentStatusResults.map(({ data }) => data?.state),
      ]),
    ]
  )

  return {
    data,
    isLoading:
      [...runningStatusResults, ...deploymentStatusResults].some(({ isLoading }) => isLoading) || isServicesLoading,
  }
}

export default useServices

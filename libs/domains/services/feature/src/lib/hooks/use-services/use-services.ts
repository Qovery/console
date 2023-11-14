import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

export interface UseServicesProps {
  environmentId?: string
}

export function useServices({ environmentId }: UseServicesProps) {
  const { data: services, isLoading: isServicesLoading } = useQuery({
    ...queries.services.list(environmentId!),
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
      (services ?? []).map((service, index) => {
        const runningStatus = runningStatusResults[index].data
        const deploymentStatus = deploymentStatusResults[index].data
        return {
          ...service,
          ...(runningStatus
            ? {
                runningStatus: {
                  ...runningStatus,
                  stateLabel: upperCaseFirstLetter(runningStatus?.state.replace('_', ' ') ?? 'STOPPED'),
                },
              }
            : {
                runningStatus: {
                  state: undefined,
                  stateLabel: 'Stopped',
                },
              }),
          ...(deploymentStatus
            ? {
                deploymentStatus: {
                  ...deploymentStatus,
                  stateLabel: upperCaseFirstLetter(
                    (deploymentStatus?.state === 'READY' ? 'NEVER_DEPLOYED' : deploymentStatus?.state)?.replace(
                      '_',
                      ' '
                    ) ?? 'STOPPED'
                  ),
                },
              }
            : {}),
        }
      }),
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

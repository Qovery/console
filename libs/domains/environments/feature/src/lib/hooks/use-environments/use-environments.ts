import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { P, match } from 'ts-pattern'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentsProps {
  projectId: string
}

export function useEnvironments({ projectId }: UseEnvironmentsProps) {
  const {
    data: environments,
    isLoading: isEnvironmentsLoading,
    error,
  } = useQuery({
    ...queries.environments.list({ projectId }),
    select(environments) {
      environments?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return environments
    },
    enabled: projectId !== '',
    retry: 3,
  })

  const runningStatusResults = useQueries({
    queries: (environments ?? []).map(({ id }) => ({
      ...queries.environments.runningStatus(id),
    })),
  })

  const deploymentStatusResults = useQueries({
    queries: (environments ?? []).map(({ id }) => ({
      ...queries.environments.deploymentStatus(id),
    })),
  })

  const data = useMemo(
    () =>
      (environments ?? [])
        .map((environment, index) => {
          const runningStatus = runningStatusResults[index].data
          const deploymentStatus = deploymentStatusResults[index].data

          const runningStatusLabel = upperCaseFirstLetter(runningStatus?.state.replace('_', ' ') ?? 'STOPPED')
          const deploymentStatusLabel = upperCaseFirstLetter(
            (deploymentStatus?.state === 'READY' ? 'NEVER_DEPLOYED' : deploymentStatus?.state)?.replace('_', ' ') ??
              'STOPPED'
          )

          const runningStatusOverride = match({ runningStatus })
            .with({ runningStatus: P.nullish }, () => ({
              state: undefined,
              stateLabel: 'Stopped',
            }))
            .with({ runningStatus: P.not(P.nullish) }, ({ runningStatus }) => ({
              ...runningStatus,
              stateLabel: runningStatusLabel,
            }))
            .exhaustive()

          return {
            ...environment,
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
        // Hide deleted environments
        // https://qovery.atlassian.net/browse/FRT-1141
        .filter(({ deploymentStatus }) => deploymentStatus?.state !== 'DELETED'),
    [
      environments,
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
  environments?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))

  return {
    data,
    error: error as Error,
    isLoading:
      [...runningStatusResults, ...deploymentStatusResults].some(({ isLoading }) => isLoading) || isEnvironmentsLoading,
  }
}

export default useEnvironments

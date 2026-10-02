import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { queries } from '@qovery/state/util-queries'
import { getBlueprintDbInstance } from '../../util/get-blueprint-db-instance'

interface UseBlueprintDbInstanceProps {
  serviceId: string
  enabled: boolean
  /** Only the page that waits for a fresh deployment (the dashboard) sets it, so a single caller polls. */
  deploymentFinished?: boolean
  deploymentExecutionId?: string
}

/** Read the Terraform output and refresh it briefly after each completed deployment. */
export function useBlueprintDbInstance({
  serviceId,
  enabled,
  deploymentFinished = false,
  deploymentExecutionId,
}: UseBlueprintDbInstanceProps) {
  const queryClient = useQueryClient()
  const pollingBaseline = useRef<number>()
  const queryOptions = queries.variables.list({ parentId: serviceId, scope: 'TERRAFORM', isSecret: false })
  const {
    data: variables = [],
    isLoading,
    isError,
  } = useQuery({
    ...queryOptions,
    enabled: enabled && Boolean(serviceId),
    refetchInterval: (_data, query) => {
      if (!enabled || !deploymentFinished || pollingBaseline.current === undefined) return false

      const attempts = query.state.dataUpdateCount + query.state.errorUpdateCount - pollingBaseline.current
      const dbInstance = getBlueprintDbInstance(serviceId, query.state.data ?? [])
      return attempts < 6 && (query.state.status === 'error' || !dbInstance) ? 15_000 : false
    },
  })

  useEffect(() => {
    if (!enabled || !serviceId || !deploymentFinished) return

    const queryKey = queries.variables.list({ parentId: serviceId, scope: 'TERRAFORM', isSecret: false }).queryKey
    const state = queryClient.getQueryState(queryKey)
    pollingBaseline.current = (state?.dataUpdateCount ?? 0) + (state?.errorUpdateCount ?? 0)
    void queryClient.invalidateQueries({ queryKey, exact: true })

    return () => {
      pollingBaseline.current = undefined
    }
  }, [deploymentExecutionId, deploymentFinished, enabled, queryClient, serviceId])

  return { dbInstance: getBlueprintDbInstance(serviceId, variables), isLoading, isError }
}

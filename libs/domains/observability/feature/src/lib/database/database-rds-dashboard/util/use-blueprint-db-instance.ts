import { useEffect } from 'react'
import { useVariables } from '@qovery/domains/variables/feature'
import { getBlueprintDbInstance } from './get-blueprint-db-instance'

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
  const {
    data: variables = [],
    isLoading,
    isError,
    refetch,
  } = useVariables({
    parentId: serviceId,
    scope: 'TERRAFORM',
    isSecret: false,
    enabled: enabled && Boolean(serviceId),
  })

  useEffect(() => {
    if (!enabled || !serviceId || !deploymentFinished || isLoading) return

    let cancelled = false
    let timeout: number | undefined
    let attempts = 0

    const refresh = () => {
      void refetch().then((result) => {
        if (cancelled) return
        attempts += 1
        if ((result.isError || !getBlueprintDbInstance(serviceId, result.data ?? [])) && attempts < 6) {
          timeout = window.setTimeout(refresh, 15_000)
        }
      })
    }

    refresh()
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [deploymentExecutionId, deploymentFinished, enabled, isLoading, refetch, serviceId])

  return { dbInstance: getBlueprintDbInstance(serviceId, variables), isLoading, isError }
}

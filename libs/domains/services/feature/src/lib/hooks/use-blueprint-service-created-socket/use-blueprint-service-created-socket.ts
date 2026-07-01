import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UseBlueprintServiceCreatedSocketProps {
  organizationId?: string
  projectId?: string
  environmentId?: string
  enabled?: boolean
  onServiceCreated?: () => void
}

export function useBlueprintServiceCreatedSocket({
  organizationId,
  projectId,
  environmentId,
  enabled = true,
  onServiceCreated,
}: UseBlueprintServiceCreatedSocketProps) {
  const queryClient = useQueryClient()

  const handleServiceCreated = useCallback(() => {
    if (!environmentId) {
      return
    }

    queryClient.invalidateQueries({
      queryKey: queries.services.list(environmentId).queryKey,
    })
    onServiceCreated?.()
  }, [environmentId, onServiceCreated, queryClient])

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/blueprint/service-created',
    urlSearchParams: {
      organization: organizationId,
      project: projectId,
      environment: environmentId,
    },
    enabled: enabled && Boolean(organizationId) && Boolean(projectId) && Boolean(environmentId),
    onMessage: handleServiceCreated,
    onQueryInvalidated: handleServiceCreated,
  })
}

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UseBlueprintServiceCreatedSocketProps {
  organizationId?: string
  projectId?: string
  environmentId?: string
  /** Frames are environment-scoped, so this identifies the dispatch the caller is waiting on */
  blueprintId?: string
  enabled?: boolean
  onServiceCreated?: () => void
  onDispatchFailed?: (errorMessage?: string) => void
}

// The socket carries the older bare notification and the newer dispatch frame, on either the
// original route or `/blueprint/dispatch`. `error_message` is null when the engine gave no reason.
interface BlueprintDispatchFrame {
  type?: 'created' | 'failed'
  blueprint_id?: string
  error_message?: string | null
}

export function useBlueprintServiceCreatedSocket({
  organizationId,
  projectId,
  environmentId,
  blueprintId,
  enabled = true,
  onServiceCreated,
  onDispatchFailed,
}: UseBlueprintServiceCreatedSocketProps) {
  const queryClient = useQueryClient()

  const handleMessage = useCallback(
    (frame?: BlueprintDispatchFrame) => {
      if (!environmentId) {
        return
      }

      // Every dispatch in the environment lands here, including ones this flow did not start, so
      // a frame counts only when it names the blueprint being waited on. Both the older
      // service-created payload and the dispatch frame carry `blueprint_id`, so anything that
      // cannot be correlated — including a frame arriving before the create response supplies the
      // id — is left for the outcome read rather than guessed at.
      if (!blueprintId || frame?.blueprint_id !== blueprintId) {
        return
      }

      // A failure frame must not be read as a creation. Only an explicit failure is treated as
      // one, so the older payload — which carries no `type` — still means the service exists.
      if (frame?.type === 'failed') {
        onDispatchFailed?.(frame.error_message ?? undefined)
        return
      }

      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
      onServiceCreated?.()
    },
    [blueprintId, environmentId, onDispatchFailed, onServiceCreated, queryClient]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/blueprint/service-created',
    urlSearchParams: {
      organization: organizationId,
      project: projectId,
      environment: environmentId,
    },
    enabled: enabled && Boolean(organizationId) && Boolean(projectId) && Boolean(environmentId),
    onMessage: (_, frame) => handleMessage(frame),
  })
}

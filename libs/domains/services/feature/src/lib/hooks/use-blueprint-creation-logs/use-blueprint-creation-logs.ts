import { type QueryClient } from '@tanstack/react-query'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UseBlueprintCreationLogsProps {
  blueprintId?: string
  clusterId?: string
  environmentId?: string
  organizationId?: string
  projectId?: string
  enabled?: boolean
}

export function useBlueprintCreationLogs({
  blueprintId,
  clusterId,
  environmentId,
  organizationId,
  projectId,
  enabled = true,
}: UseBlueprintCreationLogsProps) {
  const [logs, setLogs] = useState<EnvironmentLogs[]>([])

  useEffect(() => {
    setLogs([])
  }, [blueprintId])

  const handleMessage = useCallback(
    (_: QueryClient, message: EnvironmentLogs[]) => {
      const blueprintLogs = message.filter(
        (log) => log.details.transmitter?.type === 'Blueprint' && log.details.transmitter.id === blueprintId
      )

      if (blueprintLogs.length === 0) {
        return
      }

      setLogs((currentLogs) => [
        ...new Map([...currentLogs, ...blueprintLogs].map((log) => [log.timestamp, log])).values(),
      ])
    },
    [blueprintId]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
    },
    enabled:
      enabled &&
      Boolean(blueprintId) &&
      Boolean(clusterId) &&
      Boolean(environmentId) &&
      Boolean(organizationId) &&
      Boolean(projectId),
    onMessage: handleMessage,
  })

  return { logs }
}

export default useBlueprintCreationLogs

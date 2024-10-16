import { type QueryClient } from '@tanstack/react-query'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useMemo, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UsePreCheckLogsProps {
  organizationId?: string
  projectId?: string
  environmentId?: string
  serviceId?: string
  versionId?: string
}

export interface EnvironmentPreCheckLogId extends EnvironmentLogs {
  // Needed for row UI indicator
  id: number
}

// This hook simplifies the process of fetching and managing pre-check deployment logs data
export function usePreCheckLogs({
  organizationId,
  projectId,
  environmentId,
  serviceId,
  versionId,
}: UsePreCheckLogsProps) {
  const { data: environment } = useEnvironment({ environmentId })

  const [logs, setLogs] = useState<EnvironmentLogs[]>([])

  const now = useMemo(() => Date.now(), [])

  const messageHandler = useCallback(
    (_: QueryClient, message: EnvironmentLogs[]) => {
      console.log(message)

      setLogs((prevLogs) => {
        const combinedLogs = [...prevLogs, ...message]
        return [...new Map(combinedLogs.map((item) => [item['timestamp'], item])).values()]
      })
    },
    [setLogs]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: versionId,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  const preCheckLogs = useMemo(
    () =>
      logs
        .filter((currentData: EnvironmentLogs) => {
          const { stage, transmitter } = currentData.details
          return stage?.step === 'PreCheck'
        })
        .map((log, index) => ({ ...log, id: index + 1 })) as EnvironmentPreCheckLogId[],
    [logs, serviceId, now]
  )

  return {
    data: preCheckLogs,
  }
}

export default usePreCheckLogs

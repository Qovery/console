import { type QueryClient } from '@tanstack/react-query'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UsePreCheckLogsProps {
  clusterId?: string
  organizationId?: string
  projectId?: string
  environmentId?: string
  versionId?: string
}

export interface EnvironmentPreCheckLogId extends EnvironmentLogs {
  // Needed for row UI indicator
  id: number
}

// This hook simplifies the process of fetching and managing pre-check deployment logs data
export function usePreCheckLogs({
  clusterId,
  organizationId,
  projectId,
  environmentId,
  versionId,
}: UsePreCheckLogsProps) {
  const [logs, setLogs] = useState<EnvironmentLogs[]>([])

  // Reset logs when versionId changes
  useEffect(() => setLogs([]), [versionId])

  const messageHandler = useCallback(
    (_: QueryClient, message: EnvironmentLogs[]) => {
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
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      version: versionId,
    },
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  const preCheckLogs = useMemo(
    () =>
      logs
        .filter((currentData: EnvironmentLogs) => currentData.details.stage?.step === 'PreCheck')
        .map((log, index) => ({ ...log, id: index + 1 })) as EnvironmentPreCheckLogId[],
    [logs]
  )

  return {
    data: preCheckLogs,
  }
}

export default usePreCheckLogs

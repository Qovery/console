import { differenceInHours } from 'date-fns'
import posthog from 'posthog-js'
import { type Cluster, type Environment, type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useQueryParams } from 'use-query-params'
import { EnableObservabilityButtonContactUs } from '@qovery/domains/observability/feature'
import { useRunningStatus, useService } from '@qovery/domains/services/feature'
import { TablePrimitives } from '@qovery/shared/ui'
import { useServiceHistoryLogs } from '../hooks/use-service-history-logs/use-service-history-logs'
import { useServiceLiveLogs } from '../hooks/use-service-live-logs/use-service-live-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ServiceLogsPlaceholder } from '../service-logs-placeholder/service-logs-placeholder'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import { HeaderServiceLogs } from './header-service-logs/header-service-logs'
import { RowServiceLogs } from './row-service-logs/row-service-logs'
import { ServiceLogsProvider, queryParamsServiceLogs } from './service-logs-context/service-logs-context'

const { Table } = TablePrimitives

const MemoizedRowServiceLogs = memo(RowServiceLogs)

function Placeholder({
  hasMetricsEnabled,
  type,
  isLogsFetched,
  serviceName,
  itemsLength,
  databaseMode,
}: {
  hasMetricsEnabled?: boolean
  type: 'live' | 'history'
  isLogsFetched: boolean
  serviceName?: string
  itemsLength?: number
  databaseMode?: 'MANAGED' | 'CONTAINER'
}) {
  if (isLogsFetched && Boolean(hasMetricsEnabled) === false) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div>
          <p className="text-neutral-50">No logs found for your request.</p>
          <p className="text-sm text-neutral-300">Want to search on a larger time period? Try it with Observe</p>
        </div>
        <div className="max-w-max">
          <EnableObservabilityButtonContactUs text="Unlock with Observe plan" />
        </div>
      </div>
    )
  } else {
    return (
      <ServiceLogsPlaceholder
        type={type}
        isFetched={isLogsFetched}
        serviceName={serviceName}
        itemsLength={itemsLength}
        databaseMode={databaseMode}
      />
    )
  }
}

function ListServiceLogsContent({ cluster, environment }: { cluster: Cluster; environment: Environment }) {
  const { serviceId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const isLiveMode = useMemo(() => {
    if (queryParams.mode === 'live') {
      return true
    }

    if (queryParams.mode === 'history') {
      return false
    }

    if (queryParams.deploymentId) {
      return true
    }

    return !queryParams.startDate && !queryParams.endDate
  }, [queryParams.mode, queryParams.deploymentId, queryParams.startDate, queryParams.endDate])

  const hasMetricsEnabled =
    useMemo(() => {
      if (isLiveMode) return true

      const isMetricsEnabled = cluster.metrics_parameters?.enabled ?? false
      if (isMetricsEnabled) return true

      if (!isMetricsEnabled || !queryParams.startDate || !queryParams.endDate) {
        return false
      }

      const startDate = new Date(queryParams.startDate)
      const endDate = new Date(queryParams.endDate)
      const hoursRange = differenceInHours(endDate, startDate)

      return hoursRange < 24
    }, [cluster?.metrics_parameters?.enabled, queryParams.startDate, queryParams.endDate, isLiveMode]) ?? true

  const { data: service } = useService({ environmentId: environment.id, serviceId })
  const { data: runningStatus } = useRunningStatus({ environmentId: environment.id, serviceId })

  const serviceEnabled = service?.serviceType === 'DATABASE' ? service?.mode === 'CONTAINER' : true

  // Live logs hook - only enabled when in live mode
  const {
    data: liveLogs = [],
    pauseLogs,
    setPauseLogs,
    newLogsAvailable,
    setNewLogsAvailable,
    isFetched: isLiveLogsFetched,
    isLoading: isLiveLogsLoading,
  } = useServiceLiveLogs({
    clusterId: environment.cluster_id,
    serviceId: serviceId ?? '',
    enabled: isLiveMode && serviceEnabled,
  })

  // Historical logs hook - only enabled when in historical mode
  const {
    data: historyLogs = [],
    isFetched: isHistoryLogsFetched,
    loadPreviousLogs,
    hasMoreLogs,
    isLoading: isHistoryLogsLoading,
  } = useServiceHistoryLogs({
    clusterId: environment.cluster_id,
    serviceId: serviceId ?? '',
    enabled: !isLiveMode && serviceEnabled,
  })

  useEffect(() => {
    if (isLiveMode && serviceEnabled) {
      setNewLogsAvailable(true)
      setPauseLogs(false)
    }
  }, [isLiveMode, serviceEnabled, setNewLogsAvailable, setPauseLogs])

  useEffect(() => {
    posthog.capture('service-logs', {
      is_live_mode: isLiveMode,
      metrics_enabled: hasMetricsEnabled,
      filters: {
        level: queryParams.level,
        instance: queryParams.instance,
        message: queryParams.message,
        search: queryParams.search,
        version: queryParams.version,
        nginx: queryParams.nginx,
        start_date: queryParams.startDate,
        end_date: queryParams.endDate,
        container: queryParams.container,
        deployment_id: queryParams.deploymentId,
      },
      service: {
        organization_id: environment.organization.id,
        project_id: environment.project.id,
        environment_id: environment.id,
        service_id: serviceId,
        service_name: service?.name ?? '',
      },
    })
  }, [
    environment.id,
    environment.organization.id,
    environment.project.id,
    hasMetricsEnabled,
    isLiveMode,
    queryParams.container,
    queryParams.endDate,
    queryParams.instance,
    queryParams.deploymentId,
    queryParams.level,
    queryParams.message,
    queryParams.nginx,
    queryParams.search,
    queryParams.startDate,
    queryParams.version,
    service?.name,
    serviceId,
  ])

  const logs = isLiveMode ? liveLogs : historyLogs

  const hasMultipleContainers = new Set(logs?.map((i) => i.container)).size > 1

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    if (!isLiveMode) return
    const section = refScrollSection.current
    if (!section) return

    !pauseLogs && section.scroll(0, section.scrollHeight)
  }, [logs, pauseLogs, isLiveMode])

  const isServiceProgressing = match(runningStatus?.state)
    .with('RUNNING', 'WARNING', () => true)
    .otherwise(() => false)

  const isLogsFetched = useMemo(
    () => (isLiveMode ? isLiveLogsFetched : isHistoryLogsFetched),
    [isLiveMode, isLiveLogsFetched, isHistoryLogsFetched]
  )

  const isLogsLoading = useMemo(() => {
    return isLiveMode ? isLiveLogsLoading : isHistoryLogsLoading
  }, [isLiveMode, isLiveLogsLoading, isHistoryLogsLoading])

  // Temporary solution with `includes` to handle the case where only one log with the message 'No pods found' is received.
  if (
    (isLogsFetched && logs.length > 0 && logs[0].message.includes('No pods found')) ||
    (isLogsFetched && logs.length === 0) ||
    hasMetricsEnabled === false ||
    (!isLogsFetched && !isLogsLoading)
  ) {
    return (
      <div className="w-full p-1">
        <div className="h-[calc(100vh-164px)] border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
          <HeaderServiceLogs logs={logs} isLiveMode={isLiveMode} />
          <div className="h-[calc(100vh-176px)] border-r border-neutral-500 bg-neutral-600">
            <div className="flex h-full flex-col items-center justify-center">
              <Placeholder
                hasMetricsEnabled={hasMetricsEnabled}
                type={isLiveMode ? 'live' : 'history'}
                isLogsFetched={isLogsFetched}
                serviceName={service?.name}
                itemsLength={logs.length}
                databaseMode={service?.serviceType === 'DATABASE' ? service.mode : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full max-w-[calc(100vw-64px)] overflow-hidden p-1">
      <div className="relative h-full border border-r-0 border-t-0 border-neutral-500 bg-neutral-600 pb-7">
        <HeaderServiceLogs logs={logs} isLiveMode={isLiveMode} />
        {isLogsLoading && isLiveMode ? (
          <div className="flex h-full flex-col items-center justify-center pb-[68px]">
            <Placeholder
              hasMetricsEnabled={hasMetricsEnabled}
              type="live"
              isLogsFetched={isLogsFetched}
              serviceName={service?.name}
              itemsLength={logs.length}
              databaseMode={service?.serviceType === 'DATABASE' ? service.mode : undefined}
            />
          </div>
        ) : (
          <div
            className="h-[calc(100vh-160px)] w-full overflow-x-scroll overflow-y-scroll pb-3"
            ref={refScrollSection}
            onWheel={(event) => {
              if (!liveLogs) return

              const section = refScrollSection.current
              if (!section) return

              const hasScrollableContent = section.clientHeight !== section.scrollHeight

              if (!pauseLogs && hasScrollableContent && event.deltaY < 0) {
                setPauseLogs(true)
                setNewLogsAvailable(false)
              }
            }}
          >
            {!isLiveMode && hasMoreLogs && historyLogs.length > 0 && (
              <ShowPreviousLogsButton
                showPreviousLogs={!hasMoreLogs}
                setShowPreviousLogs={loadPreviousLogs}
                setPauseLogs={setPauseLogs}
              />
            )}
            <Table.Root className="w-full border-separate border-spacing-y-0.5 text-xs">
              <Table.Body className="divide-y-0">
                {logs.map((log, index) => {
                  const timestamp = log.timestamp
                  return (
                    <MemoizedRowServiceLogs
                      key={timestamp + index}
                      service={service}
                      log={log}
                      hasMultipleContainers={hasMultipleContainers}
                      highlightedText={queryParams.message || queryParams.search}
                    />
                  )
                })}
              </Table.Body>
            </Table.Root>
            {isLiveMode ? (
              isServiceProgressing &&
              isLogsFetched && <ProgressIndicator pauseLogs={pauseLogs} message="Streaming service logs" />
            ) : (
              <div className="h-8" />
            )}
          </div>
        )}
        {isLiveMode && (
          <ShowNewLogsButton
            pauseLogs={pauseLogs}
            setPauseLogs={setPauseLogs}
            newMessagesAvailable={newLogsAvailable}
          />
        )}
      </div>
    </div>
  )
}

export interface ListServiceLogsProps {
  environment: Environment
  serviceStatus: Status
  cluster: Cluster
  environmentStatus?: EnvironmentStatus
}

export function ListServiceLogs({ cluster, environment, serviceStatus, environmentStatus }: ListServiceLogsProps) {
  const { serviceId = '' } = useParams()

  return (
    <ServiceLogsProvider
      environment={environment}
      serviceId={serviceId}
      serviceStatus={serviceStatus}
      environmentStatus={environmentStatus}
    >
      <ListServiceLogsContent cluster={cluster} environment={environment} />
    </ServiceLogsProvider>
  )
}

export default ListServiceLogs

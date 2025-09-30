import { type Environment, type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useQueryParams } from 'use-query-params'
import { useRunningStatus, useService } from '@qovery/domains/services/feature'
import { TablePrimitives } from '@qovery/shared/ui'
import { useServiceHistoryLogs } from '../hooks/use-service-history-logs/use-service-history-logs'
import { useServiceLiveLogs } from '../hooks/use-service-live-logs/use-service-live-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ServiceLogsPlaceholder } from '../service-logs-placeholder/service-logs-placeholder'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import ShowPreviousLogsButton from '../show-previous-logs-button/show-previous-logs-button'
import { HeaderServiceLogs } from './header-service-logs/header-service-logs'
import { RowInfraLogs } from './row-infra-logs/row-infra-logs'
import { RowServiceLogs } from './row-service-logs/row-service-logs'
import { ServiceLogsProvider, queryParamsServiceLogs } from './service-logs-context/service-logs-context'

const { Table } = TablePrimitives

const MemoizedRowInfraLogs = memo(RowInfraLogs)
const MemoizedRowServiceLogs = memo(RowServiceLogs)

export interface ListServiceLogsProps {
  environment: Environment
  serviceStatus: Status
  environmentStatus?: EnvironmentStatus
}

// Internal component that uses the context
function ListServiceLogsContent({ environment }: { environment: Environment }) {
  const { serviceId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const isLiveMode = useMemo(() => {
    return !queryParams.startDate && !queryParams.endDate
  }, [queryParams.startDate, queryParams.endDate])

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

  if (isLogsFetched && logs.length === 0) {
    return (
      <div className="w-full p-1">
        <div className="h-[calc(100vh-164px)] border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
          <HeaderServiceLogs isFetched={isLogsFetched} logs={logs} />
          <div className="h-[calc(100vh-170px)] border-r border-neutral-500 bg-neutral-600">
            <div className="flex h-full flex-col items-center justify-center">No logs available</div>
          </div>
        </div>
      </div>
    )
  }

  // Temporary solution with `includes` to handle the case where only one log with the message 'No pods found' is received.
  if (isLogsFetched && logs.length > 0 && logs[0].message.includes('No pods found')) {
    return (
      <div className="w-full p-1">
        <div className="h-[calc(100vh-164px)] border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
          <HeaderServiceLogs isFetched={isLogsFetched} logs={logs} />
          <div className="h-[calc(100vh-170px)] border-r border-neutral-500 bg-neutral-600">
            <div className="flex h-full flex-col items-center justify-center">
              <ServiceLogsPlaceholder
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
        <HeaderServiceLogs isFetched={isLogsFetched} logs={logs} />
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
                    log={log}
                    hasMultipleContainers={hasMultipleContainers}
                    highlightedText={queryParams.message}
                  />
                )
              })}
              {/*
                // if (row.original.type === 'INFRA') {
                //   return (
                //     <MemoizedRowInfraLogs
                //       key={row.id}
                //       data={row.original}
                //       hasMultipleContainers={hasMultipleContainers}
                //       enabled={enabledNginx}
                //     />
                //   )
                // } else {
                //   return (
                  //   <MemoizedRowServiceLogs
                  //     key={row.id}
                  //     hasMultipleContainers={hasMultipleContainers}
                  //     toggleColumnFilter={toggleColumnFilter}
                  //     isFilterActive={isFilterActive}
                  //     {...row}
                  //   />
                  // )
                // } */}
            </Table.Body>
          </Table.Root>
          {isLiveMode ? (
            isServiceProgressing &&
            isLogsFetched && <ProgressIndicator pauseLogs={pauseLogs} message="Streaming service logs" />
          ) : (
            <div className="h-8" />
          )}
        </div>
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

export function ListServiceLogs({ environment, serviceStatus, environmentStatus }: ListServiceLogsProps) {
  const { serviceId = '' } = useParams()

  return (
    <ServiceLogsProvider
      environment={environment}
      serviceId={serviceId}
      serviceStatus={serviceStatus}
      environmentStatus={environmentStatus}
    >
      <ListServiceLogsContent environment={environment} />
    </ServiceLogsProvider>
  )
}

export default ListServiceLogs

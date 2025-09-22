import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type Environment, type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { memo, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type ServiceLog } from '@qovery/domains/service-logs/data-access'
import { useRunningStatus, useService } from '@qovery/domains/services/feature'
import { TablePrimitives } from '@qovery/shared/ui'
import { dateUTCString } from '@qovery/shared/util-dates'
import { useServiceHistoryLogs } from '../hooks/use-service-history-logs/use-service-history-logs'
import { useServiceLiveLogs } from '../hooks/use-service-live-logs/use-service-live-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ServiceLogsPlaceholder } from '../service-logs-placeholder/service-logs-placeholder'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import { HeaderServiceLogs } from './header-service-logs/header-service-logs'
import { RowInfraLogs } from './row-infra-logs/row-infra-logs'
import { RowServiceLogs } from './row-service-logs/row-service-logs'
import { ServiceLogsProvider, useServiceLogsContext } from './service-logs-context/service-logs-context'

const { Table } = TablePrimitives

const MemoizedRowInfraLogs = memo(RowInfraLogs)
const MemoizedRowServiceLogs = memo(RowServiceLogs)

export interface ListServiceLogsProps {
  environment: Environment
  clusterId: string
  serviceStatus: Status
  environmentStatus?: EnvironmentStatus
}

// Internal component that uses the context
function ListServiceLogsContent({ clusterId }: { clusterId: string }) {
  const { serviceId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const {
    environment,
    pauseLogs,
    setPauseLogs,
    newMessagesAvailable,
    setNewMessagesAvailable,
    showPreviousLogs,
    setShowPreviousLogs,
    isLiveMode,
    startDate,
    endDate,
  } = useServiceLogsContext()

  const { data: service } = useService({ environmentId: environment.id, serviceId })
  const { data: runningStatus } = useRunningStatus({ environmentId: environment.id, serviceId })

  const serviceEnabled = service?.serviceType === 'DATABASE' ? service?.mode === 'CONTAINER' : true

  // Live logs hook - only enabled when in live mode
  const { data: liveLogs = [], enabledNginx } = useServiceLiveLogs({
    organizationId: environment.organization.id,
    clusterId,
    projectId: environment.project.id,
    environmentId: environment.id,
    serviceId: serviceId ?? '',
    enabled: isLiveMode && serviceEnabled,
  })

  // Historical logs hook - only enabled when in historical mode
  const { data: historyLogs = [] } = useServiceHistoryLogs({
    clusterId,
    serviceId: serviceId ?? '',
    startDate,
    endDate,
    enabled: !isLiveMode && serviceEnabled,
  })

  // Use the appropriate logs based on the current mode
  const logs = isLiveMode ? liveLogs : historyLogs

  const hasMultipleContainers = new Set(logs?.map((i) => i.container)).size > 1

  const columnHelper = createColumnHelper<ServiceLog>()

  // const customFilter: FilterFn<ServiceLog> = (row, columnId, filterValue) => {
  //   // Always return true for `INFRA` type logs to ensure they are always visible
  //   // if (row.original.type === 'INFRA') return true

  //   const rowValue = row.getValue(columnId)
  //   if (typeof rowValue === 'string') {
  //     return rowValue.toLowerCase().includes(filterValue.toLowerCase())
  //   }
  //   return false
  // }

  const columns = useMemo(
    () => [
      columnHelper.accessor('pod', {}),
      columnHelper.accessor('timestamp', {}),
      ...(hasMultipleContainers ? [columnHelper.accessor('container', {})] : []),
      columnHelper.accessor('exporter', {}),
      columnHelper.accessor('message', {}),
    ],
    [columnHelper, hasMultipleContainers]
  )

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    enableFilters: true,
    getFilteredRowModel: getFilteredRowModel(),
  })

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  // useEffect(() => {
  //   const section = refScrollSection.current
  //   if (!section) return

  //   !pauseLogs && section.scroll(0, section.scrollHeight)
  // }, [logs, pauseLogs])

  const isServiceProgressing = match(runningStatus?.state)
    .with('RUNNING', 'WARNING', () => true)
    .otherwise(() => false)

  // Temporary solution with `includes` to handle the case where only one log with the message 'No pods found' is received.
  if (!logs || logs.length === 0 || (logs.length > 0 && logs[0].message.includes('No pods found'))) {
    return (
      <div className="w-full p-1">
        <div className="h-[calc(100vh-72px)] border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
          <HeaderServiceLogs logs={logs} />
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
        <HeaderServiceLogs logs={logs} />
        <div
          className="h-[calc(100vh-160px)] w-full overflow-y-scroll pb-3"
          ref={refScrollSection}
          onWheel={(event) => {
            if (
              !pauseLogs &&
              refScrollSection.current &&
              refScrollSection.current.clientHeight !== refScrollSection.current.scrollHeight &&
              event.deltaY < 0
            ) {
              setPauseLogs(true)
              setNewMessagesAvailable(false)
            }
          }}
        >
          <ShowPreviousLogsButton
            showPreviousLogs={showPreviousLogs}
            setShowPreviousLogs={setShowPreviousLogs}
            setPauseLogs={setPauseLogs}
          />
          <Table.Root className="w-full text-xs">
            <Table.Body className="divide-y-0">
              {table.getRowModel().rows.map((row) => {
                const podName = row.getValue('pod') as string
                const message = row.getValue('message') as string
                const timestamp = row.getValue('timestamp') as string
                return (
                  <span key={row.id} className="flex gap-1 text-neutral-50">
                    <span>{dateUTCString(Number(timestamp))}</span>
                    <span className="text-neutral-300">{podName}</span>
                    {message}
                  </span>
                )
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
                //     <MemoizedRowServiceLogs
                //       key={row.id}
                //       hasMultipleContainers={hasMultipleContainers}
                //       toggleColumnFilter={toggleColumnFilter}
                //       isFilterActive={isFilterActive}
                //       {...row}
                //     />
                //   )
                // }
              })}
            </Table.Body>
          </Table.Root>
          {isServiceProgressing && <ProgressIndicator pauseLogs={pauseLogs} message="Streaming service logs" />}
        </div>
        <ShowNewLogsButton
          pauseLogs={pauseLogs}
          setPauseLogs={setPauseLogs}
          newMessagesAvailable={newMessagesAvailable}
        />
      </div>
    </div>
  )
}

export function ListServiceLogs({ environment, clusterId, serviceStatus, environmentStatus }: ListServiceLogsProps) {
  const { serviceId = '' } = useParams()

  return (
    <ServiceLogsProvider
      environment={environment}
      serviceId={serviceId}
      serviceStatus={serviceStatus}
      environmentStatus={environmentStatus}
    >
      <ListServiceLogsContent clusterId={clusterId} />
    </ServiceLogsProvider>
  )
}

export default ListServiceLogs

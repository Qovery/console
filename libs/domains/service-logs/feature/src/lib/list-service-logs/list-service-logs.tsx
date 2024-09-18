import {
  type ColumnFiltersState,
  type FilterFn,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import download from 'downloadjs'
import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useRunningStatus, useService } from '@qovery/domains/services/feature'
import { Button, DropdownMenu, Icon, TablePrimitives } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type LogType, useServiceLogs } from '../hooks/use-service-logs/use-service-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ServiceLogsPlaceholder } from '../service-logs-placeholder/service-logs-placeholder'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import { UpdateTimeContext, defaultUpdateTimeContext } from '../update-time-context/update-time-context'
import { getColorByPod } from './get-color-by-pod'
import { RowInfraLogs } from './row-infra-logs/row-infra-logs'
import { RowServiceLogs } from './row-service-logs/row-service-logs'

const { Table } = TablePrimitives

const MemoizedRowInfraLogs = memo(RowInfraLogs)
const MemoizedRowServiceLogs = memo(RowServiceLogs)

export interface ListServiceLogsProps {
  clusterId: string
}

export function ListServiceLogs({ clusterId }: ListServiceLogsProps) {
  const { organizationId, projectId, environmentId, serviceId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: service } = useService({ environmentId, serviceId })
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })
  const {
    data: logs = [],
    pauseLogs,
    setPauseLogs,
    newMessagesAvailable,
    setNewMessagesAvailable,
    showPreviousLogs,
    setShowPreviousLogs,
    enabledNginx,
    setEnabledNginx,
  } = useServiceLogs({
    organizationId,
    clusterId,
    projectId,
    environmentId,
    serviceId,
    enabled: service?.serviceType === 'DATABASE' ? service?.mode === 'CONTAINER' : true,
  })

  const hasMultipleContainers = new Set(logs?.map((i) => i.container_name)).size > 1

  const columnHelper = createColumnHelper<
    ServiceLogResponseDto & {
      type: LogType
      id: number
    }
  >()

  const customFilter: FilterFn<ServiceLogResponseDto & { type: LogType; id: number }> = (
    row,
    columnId,
    filterValue
  ) => {
    // Always return true for `INFRA` type logs to ensure they are always visible
    if (row.original.type === 'INFRA') return true

    const rowValue = row.getValue(columnId)
    if (typeof rowValue === 'string') {
      return rowValue.toLowerCase().includes(filterValue.toLowerCase())
    }
    return false
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('pod_name', {
        filterFn: customFilter,
      }),
      columnHelper.accessor('created_at', {}),
      ...(hasMultipleContainers
        ? [
            columnHelper.accessor('container_name', {
              filterFn: customFilter,
            }),
          ]
        : []),
      columnHelper.accessor('version', {
        filterFn: customFilter,
      }),
      columnHelper.accessor('message', {}),
    ],
    [columnHelper, hasMultipleContainers]
  )

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    searchParams.get('pod_name')
      ? [
          {
            id: 'pod_name',
            value: searchParams.get('pod_name'),
          },
        ]
      : []
  )

  const table = useReactTable({
    data: logs,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    enableFilters: true,
    getFilteredRowModel: getFilteredRowModel(),
  })

  const toggleColumnFilter = useCallback(
    (id: string, value: string) => {
      setColumnFilters((prevFilters) => {
        const existingFilter = prevFilters.find((f) => f.id === id)
        const updatedFilters = existingFilter ? prevFilters.filter((f) => f.id !== id) : [...prevFilters, { id, value }]
        if (id === 'pod_name') {
          existingFilter ? searchParams.delete(id) : searchParams.append(id, value)
          setSearchParams(searchParams)
        }
        return updatedFilters
      })
    },
    [searchParams, setSearchParams, setColumnFilters]
  )

  const isFilterActive = useMemo(
    () => (id: string, value: string) => columnFilters.some((f) => f.id === id && f.value === value),
    [columnFilters]
  )

  const [updateTimeContextValue, setUpdateTimeContext] = useState(defaultUpdateTimeContext)

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return

    !pauseLogs && section.scroll(0, section.scrollHeight)
  }, [logs, pauseLogs])

  const podNameColor = useMemo(() => {
    const res = new Map<string, string>()
    for (const { pod_name } of logs) {
      if (!res.has(pod_name)) res.set(pod_name, getColorByPod(pod_name))
    }
    return res
  }, [logs.map((log) => log.pod_name).join(',')]) // Only recalculate when pod names change

  const isServiceProgressing = match(runningStatus?.state)
    .with('RUNNING', 'WARNING', () => true)
    .otherwise(() => false)

  // Temporary solution with `includes` to handle the case where only one log with the message 'No pods found' is received.
  if (!logs || logs.length === 0 || logs[0].message.includes('No pods found')) {
    return (
      <div className="px-1 pb-1">
        <div className="h-[calc(100vh-116px)] bg-neutral-650 pt-11">
          <ServiceLogsPlaceholder
            serviceName={service?.name}
            itemsLength={logs.length}
            databaseMode={service?.serviceType === 'DATABASE' ? service.mode : undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <UpdateTimeContext.Provider
      value={{
        ...updateTimeContextValue,
        setUpdateTimeContext,
      }}
    >
      <div className="h-[calc(100vh-112px)] w-full max-w-[calc(100vw-64px)] overflow-hidden p-1 pt-0">
        <div className="relative h-full border border-neutral-500 bg-neutral-600">
          <div className="flex h-12 w-full items-center justify-between border-b border-neutral-500 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="surface"
                color="neutral"
                className="gap-1.5"
                onClick={() => setEnabledNginx(!enabledNginx)}
              >
                Nginx Logs
                <Icon iconName={enabledNginx ? 'eye-slash' : 'eye'} iconStyle="regular" />
              </Button>
              {table.getState().columnFilters.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-250">
                    {match(c.id)
                      .with('pod_name', () => 'Podname')
                      .with('version', () => 'Version')
                      .with('container_name', () => 'Container')
                      .otherwise(() => '')}
                    :{' '}
                  </span>
                  <Button
                    key={c.id}
                    type="button"
                    variant="surface"
                    color="neutral"
                    className="gap-1.5"
                    radius="full"
                    onClick={() => {
                      searchParams.delete(c.id)
                      setSearchParams(searchParams)
                      setColumnFilters((prevFilters) => prevFilters.filter((f) => f.id !== c.id))
                    }}
                  >
                    <span>{c.value?.toString()}</span>
                    <Icon iconName="xmark" iconStyle="regular" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button size="sm" variant="surface" color="neutral" className="gap-1.5">
                    Time format
                    <Icon iconName="chevron-down" iconStyle="regular" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item
                    className="gap-2"
                    onSelect={() =>
                      setUpdateTimeContext({
                        utc: false,
                      })
                    }
                  >
                    <Icon
                      iconName="check"
                      iconStyle="regular"
                      className={`text-green-500 ${!updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
                    />
                    Local browser time
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="gap-2"
                    onSelect={() =>
                      setUpdateTimeContext({
                        utc: true,
                      })
                    }
                  >
                    <Icon
                      iconName="check"
                      iconStyle="regular"
                      className={`text-green-500 ${updateTimeContextValue.utc ? 'opacity-100' : 'opacity-0'}`}
                    />
                    UTC
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <Button
                onClick={() => download(JSON.stringify(logs), `data-${Date.now()}.json`, 'text/json;charset=utf-8')}
                size="sm"
                variant="surface"
                color="neutral"
                className="w-7 justify-center"
              >
                <Icon iconName="file-arrow-down" iconStyle="regular" />
              </Button>
            </div>
          </div>
          <div
            className="h-full w-full overflow-y-scroll pb-8"
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
            <Table.Root
              className="o
            w-full text-xs"
            >
              <Table.Body className="divide-y-0">
                {table.getRowModel().rows.map((row) => {
                  if (row.original.type === 'INFRA') {
                    return (
                      <MemoizedRowInfraLogs
                        key={row.id}
                        data={row.original}
                        hasMultipleContainers={hasMultipleContainers}
                        enabled={enabledNginx}
                      />
                    )
                  } else {
                    return (
                      <MemoizedRowServiceLogs
                        key={row.id}
                        hasMultipleContainers={hasMultipleContainers}
                        podNameColor={podNameColor}
                        toggleColumnFilter={toggleColumnFilter}
                        isFilterActive={isFilterActive}
                        {...row}
                      />
                    )
                  }
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
    </UpdateTimeContext.Provider>
  )
}

export default ListServiceLogs

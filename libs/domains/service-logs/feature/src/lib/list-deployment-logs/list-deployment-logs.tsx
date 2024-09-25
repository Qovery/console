import {
  type ColumnFiltersState,
  type FilterFn,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import download from 'downloadjs'
import {
  type DeploymentHistoryEnvironment,
  type Environment,
  type EnvironmentLogs,
  type Status,
} from 'qovery-typescript-axios'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeploymentStatus } from '@qovery/domains/services/feature'
import { Button, Icon, TablePrimitives } from '@qovery/shared/ui'
import { DeploymentLogsPlaceholder } from '../deployment-logs-placeholder/deployment-logs-placeholder'
import { useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import { FiltersStageStep } from './filters-stage-step/filters-stage-step'
import { RowDeployment } from './row-deployment/row-deployment'

const { Table } = TablePrimitives

const MemoizedRowDeployment = memo(RowDeployment)

export type FilterType = 'ALL' | 'DEPLOY' | 'BUILD'

export interface ListDeploymentLogsProps {
  environment: Environment
  deploymentHistoryEnvironment: DeploymentHistoryEnvironment[]
  serviceStatus: Status
}

export function ListDeploymentLogs({
  environment,
  deploymentHistoryEnvironment,
  serviceStatus,
}: ListDeploymentLogsProps) {
  const { organizationId, projectId, environmentId, serviceId, versionId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id, serviceId })
  const {
    data: logs = [],
    pauseLogs,
    setPauseLogs,
    newMessagesAvailable,
    setNewMessagesAvailable,
    showPreviousLogs,
    setShowPreviousLogs,
  } = useDeploymentLogs({
    organizationId,
    projectId,
    environmentId,
    serviceId,
    versionId,
  })

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return

    !pauseLogs && section.scroll(0, section.scrollHeight)
  }, [logs, pauseLogs])

  const columnHelper = createColumnHelper<EnvironmentLogs>()

  const customFilter: FilterFn<EnvironmentLogs> = (row, columnId, filterValue) => {
    if (filterValue === 'ALL') return true

    const rowValue = row.getValue(columnId)
    if (typeof rowValue === 'string') {
      return rowValue.toLowerCase().includes(filterValue.toLowerCase())
    }
    return false
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        filterFn: customFilter,
      }),
      columnHelper.accessor('message', {
        filterFn: customFilter,
      }),
      columnHelper.accessor('details.stage.step', {
        id: 'details.stage.step',
        filterFn: customFilter,
      }),
    ],
    [columnHelper]
  )

  const defaultColumnsFilters = useMemo(
    () => [
      {
        id: 'details.stage.step',
        value: 'ALL',
      },
    ],
    []
  )

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultColumnsFilters)

  const table = useReactTable({
    data: logs,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableFilters: true,
    getFilteredRowModel: getFilteredRowModel(),
  })

  const toggleColumnFilter = useCallback(
    (type: FilterType) => {
      setColumnFilters((prevFilters) => {
        const currentFilter = prevFilters.find((filter) => filter.id === 'details.stage.step')
        if (currentFilter?.value === type) {
          return defaultColumnsFilters
        } else {
          return [
            {
              id: 'details.stage.step',
              value: type,
            },
          ]
        }
      })
      setTimeout(() => {
        const section = refScrollSection.current
        section?.scroll(0, section?.scrollHeight)
      }, 10)
    },
    [defaultColumnsFilters]
  )

  const isFilterActive = useMemo(
    () => (type: FilterType) => columnFilters.some((f) => f.value === type),
    [columnFilters]
  )

  const isLastVersion = deploymentHistoryEnvironment?.[0]?.id === versionId || !versionId
  const isDeploymentProgressing = isLastVersion
    ? match(deploymentStatus?.state)
        .with(
          'BUILDING',
          'DEPLOYING',
          'CANCELING',
          'DELETING',
          'RESTARTING',
          'STOPPING',
          'QUEUED',
          'DELETE_QUEUED',
          'RESTART_QUEUED',
          'STOP_QUEUED',
          'DEPLOYMENT_QUEUED',
          () => true
        )
        .otherwise(() => false)
    : false

  if (!logs || logs.length === 0 || !serviceStatus.is_part_last_deployment) {
    return (
      <div className="px-1 pb-1">
        <div className="h-[calc(100vh-116px)] bg-neutral-650 pt-11">
          <DeploymentLogsPlaceholder
            serviceStatus={serviceStatus}
            itemsLength={logs.length}
            deploymentHistoryEnvironment={deploymentHistoryEnvironment}
          />
        </div>
      </div>
    )
  }
  return (
    <div className="h-[calc(100vh-112px)] w-full max-w-[calc(100vw-64px)] overflow-hidden p-1 pt-0">
      <div className="relative h-full border border-neutral-500 bg-neutral-600">
        <div className="flex h-12 w-full items-center justify-between border-b border-neutral-500 px-4 py-2.5">
          <FiltersStageStep
            serviceStatus={serviceStatus}
            isFilterActive={isFilterActive}
            toggleColumnFilter={toggleColumnFilter}
          />
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
        <div
          className="h-full w-full overflow-y-scroll pb-16"
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
          {logs.length >= 500 && (
            <ShowPreviousLogsButton
              showPreviousLogs={showPreviousLogs}
              setShowPreviousLogs={setShowPreviousLogs}
              setPauseLogs={setPauseLogs}
            />
          )}
          <Table.Root className="w-full text-xs">
            <Table.Body className="divide-y-0">
              {table.getRowModel().rows.map((row) => (
                <MemoizedRowDeployment key={row.id} {...row} />
              ))}
            </Table.Body>
          </Table.Root>
          {isDeploymentProgressing && (
            <ProgressIndicator className="mb-2 pl-2" pauseLogs={pauseLogs} message="Streaming service logs" />
          )}
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

export default ListDeploymentLogs

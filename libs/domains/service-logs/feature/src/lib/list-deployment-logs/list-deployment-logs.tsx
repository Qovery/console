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
  type EnvironmentStatus,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ServiceStateChip, useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Button, Icon, Link, TablePrimitives } from '@qovery/shared/ui'
import { DeploymentLogsPlaceholder } from '../deployment-logs-placeholder/deployment-logs-placeholder'
import HeaderLogs from '../header-logs/header-logs'
import { type EnvironmentLogIds, useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import { FiltersStageStep } from './filters-stage-step/filters-stage-step'
import { RowDeploymentLogs } from './row-deployment-logs/row-deployment-logs'

const { Table } = TablePrimitives

const MemoizedRowDeploymentLogs = memo(RowDeploymentLogs)

export type FilterType = 'ALL' | 'DEPLOY' | 'BUILD'

export interface ListDeploymentLogsProps {
  environment: Environment
  deploymentHistoryEnvironment: DeploymentHistoryEnvironment[]
  serviceStatus: Status
  stage?: Stage
  environmentStatus?: EnvironmentStatus
}

export function ListDeploymentLogs({
  environment,
  deploymentHistoryEnvironment,
  environmentStatus,
  serviceStatus,
  stage,
}: ListDeploymentLogsProps) {
  const { hash } = useLocation()
  const { organizationId, projectId, serviceId, versionId } = useParams()
  const refScrollSection = useRef<HTMLDivElement>(null)
  const { updateStageId } = useContext(ServiceStageIdsContext)

  useEffect(() => {
    if (stage) updateStageId(stage.id)
  }, [serviceId, serviceStatus, updateStageId, stage])

  const { data: service } = useService({ environmentId: environment.id, serviceId })
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
    environmentId: environment.id,
    serviceId,
    versionId,
  })

  // `useEffect` used to scroll to the bottom of the logs when new logs are added or when the pauseLogs state changes
  useEffect(() => {
    const section = refScrollSection.current
    if (!section) return

    !pauseLogs && section.scroll(0, section.scrollHeight)
  }, [logs, pauseLogs])

  // `useEffect` used to scroll to the hash id
  useEffect(() => {
    const section = refScrollSection.current
    if (hash && section) {
      setPauseLogs(true)
      setShowPreviousLogs(true)
      const row = document.getElementById(hash.substring(1)) // remove the '#' from the hash
      if (row) {
        // scroll the section to the row's position
        setTimeout(() => {
          const rowPosition = row.getBoundingClientRect().top + section.scrollTop - 160
          section.scrollTo({ top: rowPosition, behavior: 'smooth' })
        }, 50)
      }
    }
  }, [logs, setPauseLogs, setShowPreviousLogs, hash])

  const columnHelper = createColumnHelper<EnvironmentLogIds>()

  const customFilter: FilterFn<EnvironmentLogIds> = (row, columnId, filterValue) => {
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
      <div className="h-full p-1">
        <div className="h-full border border-neutral-500 bg-neutral-650 pt-11">
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
    <div className="h-[calc(100vh-64px)] w-full max-w-[calc(100vw-64px)] overflow-hidden bg-neutral-800 p-1">
      <div className="relative h-full border border-r-0 border-t-0 border-neutral-500 bg-neutral-600">
        <HeaderLogs
          type="DEPLOYMENT"
          environment={environment}
          serviceId={serviceId ?? ''}
          serviceStatus={serviceStatus}
          environmentStatus={environmentStatus}
        >
          <Link
            as="button"
            className="gap-1"
            variant="surface"
            to={ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id) + SERVICE_LOGS_URL(serviceId)}
          >
            {match(service)
              .with({ serviceType: 'DATABASE' }, (db) => db.mode === 'CONTAINER')
              .otherwise(() => true) ? (
              <ServiceStateChip className="mr-1" mode="running" environmentId={environment.id} serviceId={serviceId} />
            ) : null}
            Go to service logs
            <Icon iconName="arrow-right" />
          </Link>
        </HeaderLogs>
        <div className="flex h-12 w-full items-center justify-between border-b border-r border-neutral-500 px-4 py-2.5">
          <FiltersStageStep
            serviceStatus={serviceStatus}
            serviceType={service?.serviceType}
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
          className="max-h-[calc(100vh-170px)] w-full overflow-y-scroll pb-12"
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
                <MemoizedRowDeploymentLogs key={row.id} {...row} />
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

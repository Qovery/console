import { Link, useLocation, useParams } from '@tanstack/react-router'
import {
  type ColumnFiltersState,
  type FilterFn,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import clsx from 'clsx'
import download from 'downloadjs'
import posthog from 'posthog-js'
import {
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { P, match } from 'ts-pattern'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { DevopsCopilotContext } from '@qovery/shared/devops-copilot/context'
import { isHelmRepositorySource, isJobContainerSource } from '@qovery/shared/enums'
import { Button, DropdownMenu, Icon, StatusChip, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { trimId } from '@qovery/shared/util-js'
import { DeploymentLogsPlaceholder } from '../deployment-logs/deployment-logs-placeholder/deployment-logs-placeholder'
import HeaderLogs from '../header-logs/header-logs'
import { type EnvironmentLogIds, useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { useGenerateBuildUsageReport } from '../hooks/use-generate-build-usage-report/use-generate-build-usage-report'
import { useServiceDeploymentHistory } from '../hooks/use-service-deployment-history/use-service-deployment-history'
import { ProgressIndicator } from '../progress-indicator/progress-indicator'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'
import { ShowNewLogsButton } from '../show-new-logs-button/show-new-logs-button'
import { ShowPreviousLogsButton } from '../show-previous-logs-button/show-previous-logs-button'
import { FiltersStageStep } from './filters-stage-step/filters-stage-step'
import { RowDeploymentLogs } from './row-deployment-logs/row-deployment-logs'

const { Table } = TablePrimitives

const MemoizedRowDeploymentLogs = memo(RowDeploymentLogs)

export type FilterType = 'ALL' | 'DEPLOY' | 'BUILD' | 'EXECUTING'

// Waiting back-end to provide correct step names from API documentation
// https://qovery.slack.com/archives/C02NPSG2HBL/p1728485209941179?thread_ts=1727785723.481289&cid=C02NPSG2HBL
enum EnvironmentEngineStep {
  // Build steps
  Build = 'Build',
  Built = 'Built',
  BuiltError = 'BuiltError',

  // Deploy steps
  Deploy = 'Deploy',
  Deployed = 'Deployed',
  DeployedError = 'DeployedError',
  Cancel = 'Cancel',
  Cancelled = 'Cancelled',
  Pause = 'Pause',
  Paused = 'Paused',
  PausedError = 'PausedError',
  Delete = 'Delete',
  Deleted = 'Deleted',
  DeletedError = 'DeletedError',
  LoadConfiguration = 'LoadConfiguration',
  Terminated = 'Terminated',
  Recap = 'Recap',
  Restart = 'Restart',
  Restarted = 'Restarted',
  RestartedError = 'RestartedError',

  // Executing steps
  Executing = 'Executing',

  // Pre-check steps
  PreCheck = 'PreCheck',
  Start = 'Start',
  RetrieveClusterConfig = 'RetrieveClusterConfig',
  RetrieveClusterResources = 'RetrieveClusterResources',
  ValidateSystemRequirements = 'ValidateSystemRequirements',
  ValidateApiInput = 'ValidateApiInput',

  // Configuration transfer
  JobOutput = 'JobOutput',
  DatabaseOutput = 'DatabaseOutput',

  // Global error
  GlobalError = 'GlobalError',

  // Default value
  Unknown = 'Unknown',
}

const getFilterStep = (step: EnvironmentEngineStep): FilterType =>
  match(step)
    .with(
      EnvironmentEngineStep.Build,
      EnvironmentEngineStep.Built,
      EnvironmentEngineStep.BuiltError,
      () => 'BUILD' as const
    )
    .with(
      EnvironmentEngineStep.Deploy,
      EnvironmentEngineStep.Deployed,
      EnvironmentEngineStep.DeployedError,
      EnvironmentEngineStep.Cancel,
      EnvironmentEngineStep.Cancelled,
      EnvironmentEngineStep.Pause,
      EnvironmentEngineStep.Paused,
      EnvironmentEngineStep.PausedError,
      EnvironmentEngineStep.Delete,
      EnvironmentEngineStep.Deleted,
      EnvironmentEngineStep.DeletedError,
      EnvironmentEngineStep.LoadConfiguration,
      EnvironmentEngineStep.Terminated,
      EnvironmentEngineStep.Recap,
      EnvironmentEngineStep.Restart,
      EnvironmentEngineStep.Restarted,
      EnvironmentEngineStep.RestartedError,
      () => 'DEPLOY' as const
    )
    .with(EnvironmentEngineStep.Executing, () => 'EXECUTING' as const)
    // TODO: theses steps are not yet available
    // .with(
    //   EnvironmentEngineStep.PreCheck,
    //   EnvironmentEngineStep.Start,
    //   EnvironmentEngineStep.RetrieveClusterConfig,
    //   EnvironmentEngineStep.RetrieveClusterResources,
    //   EnvironmentEngineStep.ValidateSystemRequirements,
    //   EnvironmentEngineStep.ValidateApiInput,
    //   () => 'Pre-check' as const
    // )
    // .with(EnvironmentEngineStep.JobOutput, EnvironmentEngineStep.DatabaseOutput, () => 'Configuration' as const)
    // .with(EnvironmentEngineStep.GlobalError, () => 'All' as const)
    .otherwise(() => 'ALL' as const)

export interface ListDeploymentLogsProps {
  environment: Environment
  serviceStatus: Status
  stage?: Stage
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

export function ListDeploymentLogs({
  environment,
  environmentStatus,
  serviceStatus,
  stage,
  preCheckStage,
}: ListDeploymentLogsProps) {
  const { hash } = useLocation()
  const { organizationId = '', projectId = '', serviceId = '', executionId = '' } = useParams({ strict: false })
  const refScrollSection = useRef<HTMLDivElement>(null)
  const { updateStageId } = useContext(ServiceStageIdsContext)
  const { setDevopsCopilotOpen, sendMessageRef } = useContext(DevopsCopilotContext)
  const { mutateAsync: generateBuildUsageReport, isLoading: isBuildReportLoading } = useGenerateBuildUsageReport()

  useEffect(() => {
    if (stage) updateStageId(stage.id)
  }, [serviceId, serviceStatus, updateStageId, stage])

  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id, serviceId, suspense: true })
  const { data: deploymentHistory = [] } = useServiceDeploymentHistory({
    environmentId: environment.id,
    serviceId,
    suspense: true,
  })
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
    executionId,
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
      // https://qovery.slack.com/archives/C02NPSG2HBL/p1728487593457479?thread_ts=1727785723.481289&cid=C02NPSG2HBL
      const stepValue = getFilterStep(rowValue as EnvironmentEngineStep)
      return stepValue.toLowerCase().includes(filterValue.toLowerCase())
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

  const isLastVersion = deploymentHistory?.[0]?.identifier.execution_id === executionId || !executionId
  const currentDeployment = executionId
    ? deploymentHistory.find((d) => d.identifier.execution_id === executionId)
    : deploymentHistory[0]
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

  const isCrashLoopDetected = useMemo(() => {
    if (!isDeploymentProgressing) return false
    const warningCounts = new Map<string, number>()
    for (const log of logs) {
      const text = log.message?.safe_message ?? ''
      if (!text.includes('⚠️')) continue
      warningCounts.set(text, (warningCounts.get(text) ?? 0) + 1)
    }
    return [...warningCounts.values()].some((count) => count >= 3)
  }, [logs, isDeploymentProgressing])

  const isError = serviceStatus?.state?.includes('ERROR')
  function HeaderLogsComponent() {
    const currentDeploymentHistory = deploymentHistory.find((d) => d.identifier.execution_id === executionId)

    return (
      <HeaderLogs
        type="DEPLOYMENT"
        environment={environment}
        serviceId={serviceId ?? ''}
        serviceStatus={serviceStatus}
        environmentStatus={environmentStatus}
        deploymentHistory={currentDeployment}
        deploymentHistory={executionId ? currentDeploymentHistory : deploymentHistory[0]}
      >
        <div className="flex items-center gap-4">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" className="gap-1.5">
                <Icon iconName="clock-rotate-left" className="text-neutral-subtle" />
                {isLastVersion
                  ? 'Latest'
                  : dateYearMonthDayHourMinuteSecond(
                      new Date(currentDeploymentHistory?.auditing_data.created_at ?? '')
                    )}
                <Icon iconName="angle-down" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="z-dropdown max-h-96 w-80 overflow-y-auto">
              {deploymentHistory.map((deployment) => (
                <DropdownMenu.Item
                  asChild
                  key={deployment.identifier.execution_id}
                  className={clsx('min-h-9', {
                    'bg-surface-brand-component': deployment.identifier.execution_id === executionId,
                  })}
                >
                  <Link
                    className="flex w-full justify-between"
                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                    params={{
                      organizationId,
                      projectId,
                      environmentId: environment.id,
                      serviceId,
                      executionId: deployment.identifier.execution_id,
                    }}
                    replace={true}
                  >
                    <Tooltip content={deployment.identifier.execution_id}>
                      <span>{trimId(deployment.identifier.execution_id ?? '')}</span>
                    </Tooltip>
                    <span className="flex items-center gap-2.5 text-xs text-neutral-subtle">
                      {dateYearMonthDayHourMinuteSecond(new Date(deployment.auditing_data.created_at))}
                      <StatusChip status={deployment.status} />
                    </span>
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </HeaderLogs>
    )
  }

  if (!logs || logs.length === 0 || !serviceStatus.is_part_last_deployment) {
    return (
      <div className="h-[calc(100vh-208px)] w-full">
        <div className="relative h-full bg-background">
          <HeaderLogsComponent />
          <div className="flex h-[calc(100%-48px)] flex-col items-center justify-between bg-background">
            <div className="flex h-full flex-col items-center justify-center">
              <DeploymentLogsPlaceholder
                environment={environment}
                environmentStatus={environmentStatus}
                serviceStatus={serviceStatus}
                itemsLength={logs.length}
                environmentDeploymentHistory={deploymentHistory}
                preCheckStage={preCheckStage}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="relative h-full bg-background">
        <HeaderLogsComponent />
        <div className="flex w-full items-center justify-between border-b border-neutral px-4 py-2.5">
          <FiltersStageStep
            service={service}
            serviceStatus={serviceStatus}
            isFilterActive={isFilterActive}
            toggleColumnFilter={toggleColumnFilter}
          />
          <div className="flex items-center gap-2">
            {(isError || isCrashLoopDetected) && (
              <Button
                color="brand"
                variant="surface"
                className="gap-1.5"
                onClick={() => {
                  posthog.capture('ai-copilot-troubleshoot-triggered', {
                    source: 'deployment-logs',
                    deployment_id: executionId,
                    trigger_reason: isCrashLoopDetected ? 'crash-loop' : 'error',
                  })
                  const message = `Why did my deployment fail?${executionId ? ` (deployment id: ${executionId})` : ''}`
                  setDevopsCopilotOpen(true)
                  sendMessageRef?.current?.(message)
                }}
              >
                <Icon iconName="sparkles" iconStyle="solid" />
                Launch diagnostic for this error
              </Button>
            )}
            <Button
              onClick={() => download(JSON.stringify(logs), `data-${Date.now()}.json`, 'text/json;charset=utf-8')}
              variant="outline"
              size="sm"
              iconOnly
            >
              <Icon iconName="file-arrow-down" iconStyle="regular" />
            </Button>
            {match(service)
              .with({ serviceType: 'CONTAINER' }, () => false)
              .with({ serviceType: 'DATABASE', mode: 'CONTAINER' }, () => false)
              .with({ serviceType: 'JOB', source: P.when(isJobContainerSource) }, () => false)
              .with({ serviceType: 'HELM', values_override: P.when(isHelmRepositorySource) }, () => false)
              .otherwise(() => true) &&
              currentDeployment?.identifier.execution_id && (
                <Tooltip content={isBuildReportLoading ? 'Generating build usage report…' : 'Build runner usage'}>
                  <span>
                    <Button
                      size="sm"
                      variant="outline"
                      iconOnly
                      loading={isBuildReportLoading}
                      onClick={async () => {
                        try {
                          const res = await generateBuildUsageReport({
                            environmentId: environment.id,
                            executionId: currentDeployment.identifier.execution_id,
                            reportExpirationInSeconds: 3600,
                          })
                          if (res.report_url) {
                            window.open(res.report_url, '_blank')
                          }
                        } catch {
                          // error handled by mutation hook notification
                        }
                      }}
                    >
                      <Icon iconName="chart-line" className={isBuildReportLoading ? 'invisible' : ''} />
                    </Button>
                  </span>
                </Tooltip>
              )}
          </div>
        </div>
        <div
          className="h-[calc(100vh-209px)] w-full overflow-y-scroll "
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
          <Table.Root
            className="w-full border-separate border-spacing-y-0.5 text-xs"
            containerClassName="rounded-none border-none bg-background"
          >
            <Table.Body className="divide-y-0">
              {table.getRowModel().rows.map((row) => (
                <MemoizedRowDeploymentLogs key={row.id} {...row} />
              ))}
            </Table.Body>
          </Table.Root>
          {isDeploymentProgressing && (
            <ProgressIndicator className="mb-2 pl-2" pauseLogs={pauseLogs} message="Streaming deployment logs" />
          )}
        </div>
        {isLastVersion && (
          <ShowNewLogsButton
            pauseLogs={pauseLogs}
            setPauseLogs={setPauseLogs}
            newMessagesAvailable={newMessagesAvailable}
          />
        )}
      </div>
    </div>
  )
}

export default ListDeploymentLogs

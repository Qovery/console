import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useLocation, useNavigate, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  type DeploymentHistoryEnvironmentV2,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { useCallback, useContext, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useService } from '@qovery/domains/services/feature'
import { EmptyState, Heading, Icon, InputSearch } from '@qovery/shared/ui'
import { useIntervalTick } from '@qovery/shared/util-hooks'
import { DeploymentLogsPlaceholder } from '../deployment-logs/deployment-logs-placeholder/deployment-logs-placeholder'
import { useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'
import {
  formatDeploymentLogLineHash,
  getNextDeploymentLogLineRange,
  isDeploymentLogLineSelected,
  parseDeploymentLogLineHash,
} from '../utils/deployment-log-line-selection'
import {
  type DeploymentLogPhase,
  type DeploymentLogPhaseId,
  filterDeploymentLogPhases,
  formatDeploymentLogDuration,
  getDeploymentLogPhaseLabel,
  getDeploymentLogPhases,
  getDeploymentLogStepLabel,
  getDeploymentLogUngroupedStepLabel,
  getSlowestDeploymentLogStepName,
  groupDeploymentLogsByStep,
} from '../utils/deployment-log-steps'
import { BuilderUsageBadges } from './builder-usage-badges'
import { DeploymentLogStatusIcon, DeploymentLogStepRow } from './deployment-log-step-row'

const PHASE_ICONS: Record<DeploymentLogPhaseId, IconName> = {
  PRE_CHECK: 'list-check',
  BUILD: 'hammer',
  DEPLOY: 'rocket',
  EXECUTE: 'play',
}

// Step opened by default: the one running, or the one that failed
function getDefaultOpenStepName(phases: DeploymentLogPhase[]) {
  const steps = phases.flatMap((phase) => phase.steps).filter((step) => step.lines.length > 0)

  return (
    [...steps].reverse().find((step) => step.status === 'ONGOING')?.name ??
    steps.find((step) => step.status === 'ERROR')?.name
  )
}

export interface DeploymentLogsStepsProps {
  environment: Environment
  serviceStatus: Status
  stage?: Stage
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
  deploymentHistory: DeploymentHistoryEnvironmentV2[]
}

export function DeploymentLogsSteps({
  environment,
  serviceStatus,
  stage,
  environmentStatus,
  preCheckStage,
  deploymentHistory,
}: DeploymentLogsStepsProps) {
  const { organizationId = '', projectId = '', serviceId = '', executionId = '' } = useParams({ strict: false })
  const { updateStageId } = useContext(ServiceStageIdsContext)
  const { data: service } = useService({ environmentId: environment.id, serviceId, suspense: true })
  const { data: logs = [] } = useDeploymentLogs({
    organizationId,
    projectId,
    environmentId: environment.id,
    serviceId,
    executionId,
    includePreCheckLogs: true,
    showAllLogs: true,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [openStepOverrides, setOpenStepOverrides] = useState<Record<string, boolean>>({})

  // Lines linked from the URL hash: `#L12`, or `#L12-L20`
  const { hash } = useLocation()
  const navigate = useNavigate()
  const selectedLineRange = useMemo(() => parseDeploymentLogLineHash(hash), [hash])
  // The page opened on a link scrolls to its lines once they're loaded
  const [lineIdToScrollTo, setLineIdToScrollTo] = useState(selectedLineRange?.start)
  const clearLineIdToScrollTo = useCallback(() => setLineIdToScrollTo(undefined), [])
  const selectLine = useCallback(
    (lineId: number, isExtending: boolean) => {
      const nextRange = getNextDeploymentLogLineRange(selectedLineRange, lineId, isExtending)
      navigate({
        hash: nextRange ? formatDeploymentLogLineHash(nextRange) : undefined,
        search: true,
        replace: true,
        resetScroll: false,
        hashScrollIntoView: false,
      })
    },
    [navigate, selectedLineRange]
  )

  useEffect(() => {
    if (stage) updateStageId(stage.id)
  }, [serviceId, serviceStatus, updateStageId, stage])

  const linesByStep = useMemo(() => groupDeploymentLogsByStep(logs), [logs])
  const isSearching = deferredSearchQuery.trim() !== ''

  const action = serviceStatus.status_details?.action
  const actionStatus = serviceStatus.status_details?.status

  const allPhases = getDeploymentLogPhases({
    serviceSteps: serviceStatus.steps?.details,
    preCheckSteps: preCheckStage?.steps,
    linesByStep,
    serviceId,
    nowMs: Date.now(),
  })
  // While searching, only the phases and steps with matching lines are shown
  const phases = filterDeploymentLogPhases(allPhases, deferredSearchQuery)

  useIntervalTick(allPhases.some((phase) => phase.isLive))

  if (logs.length === 0 || !serviceStatus.is_part_last_deployment) {
    return (
      <div className="min-h-0 w-full flex-1">
        <div className="flex h-full flex-col items-center justify-center bg-background">
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
    )
  }

  const defaultOpenStepName = getDefaultOpenStepName(phases)
  // Once the deployment went through, the slowest step shows where time can be saved
  const slowestStepName = actionStatus === 'SUCCESS' ? getSlowestDeploymentLogStepName(allPhases) : undefined
  const builderUsage = serviceStatus.steps?.details?.find((step) => step.step_name === 'BUILD')?.builder_usage
  const stepNamesWithSelectedLines = new Set(
    selectedLineRange
      ? allPhases
          .flatMap((phase) => phase.steps)
          .filter((step) => step.lines.some((line) => isDeploymentLogLineSelected(selectedLineRange, line.id)))
          .map((step) => step.name)
      : []
  )
  const isStepOpen = (name: string, linesCount: number) =>
    openStepOverrides[name] ??
    (isSearching ? linesCount > 0 : name === defaultOpenStepName || stepNamesWithSelectedLines.has(name))

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto">
      <section className="container mx-auto flex flex-col gap-3 px-4 pb-10 pt-8">
        <div className="flex items-center justify-between gap-4">
          <Heading level={2}>Logs</Heading>
          <InputSearch
            className="w-[200px]"
            customSize="h-8 pl-[30px] text-sm"
            iconClassName="left-2.5 text-sm"
            placeholder="Search logs"
            ariaLabel="Search logs"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        {isSearching && phases.length === 0 && (
          <EmptyState
            icon="magnifying-glass"
            title="No matching logs"
            description={`No log line contains "${deferredSearchQuery.trim()}".`}
          />
        )}
        {phases.map((phase) => {
          const isNotStarted = phase.status === 'PENDING' || phase.status === 'SKIP'

          return (
            <div key={phase.id} className="rounded-lg border border-neutral bg-surface-neutral-subtle">
              <div className="flex h-12 items-center justify-between gap-4 px-4 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon
                    iconName={PHASE_ICONS[phase.id]}
                    iconStyle="regular"
                    className={clsx('w-3.5', isNotStarted ? 'text-neutral-disabled' : 'text-neutral')}
                  />
                  <Heading level={3} className={clsx(isNotStarted && 'text-neutral-disabled')}>
                    {getDeploymentLogPhaseLabel(phase.id, action)}
                  </Heading>
                  <DeploymentLogStatusIcon status={phase.status} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {phase.id === 'BUILD' && builderUsage && (
                    <BuilderUsageBadges usage={builderUsage} service={service} />
                  )}
                  {phase.durationSec !== undefined && !isNotStarted && (
                    <span className="text-neutral-subtle">{formatDeploymentLogDuration(phase.durationSec)}</span>
                  )}
                </div>
              </div>
              {/* The steps sit on their own card, its borders over the ones of the phase */}
              <div className="-mx-px -mb-px overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
                {phase.steps.map((step) => {
                  const isOpen = isStepOpen(step.name, step.lines.length)

                  return (
                    <DeploymentLogStepRow
                      key={step.name}
                      step={step}
                      label={
                        step.isUngrouped
                          ? getDeploymentLogUngroupedStepLabel(phase, action)
                          : getDeploymentLogStepLabel(step.name, { action, serviceType: service?.serviceType })
                      }
                      isOpen={isOpen}
                      searchQuery={deferredSearchQuery}
                      isSlowest={step.name === slowestStepName}
                      onToggle={() => setOpenStepOverrides((overrides) => ({ ...overrides, [step.name]: !isOpen }))}
                      selectedLineRange={selectedLineRange}
                      onSelectLine={selectLine}
                      lineIdToScrollTo={lineIdToScrollTo}
                      onScrolledToLine={clearLineIdToScrollTo}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default DeploymentLogsSteps

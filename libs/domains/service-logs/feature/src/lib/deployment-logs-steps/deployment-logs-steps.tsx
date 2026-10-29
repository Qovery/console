import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import {
  type DeploymentHistoryEnvironmentV2,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { useContext, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { isHelmRepositorySource, isJobContainerSource } from '@qovery/shared/enums'
import { Heading, Icon, InputSearch } from '@qovery/shared/ui'
import { useIntervalTick } from '@qovery/shared/util-hooks'
import { DeploymentLogsPlaceholder } from '../deployment-logs/deployment-logs-placeholder/deployment-logs-placeholder'
import { useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'
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

function isServiceBuiltByQovery(service?: AnyService) {
  return match(service)
    .with({ serviceType: 'CONTAINER' }, () => false)
    .with({ serviceType: 'DATABASE', mode: 'CONTAINER' }, () => false)
    .with({ serviceType: 'JOB', source: P.when(isJobContainerSource) }, () => false)
    .with({ serviceType: 'HELM', values_override: P.when(isHelmRepositorySource) }, () => false)
    .otherwise(() => true)
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

  useEffect(() => {
    if (stage) updateStageId(stage.id)
  }, [serviceId, serviceStatus, updateStageId, stage])

  const linesByStep = useMemo(() => groupDeploymentLogsByStep(logs), [logs])
  const isSearching = deferredSearchQuery.trim() !== ''

  const action = serviceStatus.status_details?.action
  const actionStatus = serviceStatus.status_details?.status
  const isDeploymentRunning = match(actionStatus)
    .with('QUEUED', 'ONGOING', 'CANCELING', 'EXECUTING', () => true)
    .otherwise(() => false)
  const expectedPhases: DeploymentLogPhaseId[] =
    action === 'DEPLOY'
      ? [
          ...(isServiceBuiltByQovery(service) ? (['BUILD'] as const) : []),
          'DEPLOY',
          ...(service?.serviceType === 'TERRAFORM' ? (['EXECUTE'] as const) : []),
        ]
      : []

  const phases = filterDeploymentLogPhases(
    getDeploymentLogPhases({
      serviceSteps: serviceStatus.steps?.details,
      preCheckSteps: preCheckStage?.steps,
      linesByStep,
      serviceId,
      expectedPhases,
      // Steps that never started: upcoming while the deployment runs, skipped once it failed, hidden once it succeeded
      notStartedStepStatus: actionStatus === 'SUCCESS' ? undefined : isDeploymentRunning ? 'PENDING' : 'SKIP',
      nowMs: Date.now(),
    }),
    deferredSearchQuery
  )

  useIntervalTick(phases.some((phase) => phase.isLive))

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
  const slowestStepName = actionStatus === 'SUCCESS' ? getSlowestDeploymentLogStepName(phases) : undefined
  const builderUsage = serviceStatus.steps?.details?.find((step) => step.step_name === 'BUILD')?.builder_usage
  const isStepOpen = (name: string, linesCount: number) =>
    openStepOverrides[name] ?? (isSearching ? linesCount > 0 : name === defaultOpenStepName)

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto">
      <section className="container mx-auto flex flex-col gap-3 px-4 pb-10 pt-8">
        <div className="flex items-center justify-between gap-4">
          <Heading level={2}>Logs</Heading>
          <InputSearch
            className="w-[200px]"
            customSize="h-8 text-sm"
            placeholder="Search logs"
            ariaLabel="Search logs"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        {phases.map((phase) => {
          const isNotStarted = phase.status === 'PENDING' || phase.status === 'SKIP'

          return (
            <div key={phase.id} className="rounded-lg border border-neutral bg-surface-neutral-subtle">
              <div className="flex h-12 items-center justify-between gap-4 px-4 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon
                    iconName={PHASE_ICONS[phase.id]}
                    iconStyle="regular"
                    className={clsx('w-3.5', isNotStarted ? 'text-neutral-subtle' : 'text-neutral')}
                  />
                  <Heading level={3} className={clsx(isNotStarted && 'text-neutral-subtle')}>
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
                      isSearching={isSearching}
                      isSlowest={step.name === slowestStepName}
                      onToggle={() => setOpenStepOverrides((overrides) => ({ ...overrides, [step.name]: !isOpen }))}
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

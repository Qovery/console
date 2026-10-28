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
import { Badge, Heading, Icon, InputSearch, Tooltip } from '@qovery/shared/ui'
import { useIntervalTick } from '@qovery/shared/util-hooks'
import { DeploymentLogsPlaceholder } from '../deployment-logs/deployment-logs-placeholder/deployment-logs-placeholder'
import { useDeploymentLogs } from '../hooks/use-deployment-logs/use-deployment-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'
import {
  type DeploymentLogPhase,
  type DeploymentLogPhaseId,
  filterDeploymentLogsByStep,
  formatDeploymentLogDuration,
  getDeploymentLogPhaseLabel,
  getDeploymentLogPhases,
  getDeploymentLogStepLabel,
  groupDeploymentLogsByStep,
  hasDeploymentLogStepNames,
} from '../utils/deployment-log-steps'
import { MOCK_DEPLOYMENT_LOGS, MOCK_PRE_CHECK_STEPS, MOCK_SERVICE_STEPS } from '../utils/deployment-log-steps-mock'
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

  // The API may not send the step of each line yet: fall back to a sample deployment to preview the view
  const isSampleData = logs.length > 0 && !hasDeploymentLogStepNames(logs)
  const displayedLogs = isSampleData ? MOCK_DEPLOYMENT_LOGS : logs

  const linesByStep = useMemo(() => groupDeploymentLogsByStep(displayedLogs), [displayedLogs])
  const filteredLinesByStep = useMemo(
    () => filterDeploymentLogsByStep(linesByStep, deferredSearchQuery),
    [linesByStep, deferredSearchQuery]
  )
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

  const phases = getDeploymentLogPhases({
    serviceSteps: isSampleData ? MOCK_SERVICE_STEPS : serviceStatus.steps?.details,
    preCheckSteps: isSampleData ? MOCK_PRE_CHECK_STEPS : preCheckStage?.steps,
    linesByStep: filteredLinesByStep,
    serviceId,
    expectedPhases: isSampleData ? [] : expectedPhases,
    // Steps that never started: upcoming while the deployment runs, skipped once it failed, hidden once it succeeded
    notStartedStepStatus:
      isSampleData || actionStatus === 'SUCCESS' ? undefined : isDeploymentRunning ? 'PENDING' : 'SKIP',
    nowMs: Date.now(),
  })

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
  const isStepOpen = (name: string, linesCount: number) =>
    openStepOverrides[name] ?? (isSearching ? linesCount > 0 : name === defaultOpenStepName)

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto">
      <section className="container mx-auto flex flex-col gap-3 px-4 pb-10 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heading level={2}>Logs</Heading>
            {isSampleData && (
              <Tooltip content="The API doesn't send the step of each log line yet. This is a sample deployment.">
                <Badge size="sm" color="yellow" variant="surface">
                  Sample data
                </Badge>
              </Tooltip>
            )}
          </div>
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
            <div key={phase.id} className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              <div className="flex items-center gap-2 border-b border-neutral px-4 py-3 text-sm">
                <Icon
                  iconName={PHASE_ICONS[phase.id]}
                  iconStyle="regular"
                  className={clsx('w-3.5', isNotStarted ? 'text-neutral-subtle' : 'text-neutral')}
                />
                <Heading level={3} className={clsx('flex-1', isNotStarted && 'text-neutral-subtle')}>
                  {getDeploymentLogPhaseLabel(phase.id, action)}
                </Heading>
                {phase.durationSec !== undefined && !isNotStarted && (
                  <span className="text-neutral-subtle">{formatDeploymentLogDuration(phase.durationSec)}</span>
                )}
                <DeploymentLogStatusIcon status={phase.status} />
              </div>
              {phase.steps.map((step) => {
                const isOpen = isStepOpen(step.name, step.lines.length)

                return (
                  <DeploymentLogStepRow
                    key={step.name}
                    step={step}
                    label={getDeploymentLogStepLabel(step.name, { action, serviceType: service?.serviceType })}
                    isOpen={isOpen}
                    isSearching={isSearching}
                    onToggle={() => setOpenStepOverrides((overrides) => ({ ...overrides, [step.name]: !isOpen }))}
                  />
                )
              })}
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default DeploymentLogsSteps

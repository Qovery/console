import {
  type EnvironmentLogs,
  type PreCheckStepMetric,
  type ServiceActionEnum,
  type ServiceStepMetric,
  type StepMetricStatusEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { getServiceStepDurationSec, isServiceStepDurationLive } from '../service-step-metrics'
import { type EnvironmentEngineStep, getFilterStep } from './deployment-log-filter-step'

export type DeploymentLogPhaseId = 'PRE_CHECK' | 'BUILD' | 'DEPLOY' | 'EXECUTE'

// `PENDING`: the step has not started yet and the deployment is still running
export type DeploymentLogStepStatus = StepMetricStatusEnum | 'PENDING'

export interface DeploymentLogStep<T extends EnvironmentLogs = EnvironmentLogs> {
  name: string
  status?: DeploymentLogStepStatus
  durationSec?: number
  isLive: boolean
  lines: T[]
  // Holds the lines of the phase that don't name their step
  isUngrouped?: boolean
}

export interface DeploymentLogPhase<T extends EnvironmentLogs = EnvironmentLogs> {
  id: DeploymentLogPhaseId
  status?: DeploymentLogStepStatus
  durationSec?: number
  isLive: boolean
  steps: DeploymentLogStep<T>[]
}

export interface DeploymentLogStepLines<T extends EnvironmentLogs = EnvironmentLogs> {
  phase: DeploymentLogPhaseId
  lines: T[]
}

type StepTiming = Pick<ServiceStepMetric, 'status' | 'started_at' | 'duration_sec'>

interface StepMetric {
  phase: DeploymentLogPhaseId
  status?: DeploymentLogStepStatus
  durationSec: number
  isLive: boolean
}

const PHASE_IDS: DeploymentLogPhaseId[] = ['PRE_CHECK', 'BUILD', 'DEPLOY', 'EXECUTE']

// Display order of the steps of each phase. Step names the API adds later are shown after these ones.
const PHASE_STEP_NAMES: Record<DeploymentLogPhaseId, string[]> = {
  PRE_CHECK: ['CLOUD_CREDENTIALS_CHECK', 'GIT_CHECK'],
  BUILD: [
    'REGISTRY_CREATE_REPOSITORY',
    'BUILD_QUEUEING',
    'GIT_CLONE',
    'PROVISION_BUILDER',
    'BUILD',
    'IMAGE_PUSH',
    'CACHE_EXPORT',
  ],
  DEPLOY: ['DEPLOYMENT_QUEUEING', 'MIRROR_IMAGE', 'DEPLOYMENT', 'ROUTER_DEPLOYMENT'],
  EXECUTE: ['EXECUTING'],
}

// Steps a deployment always runs: they are listed before they start, and as skipped when a failure stops the deployment
const EXPECTED_STEP_NAMES: Record<DeploymentLogPhaseId, string[]> = {
  PRE_CHECK: [],
  BUILD: ['GIT_CLONE', 'BUILD', 'IMAGE_PUSH', 'CACHE_EXPORT'],
  DEPLOY: ['DEPLOYMENT'],
  EXECUTE: ['EXECUTING'],
}

// Lines without `step_name` (older deployments) can't be put in a step: they're listed together, per phase
const UNGROUPED_STEP_NAMES: Record<DeploymentLogPhaseId, string> = {
  PRE_CHECK: 'PRE_CHECK_UNGROUPED',
  BUILD: 'BUILD_UNGROUPED',
  DEPLOY: 'DEPLOY_UNGROUPED',
  EXECUTE: 'EXECUTE_UNGROUPED',
}

const STEP_PHASES = new Map<string, DeploymentLogPhaseId>(
  PHASE_IDS.flatMap((phase) => PHASE_STEP_NAMES[phase].map((name) => [name, phase] as const))
)

// Sub-steps of BUILD that run before the image build itself
const BUILD_SUB_STEPS_BEFORE_IMAGE_BUILD = new Set(['PROVISION_BUILDER'])

function getPhaseFromStageStep(stageStep?: string): DeploymentLogPhaseId {
  if (stageStep === 'PreCheck') return 'PRE_CHECK'

  return match(getFilterStep(stageStep as EnvironmentEngineStep))
    .with('BUILD', () => 'BUILD' as const)
    .with('EXECUTING', () => 'EXECUTE' as const)
    .otherwise(() => 'DEPLOY' as const)
}

/**
 * Returns the phase and step a log line belongs to.
 * `step_name` names the step, `stage.step` gives the phase when the step name is generic, unknown or absent.
 */
export function getDeploymentLogLineStep(log: EnvironmentLogs): { phase: DeploymentLogPhaseId; name: string } {
  const stagePhase = getPhaseFromStageStep(log.details.stage?.step)
  const stepName = log.details.step_name

  if (!stepName) return { phase: stagePhase, name: UNGROUPED_STEP_NAMES[stagePhase] }

  // Queueing lines share one name: their stage tells which queue they wait in
  if (stepName === 'QUEUEING') {
    return stagePhase === 'BUILD'
      ? { phase: 'BUILD', name: 'BUILD_QUEUEING' }
      : { phase: 'DEPLOY', name: 'DEPLOYMENT_QUEUEING' }
  }

  return { phase: STEP_PHASES.get(stepName) ?? stagePhase, name: stepName }
}

/**
 * Groups log lines by step name, keeping their order.
 */
export function groupDeploymentLogsByStep<T extends EnvironmentLogs>(logs: T[]) {
  const groups = new Map<string, DeploymentLogStepLines<T>>()

  for (const log of logs) {
    const { phase, name } = getDeploymentLogLineStep(log)
    const group = groups.get(name)
    if (group) {
      group.lines.push(log)
    } else {
      groups.set(name, { phase, lines: [log] })
    }
  }

  return groups
}

function getStepMetric(phase: DeploymentLogPhaseId, step: StepTiming, nowMs: number): StepMetric {
  return {
    phase,
    status: step.status,
    durationSec: getServiceStepDurationSec(step, nowMs),
    isLive: isServiceStepDurationLive(step),
  }
}

/**
 * BUILD includes its sub-steps (builder provisioning, image push, cache export), which have their own rows.
 * Its row keeps the time and status of the image build alone, so the rows of the phase add up to its total.
 */
function getBuildStepMetric(build: ServiceStepMetric, nowMs: number): StepMetric {
  const subSteps = build.sub_steps ?? []
  const subStepsDurationSec = subSteps.reduce(
    (totalDurationSec, subStep) => totalDurationSec + getServiceStepDurationSec(subStep, nowMs),
    0
  )
  const durationSec = Math.max(0, getServiceStepDurationSec(build, nowMs) - subStepsDurationSec)
  const hasImageBuildEnded = subSteps.some((subStep) => !BUILD_SUB_STEPS_BEFORE_IMAGE_BUILD.has(subStep.name))
  const isProvisioningBuilder = subSteps.some(
    (subStep) => BUILD_SUB_STEPS_BEFORE_IMAGE_BUILD.has(subStep.name) && subStep.status === 'ONGOING'
  )
  const hasSubStepWithBuildStatus = subSteps.some((subStep) => subStep.status === build.status)

  const status = match(build.status)
    .with('ONGOING', (status) => {
      if (hasImageBuildEnded) return 'SUCCESS' as const
      if (isProvisioningBuilder) return 'PENDING' as const
      return status
    })
    // The sub-step that failed or was canceled carries the status, the image build itself went through
    .with('ERROR', 'CANCEL', (status) => (hasSubStepWithBuildStatus ? ('SUCCESS' as const) : status))
    .otherwise((status) => status)

  return {
    phase: 'BUILD',
    status,
    durationSec,
    isLive: status === 'ONGOING' && isServiceStepDurationLive(build),
  }
}

function getStepMetrics({
  serviceSteps = [],
  preCheckSteps = [],
  serviceId,
  nowMs,
}: {
  serviceSteps?: ServiceStepMetric[]
  preCheckSteps?: PreCheckStepMetric[]
  serviceId: string
  nowMs: number
}) {
  const metrics = new Map<string, StepMetric>()

  for (const step of preCheckSteps) {
    // Git is checked once per service: keep the check of this service only
    if (step.service_id && step.service_id !== serviceId) continue
    metrics.set(step.name, getStepMetric('PRE_CHECK', step, nowMs))
  }

  for (const step of serviceSteps) {
    if (!step.step_name) continue

    if (step.step_name === 'BUILD') {
      metrics.set('BUILD', getBuildStepMetric(step, nowMs))
      for (const subStep of step.sub_steps ?? []) {
        metrics.set(subStep.name, getStepMetric('BUILD', subStep, nowMs))
      }
    } else {
      metrics.set(step.step_name, getStepMetric(STEP_PHASES.get(step.step_name) ?? 'DEPLOY', step, nowMs))
    }
  }

  return metrics
}

function getPhaseStatus(steps: DeploymentLogStep[]): DeploymentLogStepStatus | undefined {
  const statuses = new Set(steps.map((step) => step.status))

  if (statuses.has('ERROR')) return 'ERROR'
  if (statuses.has('ONGOING')) return 'ONGOING'
  if (statuses.has('CANCEL')) return 'CANCEL'
  // Some steps are done and the next ones haven't started yet
  if (statuses.has('SUCCESS') && statuses.has('PENDING')) return 'ONGOING'
  if (statuses.has('SUCCESS')) return 'SUCCESS'
  if (statuses.has('PENDING')) return 'PENDING'
  if (statuses.has('SKIP')) return 'SKIP'
  return undefined
}

export interface GetDeploymentLogPhasesProps<T extends EnvironmentLogs> {
  serviceSteps?: ServiceStepMetric[]
  preCheckSteps?: PreCheckStepMetric[]
  linesByStep: Map<string, DeploymentLogStepLines<T>>
  serviceId: string
  // Phases listed even when none of their steps has started
  expectedPhases?: DeploymentLogPhaseId[]
  // How the expected steps that haven't started are shown. Leave it unset to hide them.
  notStartedStepStatus?: Extract<DeploymentLogStepStatus, 'PENDING' | 'SKIP'>
  nowMs: number
}

/**
 * Builds the phases (pre-check, build, deploy, execute) of a deployment and their steps,
 * from the step metrics of the deployment statuses and the log lines grouped by step.
 */
export function getDeploymentLogPhases<T extends EnvironmentLogs>({
  serviceSteps,
  preCheckSteps,
  linesByStep,
  serviceId,
  expectedPhases = [],
  notStartedStepStatus,
  nowMs,
}: GetDeploymentLogPhasesProps<T>): DeploymentLogPhase<T>[] {
  const metrics = getStepMetrics({ serviceSteps, preCheckSteps, serviceId, nowMs })

  return PHASE_IDS.flatMap((phaseId) => {
    const knownStepNames = PHASE_STEP_NAMES[phaseId]
    const ungroupedStepName = UNGROUPED_STEP_NAMES[phaseId]
    const otherStepNames = new Set(
      [...metrics, ...linesByStep]
        .filter(
          ([name, { phase }]) => phase === phaseId && !knownStepNames.includes(name) && name !== ungroupedStepName
        )
        .map(([name]) => name)
    )
    const isExpectedPhase = expectedPhases.includes(phaseId)

    const steps = [...knownStepNames, ...otherStepNames].flatMap((name): DeploymentLogStep<T>[] => {
      const metric = metrics.get(name)
      const lines = linesByStep.get(name)?.lines ?? []
      const isExpectedStep = isExpectedPhase && EXPECTED_STEP_NAMES[phaseId].includes(name)

      if (metric || lines.length > 0) {
        // A step that took no time and logged nothing is noise, unless every deployment runs it
        const isEmptyStep =
          lines.length === 0 && metric?.durationSec === 0 && metric.status !== 'ONGOING' && metric.status !== 'ERROR'
        if (isEmptyStep && !isExpectedStep) return []

        return [
          {
            name,
            status: metric?.status,
            durationSec: metric?.durationSec,
            isLive: metric?.isLive ?? false,
            lines,
          },
        ]
      }

      if (isExpectedStep && notStartedStepStatus) {
        return [{ name, status: notStartedStepStatus, isLive: false, lines: [] }]
      }

      return []
    })

    const ungroupedLines = linesByStep.get(ungroupedStepName)?.lines ?? []
    if (steps.length === 0 && ungroupedLines.length === 0) return []

    const timedSteps = steps.filter((step) => step.durationSec !== undefined)
    const phase = {
      id: phaseId,
      status: getPhaseStatus(steps),
      durationSec:
        timedSteps.length > 0
          ? timedSteps.reduce((totalDurationSec, step) => totalDurationSec + (step.durationSec ?? 0), 0)
          : undefined,
      isLive: steps.some((step) => step.isLive),
    }

    if (ungroupedLines.length === 0) return [{ ...phase, steps }]

    // Some lines name their step: the others come after the steps
    if (steps.some((step) => step.lines.length > 0)) {
      return [
        {
          ...phase,
          steps: [...steps, { name: ungroupedStepName, isLive: false, lines: ungroupedLines, isUngrouped: true }],
        },
      ]
    }

    // No line names its step: the steps are replaced by all the lines of the phase, with its status and duration
    return [
      {
        ...phase,
        steps: [
          {
            name: ungroupedStepName,
            status: phase.status,
            durationSec: phase.durationSec,
            isLive: phase.isLive,
            lines: ungroupedLines,
            isUngrouped: true,
          },
        ],
      },
    ]
  })
}

/**
 * Keeps only the lines whose message contains the query, ignoring case. Steps without a matching line stay listed.
 */
export function filterDeploymentLogPhases<T extends EnvironmentLogs>(phases: DeploymentLogPhase<T>[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return phases

  return phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => ({
      ...step,
      lines: step.lines.filter((log) =>
        (log.message?.safe_message ?? log.error?.user_log_message ?? '').toLowerCase().includes(normalizedQuery)
      ),
    })),
  }))
}

/**
 * Returns the step that took the longest across every phase.
 * Rows of lines without step are left out: they time a whole phase, not a step.
 */
export function getSlowestDeploymentLogStepName(phases: DeploymentLogPhase[]) {
  const timedSteps = phases
    .flatMap((phase) => phase.steps)
    .filter((step) => !step.isUngrouped && (step.durationSec ?? 0) > 0)
  if (timedSteps.length < 2) return undefined

  return timedSteps.reduce((slowestStep, step) =>
    (step.durationSec ?? 0) > (slowestStep.durationSec ?? 0) ? step : slowestStep
  ).name
}

/**
 * Formats a duration the way step durations read in the logs: `7s`, `2min 8s`, `1h 5min`.
 */
export function formatDeploymentLogDuration(durationSec: number) {
  const hours = Math.floor(durationSec / 3600)
  const minutes = Math.floor((durationSec % 3600) / 60)
  const seconds = Math.floor(durationSec % 60)

  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
  if (minutes > 0) return seconds > 0 ? `${minutes}min ${seconds}s` : `${minutes}min`
  return `${seconds}s`
}

const STEP_LABELS: Record<string, string> = {
  CLOUD_CREDENTIALS_CHECK: 'Checking cloud credentials',
  GIT_CHECK: 'Checking Git repository',
  REGISTRY_CREATE_REPOSITORY: 'Creating registry repository',
  BUILD_QUEUEING: 'Waiting for a builder',
  GIT_CLONE: 'Cloning repository',
  PROVISION_BUILDER: 'Provisioning builder',
  BUILD: 'Building image',
  IMAGE_PUSH: 'Pushing image',
  CACHE_EXPORT: 'Saving build cache',
  DEPLOYMENT_QUEUEING: 'Waiting in deployment queue',
  MIRROR_IMAGE: 'Mirroring image',
  ROUTER_DEPLOYMENT: 'Exposing it publicly',
  EXECUTING: 'Executing',
}

function getServiceNoun(serviceType?: AnyService['serviceType']) {
  return match(serviceType)
    .with('DATABASE', () => 'database')
    .with('JOB', () => 'job')
    .with('HELM', () => 'chart')
    .with('TERRAFORM', () => 'service')
    .otherwise(() => 'application')
}

export function getDeploymentLogStepLabel(
  name: string,
  { action, serviceType }: { action?: ServiceActionEnum; serviceType?: AnyService['serviceType'] } = {}
) {
  if (name === 'DEPLOYMENT') {
    const verb = match(action)
      .with('STOP', () => 'Stopping')
      .with('RESTART', () => 'Restarting')
      .with('DELETE', () => 'Deleting')
      .otherwise(() => 'Deploying')
    return `${verb} ${getServiceNoun(serviceType)}`
  }

  if (STEP_LABELS[name]) return STEP_LABELS[name]

  // Step names the API adds later: `NEW_STEP` reads `New step`
  const words = name.toLowerCase().replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Names the row of the lines without step: all the logs of the phase, or the ones left once the others are in steps.
 */
export function getDeploymentLogUngroupedStepLabel(phase: DeploymentLogPhase, action?: ServiceActionEnum) {
  return phase.steps.length === 1 ? `${getDeploymentLogPhaseLabel(phase.id, action)} logs` : 'Other logs'
}

export function getDeploymentLogPhaseLabel(id: DeploymentLogPhaseId, action?: ServiceActionEnum) {
  return match(id)
    .with('PRE_CHECK', () => 'Pre-check')
    .with('BUILD', () => 'Build')
    .with('EXECUTE', () => 'Execute')
    .with('DEPLOY', () =>
      match(action)
        .with('STOP', () => 'Stop')
        .with('RESTART', () => 'Restart')
        .with('DELETE', () => 'Delete')
        .otherwise(() => 'Deploy')
    )
    .exhaustive()
}

import {
  type EnvironmentLogs,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type PreCheckStepMetric,
  type ServiceActionEnum,
  type ServiceStepMetric,
  type StageStepMetric,
  type StepMetricStatusEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { LogsType } from '@qovery/shared/enums'
import { getServiceStepDurationSec, isServiceStepDurationLive } from '../service-step-metrics'
import { stripAnsi } from './ansi-text-matches'
import { type EnvironmentEngineStep, getFilterStep } from './deployment-log-filter-step'

export type DeploymentLogPhaseId = 'PRE_CHECK' | 'BUILD' | 'DEPLOY' | 'EXECUTE'

// `PENDING`: the step has not started yet while the deployment runs
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

// Wait of the deployment stage before the engine runs it. It's not the queue of the build or of the deployment
// (`BUILD_QUEUEING`, `DEPLOYMENT_QUEUEING`), which the engine times inside the stage.
const STAGE_QUEUEING_STEP_NAME = 'STAGE_QUEUEING'

// Display order of the steps of each phase. Step names the API adds later are shown after these ones.
const PHASE_STEP_NAMES: Record<DeploymentLogPhaseId, string[]> = {
  PRE_CHECK: ['CLOUD_CREDENTIALS_CHECK', 'GIT_CHECK', STAGE_QUEUEING_STEP_NAME],
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

function getPhaseFromStageStep(stageStep?: string): DeploymentLogPhaseId | undefined {
  if (stageStep === 'PreCheck') return 'PRE_CHECK'

  return match(getFilterStep(stageStep as EnvironmentEngineStep))
    .with('BUILD', () => 'BUILD' as const)
    .with('DEPLOY', () => 'DEPLOY' as const)
    .with('EXECUTING', () => 'EXECUTE' as const)
    .otherwise(() => undefined)
}

/**
 * Returns the phase and step a log line belongs to.
 * `step_name` names the step, `stage.step` gives the phase when the step name is generic, unknown or absent.
 * The phase is missing when neither tells it, like for a `GlobalError` line without a step name.
 */
export function getDeploymentLogLineStep(log: EnvironmentLogs): { phase?: DeploymentLogPhaseId; name?: string } {
  const stageStep = log.details.stage?.step
  const stepName = log.details.step_name

  // `QUEUEING` lines tell the wait of the stage for the engine, before its build and deployment start
  if (stepName === 'QUEUEING' || stageStep === 'Queueing') return { phase: 'PRE_CHECK', name: STAGE_QUEUEING_STEP_NAME }

  const phase = (stepName ? STEP_PHASES.get(stepName) : undefined) ?? getPhaseFromStageStep(stageStep)
  if (!phase) return { name: stepName || undefined }

  return { phase, name: stepName || UNGROUPED_STEP_NAMES[phase] }
}

/**
 * Groups log lines by step name, keeping their order.
 * A line whose phase is unknown belongs to the phase running when it was logged: the phase of the line before it,
 * or of the first line after it with a phase when it comes first.
 */
export function groupDeploymentLogsByStep<T extends EnvironmentLogs>(logs: T[]) {
  const groups = new Map<string, DeploymentLogStepLines<T>>()
  let currentPhase: DeploymentLogPhaseId | undefined
  // Lines logged before any phase is known
  let linesWithoutPhase: { log: T; name?: string }[] = []

  const addLine = (log: T, phase: DeploymentLogPhaseId, name = UNGROUPED_STEP_NAMES[phase]) => {
    const group = groups.get(name)
    if (group) {
      group.lines.push(log)
    } else {
      groups.set(name, { phase, lines: [log] })
    }
  }

  const addLinesWithoutPhase = (phase: DeploymentLogPhaseId) => {
    for (const { log, name } of linesWithoutPhase) addLine(log, phase, name)
    linesWithoutPhase = []
  }

  for (const log of logs) {
    const { phase, name } = getDeploymentLogLineStep(log)

    if (phase) {
      currentPhase = phase
      addLinesWithoutPhase(phase)
      addLine(log, phase, name)
    } else if (currentPhase) {
      addLine(log, currentPhase, name)
    } else {
      linesWithoutPhase.push({ log, name })
    }
  }

  // No line tells the phase: they're listed in the deployment
  addLinesWithoutPhase('DEPLOY')

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
  const subStepWithBuildStatus = subSteps.find((subStep) => subStep.status === build.status)

  const status = match(build.status)
    .with('ONGOING', (status) => {
      if (hasImageBuildEnded) return 'SUCCESS' as const
      if (isProvisioningBuilder) return 'PENDING' as const
      return status
    })
    .with('ERROR', 'CANCEL', (status) => {
      if (!subStepWithBuildStatus) return status
      // A provisioning failure prevents the image build; later sub-steps run only after it succeeded
      return BUILD_SUB_STEPS_BEFORE_IMAGE_BUILD.has(subStepWithBuildStatus.name)
        ? ('SKIP' as const)
        : ('SUCCESS' as const)
    })
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
  stageSteps = [],
  linesByStep,
  serviceId,
  nowMs,
}: {
  serviceSteps?: ServiceStepMetric[]
  preCheckSteps?: PreCheckStepMetric[]
  stageSteps?: StageStepMetric[]
  linesByStep: Map<string, DeploymentLogStepLines>
  serviceId: string
  nowMs: number
}) {
  const metrics = new Map<string, StepMetric>()

  for (const step of preCheckSteps) {
    // Git is checked once per service: keep the check of this service only
    if (step.service_id && step.service_id !== serviceId) continue
    metrics.set(step.name, getStepMetric('PRE_CHECK', step, nowMs))
  }

  const stageQueueing = stageSteps.find((step) => step.step_name === 'QUEUEING')
  if (stageQueueing) metrics.set(STAGE_QUEUEING_STEP_NAME, getStepMetric('PRE_CHECK', stageQueueing, nowMs))

  for (const step of serviceSteps) {
    if (!step.step_name) continue

    if (step.step_name === 'BUILD') {
      metrics.set('BUILD', getBuildStepMetric(step, nowMs))
      for (const subStep of step.sub_steps ?? []) {
        metrics.set(subStep.name, getStepMetric('BUILD', subStep, nowMs))
      }
    } else {
      // A step the API adds later goes in the phase its lines tell, so its metrics and lines stay on one row
      const phase = STEP_PHASES.get(step.step_name) ?? linesByStep.get(step.step_name)?.phase ?? 'DEPLOY'
      metrics.set(step.step_name, getStepMetric(phase, step, nowMs))
    }
  }

  return metrics
}

function getPhaseStatus(steps: Pick<DeploymentLogStep, 'status'>[]): DeploymentLogStepStatus | undefined {
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
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
  // Steps of the deployment stage of the service, for the wait of the stage
  stageSteps?: StageStepMetric[]
  linesByStep: Map<string, DeploymentLogStepLines<T>>
  serviceId: string
  nowMs: number
}

/**
 * Builds the phases (pre-check, build, deploy, execute) of a deployment and their steps,
 * from the step metrics of the deployment statuses and the log lines grouped by step.
 * Only the steps the API reports are listed: steps that haven't started yet aren't known.
 */
export function getDeploymentLogPhases<T extends EnvironmentLogs>({
  serviceSteps,
  preCheckStage,
  stageSteps,
  linesByStep,
  serviceId,
  nowMs,
}: GetDeploymentLogPhasesProps<T>): DeploymentLogPhase<T>[] {
  const metrics = getStepMetrics({
    serviceSteps,
    preCheckSteps: preCheckStage?.steps,
    stageSteps,
    linesByStep,
    serviceId,
    nowMs,
  })

  const stepsByPhase = PHASE_IDS.map((phaseId) => {
    const knownStepNames = PHASE_STEP_NAMES[phaseId]
    const ungroupedStepName = UNGROUPED_STEP_NAMES[phaseId]
    const otherStepNames = new Set(
      [...metrics, ...linesByStep]
        .filter(
          ([name, { phase }]) => phase === phaseId && !knownStepNames.includes(name) && name !== ungroupedStepName
        )
        .map(([name]) => name)
    )

    const steps = [...knownStepNames, ...otherStepNames].flatMap((name): DeploymentLogStep<T>[] => {
      const metric = metrics.get(name)
      const lines = linesByStep.get(name)?.lines ?? []

      if (metric || lines.length > 0) {
        // A step that went through in no time and logged nothing is noise, like a queue without wait
        const isEmptyStep = lines.length === 0 && metric?.durationSec === 0 && metric.status === 'SUCCESS'
        if (isEmptyStep) return []

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

      return []
    })

    return { phaseId, steps }
  })

  // Steps without status that come after the running step haven't started yet
  const runningStepIndex = stepsByPhase
    .flatMap(({ steps }) => steps)
    .map((step) => step.status)
    .lastIndexOf('ONGOING')
  let stepIndex = 0
  for (const { steps } of stepsByPhase) {
    for (const step of steps) {
      if (runningStepIndex >= 0 && stepIndex > runningStepIndex && !step.status) step.status = 'PENDING'
      stepIndex++
    }
  }

  return stepsByPhase.flatMap(({ phaseId, steps }) => {
    const ungroupedStepName = UNGROUPED_STEP_NAMES[phaseId]
    const ungroupedLines = linesByStep.get(ungroupedStepName)?.lines ?? []
    if (steps.length === 0 && ungroupedLines.length === 0) return []

    const timedSteps = steps.filter((step) => step.durationSec !== undefined)
    // Pre-checks without step metrics (older deployments, or no check run) only have the status and time of the
    // pre-check stage, which add up with the wait of the stage
    const preCheckStageMetric =
      phaseId === 'PRE_CHECK' && steps.every((step) => !step.status || step.name === STAGE_QUEUEING_STEP_NAME)
        ? preCheckStage
        : undefined
    const stepsDurationSec =
      timedSteps.length > 0
        ? timedSteps.reduce((totalDurationSec, step) => totalDurationSec + (step.durationSec ?? 0), 0)
        : undefined
    const preCheckStageDurationSec = preCheckStageMetric?.total_duration_sec
    const phase = {
      id: phaseId,
      status: getPhaseStatus(preCheckStageMetric?.status ? [...steps, { status: preCheckStageMetric.status }] : steps),
      durationSec:
        preCheckStageDurationSec !== undefined ? (stepsDurationSec ?? 0) + preCheckStageDurationSec : stepsDurationSec,
      isLive: steps.some((step) => step.isLive),
    }

    if (ungroupedLines.length === 0) return [{ ...phase, steps }]

    // The step metrics may have missed the failure of the lines that name no step: an error line among them tells
    // the phase failed once it no longer runs
    const hasErrorLine = ungroupedLines.some((line) => line.type === LogsType.ERROR)
    const ungroupedErrorStatus = hasErrorLine && phase.status !== 'ONGOING' ? ('ERROR' as const) : undefined

    // Some lines name their step: the others come after the steps
    if (steps.some((step) => step.lines.length > 0)) {
      return [
        {
          ...phase,
          status: ungroupedErrorStatus ?? phase.status,
          steps: [
            ...steps,
            {
              name: ungroupedStepName,
              status: ungroupedErrorStatus,
              isLive: false,
              lines: ungroupedLines,
              isUngrouped: true,
            },
          ],
        },
      ]
    }

    // No line names its step (older deployments): the steps are replaced by all the lines of the phase, with its
    // status and duration, which may also time only the part that went through
    const status = ungroupedErrorStatus ?? phase.status
    return [
      {
        ...phase,
        status,
        steps: [
          {
            name: ungroupedStepName,
            status,
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
 * Returns the message a log line shows: the error explained to the user on error lines.
 */
export function getDeploymentLogLineMessage(log: EnvironmentLogs) {
  return (log.type === LogsType.ERROR ? log.error?.user_log_message : log.message?.safe_message) ?? ''
}

/**
 * Keeps only the lines whose message contains the query, ignoring case and colors,
 * and the steps and phases that still have lines.
 */
export function filterDeploymentLogPhases<T extends EnvironmentLogs>(phases: DeploymentLogPhase<T>[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return phases

  return phases.flatMap((phase) => {
    const steps = phase.steps.flatMap((step) => {
      const lines = step.lines.filter((log) =>
        stripAnsi(getDeploymentLogLineMessage(log)).toLowerCase().includes(normalizedQuery)
      )
      return lines.length > 0 ? [{ ...step, lines }] : []
    })
    return steps.length > 0 ? [{ ...phase, steps }] : []
  })
}

/**
 * Returns the step that took the longest across every phase.
 * Rows of lines without step are left out: they time a whole phase, not a step. So is the wait of the stage, which
 * waits for the other deployments and isn't work of the service to speed up.
 */
export function getSlowestDeploymentLogStepName(phases: DeploymentLogPhase[]) {
  const timedSteps = phases
    .flatMap((phase) => phase.steps)
    .filter((step) => !step.isUngrouped && step.name !== STAGE_QUEUEING_STEP_NAME && (step.durationSec ?? 0) > 0)
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
  [STAGE_QUEUEING_STEP_NAME]: 'Waiting in stage queue',
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

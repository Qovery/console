import { type ServiceStepMetric } from 'qovery-typescript-axios'

const NON_COMPUTING_STEP_NAMES = new Set<ServiceStepMetric['step_name']>(['BUILD_QUEUEING', 'DEPLOYMENT_QUEUEING'])

export function isServiceStepIncludedInComputingDuration(step: ServiceStepMetric) {
  return step.step_name !== undefined && !NON_COMPUTING_STEP_NAMES.has(step.step_name)
}

export function isServiceStepDurationLive(step: ServiceStepMetric) {
  if (step.status !== 'ONGOING' || !step.started_at) return false

  return Number.isFinite(Date.parse(step.started_at))
}

export function getServiceStepDurationSec(step: ServiceStepMetric, nowMs: number) {
  if (!isServiceStepDurationLive(step)) return step.duration_sec || 0

  const startedAtMs = Date.parse(step.started_at ?? '')
  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1_000))
}

export function getServiceStepsDurationSec(steps: ServiceStepMetric[], nowMs: number) {
  return steps.reduce((totalDurationSec, step) => totalDurationSec + getServiceStepDurationSec(step, nowMs), 0)
}

export function getServiceStepsComputingDurationSec(steps: ServiceStepMetric[], nowMs: number) {
  return steps.reduce(
    (totalDurationSec, step) =>
      isServiceStepIncludedInComputingDuration(step)
        ? totalDurationSec + getServiceStepDurationSec(step, nowMs)
        : totalDurationSec,
    0
  )
}

export function hasLiveServiceStepComputingDuration(steps: ServiceStepMetric[]) {
  return steps.some((step) => isServiceStepIncludedInComputingDuration(step) && isServiceStepDurationLive(step))
}

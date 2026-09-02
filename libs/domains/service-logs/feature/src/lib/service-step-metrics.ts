import { type ServiceStepMetric } from 'qovery-typescript-axios'

const NON_COMPUTING_STEP_NAMES = new Set<ServiceStepMetric['step_name']>(['BUILD_QUEUEING', 'DEPLOYMENT_QUEUEING'])

/**
 * Returns whether a step contributes to the header's computing timer and q-core's `total_computing_duration_sec`.
 * Unlike stage and wall-clock durations, computing time excludes build and deployment queueing.
 */
export function isServiceStepIncludedInComputingDuration(step: ServiceStepMetric) {
  return step.step_name !== undefined && !NON_COMPUTING_STEP_NAMES.has(step.step_name)
}

/**
 * Returns whether an individual step should advance from its backend `started_at` timestamp.
 * Completed steps may retain this timestamp, so the `ONGOING` status is essential to keep their final duration frozen.
 */
export function isServiceStepDurationLive(step: ServiceStepMetric) {
  if (step.status !== 'ONGOING' || !step.started_at) return false

  return Number.isFinite(Date.parse(step.started_at))
}

/**
 * Returns an individual step's live elapsed time while ongoing, or its backend-recorded duration otherwise.
 * This also provides a stable fallback when `started_at` is missing or malformed.
 */
export function getServiceStepDurationSec(step: ServiceStepMetric, nowMs: number) {
  if (!isServiceStepDurationLive(step)) return step.duration_sec || 0

  const startedAtMs = Date.parse(step.started_at ?? '')
  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1_000))
}

/**
 * Calculates a Build, Deploy, or Executing stage timer by adding every step assigned to that stage.
 * Queueing is intentionally included because these timers represent the complete elapsed time of each stage.
 */
export function getServiceStepsDurationSec(steps: ServiceStepMetric[], nowMs: number) {
  return steps.reduce((totalDurationSec, step) => totalDurationSec + getServiceStepDurationSec(step, nowMs), 0)
}

/**
 * Calculates the live header timer by adding completed and ongoing computing steps while excluding queueing.
 * This keeps it comparable with q-core's completed computing total rather than the deployment history's wall-clock total.
 */
export function getServiceStepsComputingDurationSec(steps: ServiceStepMetric[], nowMs: number) {
  return steps.reduce(
    (totalDurationSec, step) =>
      isServiceStepIncludedInComputingDuration(step)
        ? totalDurationSec + getServiceStepDurationSec(step, nowMs)
        : totalDurationSec,
    0
  )
}

/**
 * Returns whether the header needs a one-second client-side update for an ongoing computing step.
 * Queue-only and completed deployments remain stable because they do not change the displayed computing duration.
 */
export function hasLiveServiceStepComputingDuration(steps: ServiceStepMetric[]) {
  return steps.some((step) => isServiceStepIncludedInComputingDuration(step) && isServiceStepDurationLive(step))
}

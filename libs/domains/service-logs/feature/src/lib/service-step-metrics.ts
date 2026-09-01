import { type ServiceStepMetric } from 'qovery-typescript-axios'

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

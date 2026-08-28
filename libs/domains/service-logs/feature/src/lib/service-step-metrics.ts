import { type ServiceStepMetric } from 'qovery-typescript-axios'

export function getServiceStepDurationSec(step: ServiceStepMetric, nowMs: number) {
  if (step.status !== 'ONGOING' || !step.started_at) return step.duration_sec || 0

  const startedAtMs = Date.parse(step.started_at)
  return Number.isFinite(startedAtMs) ? Math.max(0, Math.floor((nowMs - startedAtMs) / 1_000)) : 0
}

export function getServiceStepsDurationSec(steps: ServiceStepMetric[], nowMs: number) {
  return steps.reduce((totalDurationSec, step) => totalDurationSec + getServiceStepDurationSec(step, nowMs), 0)
}

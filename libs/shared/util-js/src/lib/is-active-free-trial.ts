export const TRIAL_MAX_DAY = 90

export function isActiveFreeTrial(remainingTrialDay?: number): boolean {
  return remainingTrialDay !== undefined && remainingTrialDay > 0 && remainingTrialDay <= TRIAL_MAX_DAY
}

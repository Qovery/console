import { type SkillPresetRejectionFinding } from 'qovery-typescript-axios'

/**
 * Errors reach the Console reshaped by the axios auth interceptor: `{ message, name, code, response }`.
 * The mock rejects with the same shape, so these helpers work for both.
 */
interface ApiErrorLike {
  message?: string
  code?: string
  response?: { status?: number; data?: { detail?: string; findings?: SkillPresetRejectionFinding[] } }
}

const asApiError = (error: unknown): ApiErrorLike => (typeof error === 'object' && error !== null ? error : {})

export function getSkillPresetErrorStatus(error: unknown): number | undefined {
  const apiError = asApiError(error)
  const status = apiError.response?.status ?? Number(apiError.code)
  return Number.isInteger(status) && status >= 100 && status <= 599 ? status : undefined
}

export function getSkillPresetErrorDetail(error: unknown): string | undefined {
  const apiError = asApiError(error)
  return apiError.response?.data?.detail ?? apiError.message
}

/**
 * A 409 can mean two things: an assignment target already held by another preset, or someone else
 * saving the preset between this read and write, including while the security review ran. q-core
 * uses one message for both concurrent cases ("...was changed by someone else: reload it and try again").
 */
export function isSkillPresetConcurrentModification(error: unknown) {
  return (
    getSkillPresetErrorStatus(error) === 409 && /changed by someone else/i.test(getSkillPresetErrorDetail(error) ?? '')
  )
}

/**
 * 503 on a save: the model security review could not run (provider down, timeout, unreadable answer, or
 * no model reviewer configured). Nothing was saved.
 */
export function isSkillPresetReviewUnavailable(error: unknown) {
  return getSkillPresetErrorStatus(error) === 503
}

/** 403 because the organization turned AI features off: presets can be read and deleted, not written. */
export function isSkillPresetAiFeaturesOff(error: unknown) {
  return getSkillPresetErrorStatus(error) === 403 && /AI features/i.test(getSkillPresetErrorDetail(error) ?? '')
}

/** 503 on agent activity (ActivityQueryTimedOut): the range holds too much activity to read in time. */
export function isAgentActivityTimedOut(error: unknown) {
  return getSkillPresetErrorStatus(error) === 503
}

/** The findings of a 422 security rejection, or an empty list for any other error. */
export function getSkillPresetFindings(error: unknown): SkillPresetRejectionFinding[] {
  if (getSkillPresetErrorStatus(error) !== 422) return []
  return asApiError(error).response?.data?.findings ?? []
}

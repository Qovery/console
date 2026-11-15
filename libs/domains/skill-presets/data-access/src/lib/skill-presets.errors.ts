import { type SkillPresetFinding } from './skill-presets.types'

/**
 * Errors reach the Console reshaped by the axios auth interceptor: `{ message, name, code, response }`.
 * The mock rejects with the same shape, so these helpers work for both.
 */
interface ApiErrorLike {
  message?: string
  code?: string
  response?: { status?: number; data?: { detail?: string; findings?: SkillPresetFinding[] } }
}

const asApiError = (error: unknown): ApiErrorLike => (typeof error === 'object' && error !== null ? error : {})

export function getSkillPresetErrorStatus(error: unknown): number | undefined {
  const apiError = asApiError(error)
  return apiError.response?.status ?? (apiError.code ? Number(apiError.code) : undefined)
}

export function getSkillPresetErrorDetail(error: unknown): string | undefined {
  const apiError = asApiError(error)
  return apiError.response?.data?.detail ?? apiError.message
}

/**
 * A 409 can mean two things: an assignment target already held by another preset, or someone else
 * saving the preset between this read and write. Only the message tells them apart.
 */
export function isSkillPresetConcurrentModification(error: unknown) {
  return (
    getSkillPresetErrorStatus(error) === 409 && /changed by someone else/i.test(getSkillPresetErrorDetail(error) ?? '')
  )
}

/** The findings of a 422 security rejection, or an empty list for any other error. */
export function getSkillPresetFindings(error: unknown): SkillPresetFinding[] {
  if (getSkillPresetErrorStatus(error) !== 422) return []
  return asApiError(error).response?.data?.findings ?? []
}

/** Same shape as the axios auth interceptor output, for the mock and for tests. */
export function buildSkillPresetApiError(status: number, detail: string, extra: Record<string, unknown> = {}) {
  return {
    message: detail,
    name: String(status),
    code: String(status),
    response: { status, data: { status, detail, ...extra } },
  }
}

import {
  buildSkillPresetApiError,
  getSkillPresetErrorDetail,
  getSkillPresetErrorStatus,
  getSkillPresetFindings,
  isAgentActivityTimedOut,
  isSkillPresetAiFeaturesOff,
  isSkillPresetConcurrentModification,
  isSkillPresetReviewUnavailable,
} from './skill-presets.errors'

describe('skill presets errors', () => {
  it('reads the status from the response, or from the code of a reshaped error', () => {
    expect(getSkillPresetErrorStatus({ response: { status: 404 } })).toBe(404)
    expect(getSkillPresetErrorStatus({ code: '503' })).toBe(503)
    expect(getSkillPresetErrorStatus('network down')).toBeUndefined()
  })

  it('reads the server detail, or the message', () => {
    expect(getSkillPresetErrorDetail(buildSkillPresetApiError(400, 'Too long'))).toBe('Too long')
    expect(getSkillPresetErrorDetail({ message: 'Network Error' })).toBe('Network Error')
  })

  it('tells a concurrent save apart from an assignment conflict (both 409)', () => {
    expect(
      isSkillPresetConcurrentModification(buildSkillPresetApiError(409, 'Backend was changed by someone else'))
    ).toBe(true)
    expect(isSkillPresetConcurrentModification(buildSkillPresetApiError(409, 'Role already assigned'))).toBe(false)
  })

  it('recognizes an unavailable review (503) and AI features turned off (403)', () => {
    expect(isSkillPresetReviewUnavailable(buildSkillPresetApiError(503, 'Review down'))).toBe(true)
    expect(isSkillPresetAiFeaturesOff(buildSkillPresetApiError(403, 'AI features are disabled'))).toBe(true)
    expect(isSkillPresetAiFeaturesOff(buildSkillPresetApiError(403, 'Not an admin'))).toBe(false)
  })

  it('returns the findings of a 422 rejection only', () => {
    const findings = [{ field: 'team_context', line: 3 }]
    expect(getSkillPresetFindings(buildSkillPresetApiError(422, 'Rejected', { findings }))).toEqual(findings)
    expect(getSkillPresetFindings(buildSkillPresetApiError(400, 'Bad', { findings }))).toEqual([])
  })

  it('treats a missing model reviewer as an unavailable review, and a 503 on activity as a timeout', () => {
    expect(isSkillPresetReviewUnavailable(buildSkillPresetApiError(503, 'No model reviewer is configured'))).toBe(true)
    expect(
      isAgentActivityTimedOut(buildSkillPresetApiError(503, 'This range holds too much activity to read in time.'))
    ).toBe(true)
    expect(isAgentActivityTimedOut(buildSkillPresetApiError(400, 'The range must not exceed 90 days'))).toBe(false)
  })
})

import { type SkillPresetRevisionResponse } from '@qovery/domains/skill-presets/data-access'
import { diffRevisions, reviewSummary, revisionToRequest, summarizeDiff } from './revision-diff'

const revision = (overrides: Partial<SkillPresetRevisionResponse>): SkillPresetRevisionResponse => ({
  skill_preset_id: 'preset-1',
  revision: 1,
  change_type: 'CREATE',
  edited_by: 'alex.martin@example.com',
  edited_at: '2026-11-01T00:00:00Z',
  name: 'Backend team',
  is_template: false,
  description: '',
  base: 'QOVERY_FULL',
  team_context: 'Deploy to staging first.',
  skills: [{ skill_name: 'qovery-deploy', mode: 'OVERLAY', content: 'Wait.' }],
  assigned_to: { organization_default: true, role_ids: [], user_ids: [] },
  ...overrides,
})

describe('diffRevisions', () => {
  it('lists what changed between two revisions', () => {
    const before = revision({})
    const after = revision({
      revision: 2,
      change_type: 'UPDATE',
      team_context: 'Deploy to staging first.\nNever deploy to production.',
      skills: [
        { skill_name: 'qovery-deploy', mode: 'OVERLAY', content: 'Wait for the smoke tests.' },
        { skill_name: 'qovery-assess', mode: 'DISABLE' },
      ],
    })
    const diff = diffRevisions(before, after)

    expect(diff.teamContext).toEqual({ before: before.team_context, after: after.team_context })
    expect(diff.skills.map(({ skillName }) => skillName)).toEqual(['qovery-assess', 'qovery-deploy'])
    expect(diff.assignments).toBeNull()
    expect(summarizeDiff(diff)).toBe('Team context · qovery-assess added · qovery-deploy changed')
  })

  it('treats assignment order as irrelevant', () => {
    const before = revision({ assigned_to: { organization_default: false, role_ids: ['a', 'b'], user_ids: [] } })
    const after = revision({ assigned_to: { organization_default: false, role_ids: ['b', 'a'], user_ids: [] } })
    expect(diffRevisions(before, after).assignments).toBeNull()
  })

  it('builds the restore request from a revision', () => {
    expect(revisionToRequest(revision({}))).toEqual({
      name: 'Backend team',
      is_template: false,
      description: '',
      base: 'QOVERY_FULL',
      team_context: 'Deploy to staging first.',
      skills: [{ skill_name: 'qovery-deploy', mode: 'OVERLAY', content: 'Wait.' }],
      assigned_to: { organization_default: true, role_ids: [], user_ids: [] },
    })
  })

  it('summarizes the security review of a revision', () => {
    expect(
      reviewSummary(revision({ review_verdict: 'ALLOW', review_model: 'review-model', review_prompt_version: 'v1' }))
    ).toBe('Reviewed by review-model, prompt v1: allowed')
    expect(reviewSummary(revision({}))).toBeNull()
  })
})

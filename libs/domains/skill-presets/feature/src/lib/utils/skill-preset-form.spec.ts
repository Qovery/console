import { type SkillPresetResponse } from '@qovery/domains/skill-presets/data-access'
import { effectiveQoverySkills, toSkillPresetFormValues, toSkillPresetRequest } from './skill-preset-form'

const preset: SkillPresetResponse = {
  id: 'preset-1',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-02T00:00:00Z',
  name: 'Backend team',
  description: 'Default preset',
  base: 'QOVERY_FULL',
  team_context: 'Deploy to staging first.',
  skills: [
    { skill_name: 'qovery-deploy', mode: 'OVERLAY', description: null, content: 'Wait for the smoke tests.' },
    { skill_name: 'qovery-assess', mode: 'DISABLE', description: null, content: null },
    { skill_name: 'qovery-shipped-later', mode: 'DISABLE', description: null, content: null },
    { skill_name: 'release-checklist', mode: 'ADD', description: 'Use when cutting a release.', content: '1. Tag.' },
  ],
  revision: 3,
  creator_name: 'Alex Martin',
  assigned_to: { organization_default: true, role_ids: ['role-1'], user_ids: [] },
}

describe('skill preset form mapping', () => {
  it('round-trips a preset through the form without losing entries', () => {
    const values = toSkillPresetFormValues(preset)
    const body = toSkillPresetRequest(values)

    expect(values.qoverySkills.find(({ skillName }) => skillName === 'qovery-deploy')?.choice).toBe('OVERLAY')
    expect(values.qoverySkills.find(({ skillName }) => skillName === 'qovery-troubleshoot')?.choice).toBe('AS_IS')
    expect(body.skills).toEqual(
      expect.arrayContaining([
        { skill_name: 'qovery-deploy', mode: 'OVERLAY', content: 'Wait for the smoke tests.' },
        { skill_name: 'qovery-assess', mode: 'DISABLE' },
        { skill_name: 'qovery-shipped-later', mode: 'DISABLE' },
        {
          skill_name: 'release-checklist',
          mode: 'ADD',
          description: 'Use when cutting a release.',
          content: '1. Tag.',
        },
      ])
    )
    expect(body.skills).toHaveLength(4)
    expect(body.assigned_to).toEqual(preset.assigned_to)
  })

  it('does not send Qovery skill entries on the lean and empty bases', () => {
    const values = { ...toSkillPresetFormValues(preset), base: 'QOVERY_LEAN' as const }
    expect(effectiveQoverySkills(values)).toEqual([])
    expect(toSkillPresetRequest(values).skills.map(({ skill_name }) => skill_name)).toEqual(['release-checklist'])
  })

  it('sends a null team context when it is blank', () => {
    expect(
      toSkillPresetRequest({ ...toSkillPresetFormValues(), name: 'x', teamContext: '  \n' }).team_context
    ).toBeNull()
  })
})

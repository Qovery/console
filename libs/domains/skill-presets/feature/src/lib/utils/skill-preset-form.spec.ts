import { type SkillPresetResponse } from 'qovery-typescript-axios'
import {
  effectiveQoverySkills,
  keepEditsSinceSubmit,
  toSkillPresetFormValues,
  toSkillPresetRequest,
} from './skill-preset-form'

const preset: SkillPresetResponse = {
  id: 'preset-1',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-02T00:00:00Z',
  name: 'Backend team',
  description: 'Default preset',
  base: 'FULL',
  team_context: 'Deploy to staging first.',
  skills: [
    { skill_name: 'qovery-deploy', mode: 'OVERLAY', description: null, content: 'Wait for the smoke tests.' },
    { skill_name: 'qovery-assess', mode: 'DISABLE', description: null, content: null },
    { skill_name: 'qovery-shipped-later', mode: 'DISABLE', description: null, content: null },
    { skill_name: 'release-checklist', mode: 'ADD', description: 'Use when cutting a release.', content: '1. Tag.' },
  ],
  revision: 3,
  is_template: false,
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

  it.each(['LEAN', 'NONE'] as const)('does not send Qovery skill entries on the %s base', (base) => {
    const values = { ...toSkillPresetFormValues(preset), base }
    expect(effectiveQoverySkills(values)).toEqual([])
    expect(toSkillPresetRequest(values).skills.map(({ skill_name }) => skill_name)).toEqual(['release-checklist'])
  })

  it('sends a null team context when it is blank', () => {
    expect(
      toSkillPresetRequest({ ...toSkillPresetFormValues(), name: 'x', teamContext: '  \n' }).team_context
    ).toBeNull()
  })

  it('never sends content on DISABLE or a description on DISABLE and OVERLAY', () => {
    const values = toSkillPresetFormValues(preset)
    values.qoverySkills = values.qoverySkills.map((skill) =>
      skill.skillName === 'qovery-assess'
        ? { ...skill, choice: 'DISABLE', description: 'left over', content: 'left over' }
        : skill.skillName === 'qovery-deploy'
          ? { ...skill, choice: 'OVERLAY', description: 'left over' }
          : skill
    )
    const skills = toSkillPresetRequest(values).skills
    expect(skills.find(({ skill_name }) => skill_name === 'qovery-assess')).toEqual({
      skill_name: 'qovery-assess',
      mode: 'DISABLE',
    })
    expect(skills.find(({ skill_name }) => skill_name === 'qovery-deploy')).not.toHaveProperty('description')
  })

  it('never assigns a template', () => {
    const body = toSkillPresetRequest({ ...toSkillPresetFormValues(preset), isTemplate: true })
    expect(body.is_template).toBe(true)
    expect(body.assigned_to).toEqual({ organization_default: false, role_ids: [], user_ids: [] })
  })
})

describe('keepEditsSinceSubmit', () => {
  it('takes the saved values, except fields changed after the submit', () => {
    const submitted = { ...toSkillPresetFormValues(preset), name: 'Backend team ' }
    const saved = { ...toSkillPresetFormValues(preset), name: 'Backend team' }
    const current = {
      ...submitted,
      teamContext: 'Typed during the review.',
      roleIds: ['role-2'],
      customSkills: submitted.customSkills.map((skill) => ({ ...skill, content: 'Updated after submitting.' })),
    }

    expect(keepEditsSinceSubmit({ saved, submitted, current })).toEqual({
      ...saved,
      teamContext: current.teamContext,
      roleIds: current.roleIds,
      customSkills: current.customSkills,
    })
  })

  it('returns the saved values when nothing changed after the submit', () => {
    const submitted = toSkillPresetFormValues(preset)
    const current = {
      ...submitted,
      customSkills: submitted.customSkills.map((skill) => ({ ...skill })),
      roleIds: [...submitted.roleIds],
    }
    const saved = { ...submitted, roleIds: ['role-2'], customSkills: [] }

    expect(keepEditsSinceSubmit({ saved, submitted, current })).toEqual(saved)
  })
})

import { type AgentActivityResponse } from '@qovery/domains/skill-presets/data-access'
import { actionLabel, actionTypeLabel, computeAgentActivityHints, neverLoadedSkills } from './agent-activity'

const action = (
  overrides: Partial<AgentActivityResponse['recent'][number]>
): AgentActivityResponse['recent'][number] => ({
  at: '2026-11-14T10:00:00Z',
  user_sub: 'user-jordan',
  user_name: 'Jordan Kim',
  origin: 'SKILL',
  skill_name: 'qovery',
  event: 'TRIGGER_DELETE',
  target_type: 'ENVIRONMENT',
  target_name: 'payments-production',
  project_name: 'payments',
  environment_name: 'payments-production',
  outcome: 'DENIED',
  ...overrides,
})

const activity = (overrides: Partial<AgentActivityResponse> = {}): AgentActivityResponse => ({
  coverage: { sources: ['API'], note: '' },
  totals: { skill_loads: 20, actions: 10, denials: 3, members: 2 },
  timeline: [],
  actions_by_type: [],
  by_member: [
    {
      user_sub: 'user-jordan',
      user_name: 'Jordan Kim',
      skill_loads: 10,
      actions: 5,
      denials: 3,
      top_skills: ['qovery'],
      last_activity_at: '2026-11-14T10:00:00Z',
    },
    {
      user_sub: 'user-sam',
      user_name: 'Sam Lee',
      skill_loads: 10,
      actions: 5,
      denials: 0,
      top_skills: [],
      last_activity_at: '2026-11-14T10:00:00Z',
    },
  ],
  by_skill: [
    { skill_name: 'qovery', loads: 10, actions: 8, denials: 3, members: 2 },
    { skill_name: 'qovery-deploy', loads: 4, actions: 2, denials: 0, members: 1 },
    { skill_name: 'incident-handoff', loads: 6, actions: 0, denials: 0, members: 1 },
  ],
  recent: [action({}), action({}), action({})],
  ...overrides,
})

describe('agent activity helpers', () => {
  it('names actions in plain words', () => {
    expect(actionLabel('TRIGGER_DEPLOY', 'APPLICATION')).toBe('Deploy')
    expect(actionLabel('UPDATE', 'VARIABLE')).toBe('Variable change')
    expect(actionLabel('TRIGGER_DELETE', 'ENVIRONMENT')).toBe('Delete')
    expect(actionTypeLabel('TRIGGER_RESTART', 'APPLICATION')).toBe('Restart (service)')
  })

  it('lists the Qovery skills nobody loaded', () => {
    expect(neverLoadedSkills(activity())).toEqual(expect.arrayContaining(['qovery-assess', 'qovery-signup']))
    expect(neverLoadedSkills(activity())).not.toContain('qovery-deploy')
  })

  it('suggests factual follow-ups, each tied to something to adjust', () => {
    const kinds = computeAgentActivityHints(activity()).map(({ kind }) => kind)
    expect(kinds).toEqual(['unused-skills', 'environment-denials', 'member-denials', 'loads-without-actions'])
  })

  it('does not judge unused skills or repeat a member while drilling into one', () => {
    const kinds = computeAgentActivityHints(activity(), { filtered: true }).map(({ kind }) => kind)
    expect(kinds).toEqual(['environment-denials', 'loads-without-actions'])
  })

  it('suggests nothing without activity', () => {
    expect(
      computeAgentActivityHints(activity({ totals: { skill_loads: 0, actions: 0, denials: 0, members: 0 } }))
    ).toEqual([])
  })
})

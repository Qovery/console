import { AGENT_ACTIVITY_LIMITS, type AgentActivityResponse } from '@qovery/domains/skill-presets/data-access'
import {
  actionLabel,
  actionTypeLabel,
  actorLabel,
  computeAgentActivityHints,
  groupActionsByType,
  memberCount,
  unusedSkills,
} from './agent-activity'

const action = (
  overrides: Partial<AgentActivityResponse['recent'][number]>
): AgentActivityResponse['recent'][number] => ({
  at: '2026-11-14T10:00:00Z',
  user_sub: 'user-jordan',
  user_name: 'Jordan Kim',
  source: 'POLICY_DENIAL',
  actor_kind: 'MEMBER',
  policy_token_id: null,
  skill_name: 'qovery',
  event: 'ACCESS_DENIED',
  target_type: 'ENVIRONMENT',
  target_name: 'payments-production',
  project_name: 'payments',
  environment_name: 'payments-production',
  outcome: 'DENIED',
  ...overrides,
})

const activity = (overrides: Partial<AgentActivityResponse> = {}): AgentActivityResponse => ({
  from: '2026-10-15T10:00:00Z',
  to: '2026-11-14T10:00:00Z',
  bucket: 'DAY',
  coverage: { sources: ['SKILL_LOAD', 'SKILL_API_ACTION', 'MCP_TOOL_CALL', 'POLICY_DENIAL'], note: '' },
  totals: { skill_loads: 20, actions: 10, denials: 3, members: 2, policy_tokens: 0 },
  timeline: [],
  actions_by_type: [],
  by_member: [
    {
      user_sub: 'user-jordan',
      user_name: 'Jordan Kim',
      actor_kind: 'MEMBER',
      policy_token_id: null,
      skill_loads: 10,
      actions: 5,
      denials: 3,
      top_skills: ['qovery'],
      last_activity_at: '2026-11-14T10:00:00Z',
    },
    {
      user_sub: 'user-sam',
      user_name: 'Sam Lee',
      actor_kind: 'MEMBER',
      policy_token_id: null,
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
  by_policy_token: [],
  recent: [action({}), action({}), action({})],
  ...overrides,
})

describe('agent activity helpers', () => {
  it('names raw audit events in plain words', () => {
    expect(actionLabel('DEPLOY_QUEUED', 'APPLICATION')).toBe('Deploy')
    expect(actionLabel('TRIGGER_DEPLOY', 'ENVIRONMENT')).toBe('Deploy')
    expect(actionLabel('TRIGGER_RESTART', 'APPLICATION')).toBe('Restart')
    expect(actionLabel('TRIGGER_STOP', 'ENVIRONMENT')).toBe('Stop')
    expect(actionLabel('DELETE', 'APPLICATION')).toBe('Delete')
    expect(actionLabel('TRIGGER_DELETE', 'ENVIRONMENT')).toBe('Delete')
    expect(actionLabel('CREATE', 'VARIABLE')).toBe('Variable change')
    expect(actionLabel('UPDATE', 'VARIABLE')).toBe('Variable change')
    expect(actionLabel('DELETE', 'VARIABLE')).toBe('Variable change')
    expect(actionLabel('MCP', 'APPLICATION')).toBe('MCP tool call')
    expect(actionLabel('POLICY_FAILED', 'ENVIRONMENT')).toBe('Denied')
    expect(actionLabel('ACCESS_DENIED', 'APPLICATION')).toBe('Denied')
    expect(actionLabel('UPDATE', 'APPLICATION')).toBe('Other (UPDATE)')
    expect(actionTypeLabel('TRIGGER_RESTART', 'APPLICATION')).toBe('Restart (service)')
    expect(actionTypeLabel('UPDATE', 'APPLICATION')).toBe('Other (UPDATE, service)')
  })

  it('merges action types that share a label', () => {
    expect(
      groupActionsByType([
        { event: 'TRIGGER_DEPLOY', target_type: 'APPLICATION', count: 3, denied: 0 },
        { event: 'POLICY_FAILED', target_type: 'ENVIRONMENT', count: 4, denied: 4 },
        { event: 'DEPLOY_QUEUED', target_type: 'APPLICATION', count: 2, denied: 0 },
      ])
    ).toEqual([
      { label: 'Deploy (service)', count: 5, denied: 0 },
      { label: 'Denied (environment)', count: 4, denied: 4 },
    ])
  })

  it('names a policy token from its audit actor name', () => {
    expect(actorLabel('policy:3f1c9a2e:ci-deployer')).toEqual({
      kind: 'policy-token',
      label: 'Policy token ci-deployer',
    })
    expect(actorLabel('jane@example.com')).toEqual({ kind: 'member', label: 'jane@example.com' })
  })

  it('lists the Qovery skills nobody used', () => {
    expect(unusedSkills(activity())).toEqual(expect.arrayContaining(['qovery-assess', 'qovery-signup']))
    expect(unusedSkills(activity())).not.toContain('qovery-deploy')
  })

  it('counts a skill with actions or denials but no recorded load as used', () => {
    const usedWithoutLoad = activity({
      by_skill: [
        { skill_name: 'qovery-assess', loads: 0, actions: 2, denials: 0, members: 1 },
        { skill_name: 'qovery-signup', loads: 0, actions: 0, denials: 1, members: 1 },
      ],
    })
    expect(unusedSkills(usedWithoutLoad)).not.toContain('qovery-assess')
    expect(unusedSkills(usedWithoutLoad)).not.toContain('qovery-signup')
  })

  it('counts members from the breakdown, or from the totals once the breakdown hit its cap', () => {
    const { by_member: members, totals } = activity()
    const member = members[0]
    expect(
      memberCount(
        activity({
          by_member: [
            ...members,
            { ...member, actor_kind: 'POLICY_TOKEN', policy_token_id: 'token-1', user_sub: null },
          ],
          totals: { ...totals, members: 3, policy_tokens: 1 },
        })
      )
    ).toBe(2)
    const capped = activity({
      by_member: Array.from({ length: AGENT_ACTIVITY_LIMITS.maxMembers }, (_, index) => ({
        ...member,
        user_sub: `user-${index}`,
      })),
      totals: { ...activity().totals, members: 620, policy_tokens: 20 },
    })
    expect(memberCount(capped)).toBe(600)
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
      computeAgentActivityHints(
        activity({ totals: { skill_loads: 0, actions: 0, denials: 0, members: 0, policy_tokens: 0 } })
      )
    ).toEqual([])
  })
})

import { type AgentActivityResponse, type OrganizationPolicyApiToken } from 'qovery-typescript-axios'

const day = 86_400_000
const fixtureDate = '2026-01-06T09:00:00Z'

export const CI_DEPLOYER_ID = '3f1c9a2e-0000-4000-8000-00000000c1d0'

export const policyTokens: OrganizationPolicyApiToken[] = [
  {
    id: CI_DEPLOYER_ID,
    name: 'ci-deployer',
    role_id: 'devops',
    role_name: 'DevOps',
    creator_name: 'Jordan Kim',
    created_at: fixtureDate,
    expires_at: '2099-01-01T00:00:00Z',
    opa_policy: 'default allow := false',
  },
  {
    id: '3f1c9a2e-0000-4000-8000-00000000a9e1',
    name: 'review-agent',
    role_id: 'viewer',
    role_name: 'Viewer',
    creator_name: 'Jordan Kim',
    created_at: fixtureDate,
    opa_policy: 'default allow := false',
  },
]

export function agentActivityResponse(
  query: URLSearchParams,
  { empty = false, member = false } = {}
): AgentActivityResponse {
  const from = query.get('from') ?? fixtureDate
  const to = query.get('to') ?? fixtureDate
  const at = new Date(Date.parse(to) - 3_600_000).toISOString()
  const deniedAction: AgentActivityResponse['recent'][number] = {
    at,
    user_sub: 'user-jordan',
    user_name: 'Jordan Kim',
    actor_kind: 'MEMBER',
    policy_token_id: null,
    skill_name: 'qovery-deploy',
    source: 'POLICY_DENIAL',
    event: 'ACCESS_DENIED',
    target_type: 'ENVIRONMENT',
    target_name: 'payments-production',
    environment_name: 'payments-production',
    project_name: 'payments',
    outcome: 'DENIED',
  }
  const deployAction: AgentActivityResponse['recent'][number] = {
    ...deniedAction,
    source: 'SKILL_API_ACTION',
    event: 'DEPLOY_QUEUED',
    target_name: 'payments-staging',
    environment_name: 'payments-staging',
    outcome: 'ALLOWED',
  }
  const tokenAction: AgentActivityResponse['recent'][number] = {
    ...deployAction,
    user_sub: null,
    user_name: `policy:${CI_DEPLOYER_ID}:ci-deployer`,
    actor_kind: 'POLICY_TOKEN',
    policy_token_id: CI_DEPLOYER_ID,
    skill_name: null,
    source: 'POLICY_TOKEN_API_ACTION',
  }

  const tokenUsage: AgentActivityResponse['by_policy_token'][number] = {
    policy_token_id: CI_DEPLOYER_ID,
    token_name: 'ci-deployer',
    deleted: false,
    skill_loads: 0,
    actions: 4,
    denials: 0,
    last_activity_at: at,
    top_actions: [],
    top_skills: [],
    timeline: [{ start: new Date(Math.floor(Date.parse(at) / day) * day).toISOString(), actions: 4, denials: 0 }],
  }
  const deletedToken = {
    ...tokenUsage,
    policy_token_id: '3f1c9a2e-0000-4000-8000-00000000b7f2',
    token_name: 'cleanup-bot',
    deleted: true,
    actions: 1,
    timeline: [],
  }
  const tokenOnly = query.has('policyTokenId') || query.get('actorKind') === 'POLICY_TOKEN'
  const deniedOnly = query.get('outcome') === 'DENIED'
  const includesHistory = Date.parse(to) - Date.parse(from) > 7 * day
  const recent = Array.from({ length: 100 }, (_, index) => ({
    ...[deniedAction, tokenAction, deployAction][index % 3],
    at: new Date(Date.parse(at) - index * 60_000).toISOString(),
  }))

  const emptyResponse: AgentActivityResponse = {
    from,
    to,
    bucket: query.get('bucket') === 'HOUR' ? 'HOUR' : 'DAY',
    coverage: { sources: [], note: '' },
    totals: { skill_loads: 0, actions: 0, denials: 0, members: 0, policy_tokens: 0 },
    timeline: [],
    actions_by_type: [],
    by_member: [],
    by_policy_token: [],
    by_skill: [],
    recent: [],
  }
  if (empty) return emptyResponse
  if (member) {
    return {
      ...emptyResponse,
      totals: { ...emptyResponse.totals, actions: 1, members: 1 },
      recent: [{ ...deployAction, user_name: 'Taylor Chen', user_sub: 'user-taylor' }],
    }
  }
  if (tokenOnly) {
    return {
      ...emptyResponse,
      totals: { ...emptyResponse.totals, actions: 4, policy_tokens: 1 },
      by_policy_token: includesHistory ? [tokenUsage, deletedToken] : [tokenUsage],
      recent: [tokenAction],
    }
  }
  return {
    ...emptyResponse,
    totals: { skill_loads: 12, actions: deniedOnly ? 0 : 66, denials: 34, members: 1, policy_tokens: 1 },
    timeline: [{ start: at, skill_loads: 12, actions: 66, denials: 34 }],
    by_member: [
      {
        user_sub: 'user-jordan',
        user_name: 'Jordan Kim',
        actor_kind: 'MEMBER',
        policy_token_id: null,
        skill_loads: 12,
        actions: 33,
        denials: 34,
        top_skills: ['qovery-deploy'],
        last_activity_at: at,
      },
    ],
    by_policy_token: [
      tokenUsage,
      deletedToken,
      { ...tokenUsage, policy_token_id: null, token_name: null, timeline: [] },
    ],
    by_skill: [
      { skill_name: 'qovery-deploy', loads: 12, actions: 33, denials: 34, members: 1 },
      { skill_name: null, loads: 0, actions: 33, denials: 0, members: 0 },
    ],
    recent: deniedOnly ? recent.filter(({ outcome }) => outcome === 'DENIED') : recent,
  }
}

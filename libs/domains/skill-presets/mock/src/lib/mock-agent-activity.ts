import { type AgentActivityResponse, type AgentActivitySource } from 'qovery-typescript-axios'
import { type AgentActivityQueryParams as AgentActivityParams } from '@qovery/domains/skill-presets/data-access'
import { AGENT_ACTIVITY_LIMITS } from '@qovery/domains/skill-presets/util'

/*
 * Agent activity for the mock, shaped like q-core's: actions follow from the skill loads (a load of
 * qovery-deploy often leads to a deploy), plus MCP tool calls with no skill, a policy token acting
 * through MCP, and refused requests in production. Seeded, so every run and every test sees the same data.
 */

/** q-core's fixed coverage note. */
export const MOCK_AGENT_ACTIVITY_COVERAGE_NOTE =
  'Only actions taken through Qovery (its API, CLI, skills and MCP server) are visible. ' +
  'What an agent does elsewhere, such as in a shell, in git or in a cloud console, is not.'

const SOURCES: AgentActivitySource[] = [
  'SKILL_LOAD',
  'SKILL_API_ACTION',
  'MCP_TOOL_CALL',
  'POLICY_DENIAL',
  'POLICY_TOKEN_API_ACTION',
]

/** The mock organization's policy tokens. The last one was deleted, but its calls stay in the audit log. */
export const MOCK_POLICY_TOKENS = [
  {
    id: '3f1c9a2e-0000-4000-8000-00000000c1d0',
    name: 'ci-deployer',
    deleted: false,
    role_id: '00000000-0000-4000-8000-000000000003',
    role_name: 'devops',
    expires_in_days: 49,
  },
  {
    id: '3f1c9a2e-0000-4000-8000-00000000a9e1',
    name: 'review-agent',
    deleted: false,
    role_id: '00000000-0000-4000-8000-000000000005',
    role_name: 'viewer',
    expires_in_days: null,
  },
  {
    id: '3f1c9a2e-0000-4000-8000-00000000b7f2',
    name: 'cleanup-bot',
    deleted: true,
    role_id: '00000000-0000-4000-8000-000000000003',
    role_name: 'devops',
    expires_in_days: null,
  },
] as const

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** How the audit log names an actor that is a policy token: `policy:<id>:<name>`. */
export const policyTokenActor = ({ id, name }: { id: string; name: string }) => `policy:${id}:${name}`
export const MOCK_POLICY_TOKEN_ACTOR = policyTokenActor(MOCK_POLICY_TOKENS[0])

export type MockAgentAction = AgentActivityResponse['recent'][number]

export interface MockSkillLoad {
  timestamp: string
  user_sub: string
  user_name: string
  skill_name: string
  from_cache: boolean
}

const HOUR = 3_600_000
const PROJECTS = [
  { project: 'payments', services: ['api', 'worker'] },
  { project: 'storefront', services: ['web', 'checkout'] },
]

type Effect = { event: string; target_type: string; environment: 'staging' | 'production' | 'preview'; chance: number }

/** What an agent usually does after loading a skill. Skills not listed lead to no Qovery action. */
const EFFECTS: Record<string, Effect[]> = {
  'qovery-deploy': [
    { event: 'DEPLOY_QUEUED', target_type: 'APPLICATION', environment: 'staging', chance: 0.6 },
    { event: 'UPDATE', target_type: 'VARIABLE', environment: 'staging', chance: 0.2 },
  ],
  qovery: [
    { event: 'TRIGGER_RESTART', target_type: 'APPLICATION', environment: 'staging', chance: 0.35 },
    { event: 'TRIGGER_STOP', target_type: 'ENVIRONMENT', environment: 'preview', chance: 0.15 },
  ],
  'qovery-troubleshoot': [
    { event: 'TRIGGER_RESTART', target_type: 'APPLICATION', environment: 'production', chance: 0.4 },
  ],
  'qovery-preview': [{ event: 'TRIGGER_DEPLOY', target_type: 'ENVIRONMENT', environment: 'preview', chance: 0.7 }],
  'qovery-optimize': [{ event: 'UPDATE', target_type: 'APPLICATION', environment: 'staging', chance: 0.3 }],
  'release-checklist': [
    { event: 'TRIGGER_DEPLOY', target_type: 'APPLICATION', environment: 'production', chance: 0.5 },
  ],
  'staging-only-deploys': [
    { event: 'TRIGGER_DEPLOY', target_type: 'APPLICATION', environment: 'staging', chance: 0.7 },
  ],
}

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

function target(random: () => number, effect: Effect) {
  const { project, services } = PROJECTS[Math.floor(random() * PROJECTS.length)]
  const environment =
    effect.environment === 'preview'
      ? `${project}-pr-${400 + Math.floor(random() * 40)}`
      : `${project}-${effect.environment}`
  const target_name =
    effect.target_type === 'ENVIRONMENT'
      ? environment
      : effect.target_type === 'VARIABLE'
        ? `${services[0]}: DATABASE_POOL_SIZE`
        : services[Math.floor(random() * services.length)]
  return { project_name: project, environment_name: environment, target_name }
}

export function buildMockAgentActions(
  loads: MockSkillLoad[],
  people: { id: string; name: string }[],
  {
    withDenials,
    withMcp = true,
    withPolicyToken = true,
  }: { withDenials: boolean; withMcp?: boolean; withPolicyToken?: boolean }
): MockAgentAction[] {
  const random = seeded(11)
  const actions: MockAgentAction[] = []

  for (const load of loads) {
    if (load.from_cache && random() < 0.5) continue
    for (const effect of EFFECTS[load.skill_name] ?? []) {
      if (random() > effect.chance) continue
      actions.push({
        at: new Date(new Date(load.timestamp).getTime() + 2 * 60_000).toISOString(),
        user_sub: load.user_sub,
        user_name: load.user_name,
        actor_kind: 'MEMBER',
        policy_token_id: null,
        source: 'SKILL_API_ACTION',
        skill_name: load.skill_name,
        event: effect.event,
        target_type: effect.target_type,
        ...target(random, effect),
        outcome: 'ALLOWED',
      })
    }
  }

  type Actor = Pick<MockAgentAction, 'user_sub' | 'user_name' | 'actor_kind' | 'policy_token_id'>
  const person = (id: string): Actor => {
    const found = people.find((item) => item.id === id) ?? people[0]
    return { user_sub: found.id, user_name: found.name, actor_kind: 'MEMBER', policy_token_id: null }
  }
  // A policy token has no user sub: the audit log names it `policy:<id>:<name>`.
  const token = (index: number): Actor => ({
    user_sub: null,
    user_name: policyTokenActor(MOCK_POLICY_TOKENS[index]),
    actor_kind: 'POLICY_TOKEN',
    policy_token_id: MOCK_POLICY_TOKENS[index].id,
  })
  const policyToken = token(0)
  // Older audit rows named a policy token without its id: q-core groups them under a null token.
  const legacyToken: Actor = { user_sub: null, user_name: 'policy', actor_kind: 'POLICY_TOKEN', policy_token_id: null }
  const extra = (
    count: number,
    actor: Actor,
    offsetHours: number,
    make: (index: number) => Omit<MockAgentAction, 'at' | 'outcome' | keyof Actor>,
    spacingHours = 37
  ) => {
    for (let index = 0; index < count; index++) {
      const action = make(index)
      actions.push({
        at: new Date(Date.now() - (index * spacingHours + offsetHours) * HOUR).toISOString(),
        ...actor,
        ...action,
        outcome: action.source === 'POLICY_DENIAL' ? 'DENIED' : 'ALLOWED',
      })
    }
  }

  // Tool calls through the Qovery MCP server: no skill in the user agent.
  extra(withMcp ? 14 : 0, person('auth0|mock-priya'), 5, (index) => ({
    source: 'MCP_TOOL_CALL',
    skill_name: null,
    event: 'MCP',
    target_type: index % 2 ? 'APPLICATION' : 'ENVIRONMENT',
    target_name: index % 2 ? 'worker' : 'payments-staging',
    project_name: 'payments',
    environment_name: 'payments-staging',
  }))
  // A CI pipeline using a policy token through MCP.
  extra(withPolicyToken ? 8 : 0, policyToken, 9, () => ({
    source: 'MCP_TOOL_CALL',
    skill_name: null,
    event: 'MCP',
    target_type: 'ENVIRONMENT',
    target_name: 'storefront-staging',
    project_name: 'storefront',
    environment_name: 'storefront-staging',
  }))

  if (withPolicyToken) {
    // The CI token also deploys staging from the pipeline, through the CLI.
    extra(
      18,
      policyToken,
      2,
      (index) => ({
        source: 'POLICY_TOKEN_API_ACTION',
        skill_name: null,
        event: 'TRIGGER_DEPLOY',
        target_type: 'APPLICATION',
        target_name: index % 2 ? 'web' : 'checkout',
        project_name: 'storefront',
        environment_name: 'storefront-staging',
      }),
      38
    )
    // A read-only review agent: its reads are not audited, its MCP tool calls are.
    extra(6, token(1), 6, (index) => ({
      source: 'MCP_TOOL_CALL',
      skill_name: null,
      event: 'MCP',
      target_type: 'APPLICATION',
      target_name: index % 2 ? 'api' : 'worker',
      project_name: 'payments',
      environment_name: 'payments-production',
    }))
    // A cleanup token, deleted since: it stopped idle previews through Terraform.
    extra(
      10,
      token(2),
      18 * 24,
      (index) => ({
        source: 'POLICY_TOKEN_API_ACTION',
        skill_name: null,
        event: 'TRIGGER_STOP',
        target_type: 'ENVIRONMENT',
        target_name: `storefront-pr-${410 + index}`,
        project_name: 'storefront',
        environment_name: `storefront-pr-${410 + index}`,
      }),
      22
    )
  }

  if (withDenials) {
    // Refused by the member's role, asked from a skill.
    extra(4, person('auth0|mock-jordan'), 3, () => ({
      source: 'POLICY_DENIAL',
      skill_name: 'qovery',
      event: 'ACCESS_DENIED',
      target_type: 'ENVIRONMENT',
      target_name: 'payments-production',
      project_name: 'payments',
      environment_name: 'payments-production',
    }))
    extra(2, person('auth0|mock-jamie'), 7, () => ({
      source: 'POLICY_DENIAL',
      skill_name: 'qovery-deploy',
      event: 'ACCESS_DENIED',
      target_type: 'APPLICATION',
      target_name: 'checkout',
      project_name: 'storefront',
      environment_name: 'storefront-production',
    }))
    // Refused by the policy token's rules: it may only touch staging.
    extra(withPolicyToken ? 3 : 0, policyToken, 11, () => ({
      source: 'POLICY_DENIAL',
      skill_name: null,
      event: 'POLICY_FAILED',
      target_type: 'ENVIRONMENT',
      target_name: 'payments-production',
      project_name: 'payments',
      environment_name: 'payments-production',
    }))
    // The review agent tried to restart a service: its viewer policy refuses it.
    extra(withPolicyToken ? 2 : 0, token(1), 30, () => ({
      source: 'POLICY_DENIAL',
      skill_name: null,
      event: 'POLICY_FAILED',
      target_type: 'APPLICATION',
      target_name: 'api',
      project_name: 'payments',
      environment_name: 'payments-production',
    }))
    // Older records, from before tokens were named in the audit log.
    extra(withPolicyToken ? 2 : 0, legacyToken, 26 * 24, () => ({
      source: 'POLICY_DENIAL',
      skill_name: null,
      event: 'POLICY_FAILED',
      target_type: 'PROJECT',
      target_name: 'payments',
      project_name: 'payments',
      environment_name: null,
    }))
    // The cleanup token was refused a production delete, before it was deleted.
    extra(withPolicyToken ? 1 : 0, token(2), 21 * 24, () => ({
      source: 'POLICY_DENIAL',
      skill_name: null,
      event: 'POLICY_FAILED',
      target_type: 'ENVIRONMENT',
      target_name: 'storefront-production',
      project_name: 'storefront',
      environment_name: 'storefront-production',
    }))
  }

  return actions.sort((a, b) => b.at.localeCompare(a.at))
}

/** What q-core returns: aggregates and the latest 100 actions, for the range and filters asked. */
export function aggregateAgentActivity(
  actions: MockAgentAction[],
  loads: MockSkillLoad[],
  { from, to, bucket, userSub, skillName, actorKind, policyTokenId, outcome, source }: AgentActivityParams
): AgentActivityResponse {
  const fromTime = new Date(from).getTime()
  const toTime = new Date(to).getTime()
  const inRange = (at: string) => {
    const time = new Date(at).getTime()
    return time >= fromTime && time < toTime
  }
  const matches = (user: MockAgentAction['user_sub'], skill: MockAgentAction['skill_name']) =>
    (!userSub || user === userSub) && (!skillName || skill === skillName)
  const tokenOnly = actorKind === 'POLICY_TOKEN' || Boolean(policyTokenId)
  const scopedActions = actions.filter(
    (action) =>
      inRange(action.at) &&
      matches(action.user_sub, action.skill_name) &&
      (!actorKind || action.actor_kind === actorKind) &&
      (!policyTokenId || action.policy_token_id === policyTokenId) &&
      (!outcome || action.outcome === outcome) &&
      (!source || action.source === source)
  )
  // As q-core: skill loads are a member's, so a token filter, an action source or the DENIED outcome
  // leaves them out. The SKILL_LOAD source keeps them and leaves the actions out.
  const scopedLoads =
    tokenOnly || (source && source !== 'SKILL_LOAD') || outcome === 'DENIED'
      ? []
      : loads.filter((load) => inRange(load.timestamp) && matches(load.user_sub, load.skill_name))
  const isDenied = ({ outcome }: MockAgentAction) => outcome === 'DENIED'
  const allowedCount = (list: MockAgentAction[]) => list.filter((action) => !isDenied(action)).length
  const deniedCount = (list: MockAgentAction[]) => list.filter(isDenied).length

  const step = bucket === 'HOUR' ? HOUR : 24 * HOUR
  const firstBucket = Math.floor(fromTime / step) * step
  const timeline = Array.from({ length: Math.max(Math.ceil((toTime - firstBucket) / step), 1) }, (_, index) => ({
    start: new Date(firstBucket + index * step).toISOString(),
    skill_loads: 0,
    actions: 0,
    denials: 0,
  }))
  const slot = (at: string) => timeline[Math.floor((new Date(at).getTime() - firstBucket) / step)]
  scopedLoads.forEach((load) => {
    const bucketed = slot(load.timestamp)
    if (bucketed) bucketed.skill_loads += 1
  })
  scopedActions.forEach((action) => {
    const bucketed = slot(action.at)
    if (!bucketed) return
    if (isDenied(action)) bucketed.denials += 1
    else bucketed.actions += 1
  })

  const byType = new Map<string, { event: string; target_type: string; count: number; denied: number }>()
  scopedActions.forEach(({ event, target_type, outcome }) => {
    const key = `${event}:${target_type}`
    const row = byType.get(key) ?? { event, target_type, count: 0, denied: 0 }
    row.count += 1
    if (outcome === 'DENIED') row.denied += 1
    byType.set(key, row)
  })

  // Like q-core, a person is keyed by name (the audit log's `triggered_by`); the sub comes from the loads.
  const subByName = new Map(scopedLoads.map(({ user_name, user_sub }) => [user_name, user_sub]))
  // Like q-core, by_member still lists policy tokens too, with their actor kind.
  const memberActions = scopedActions
  const memberNames = [
    ...new Set([...scopedLoads.map(({ user_name }) => user_name), ...memberActions.map(({ user_name }) => user_name)]),
  ]
  const byMember = memberNames.map((name) => {
    const memberLoads = scopedLoads.filter(({ user_name }) => user_name === name)
    const ownActions = memberActions.filter(({ user_name }) => user_name === name)
    const skillCounts = new Map<string, number>()
    memberLoads.forEach(({ skill_name }) => skillCounts.set(skill_name, (skillCounts.get(skill_name) ?? 0) + 1))
    ownActions.forEach(({ skill_name }) => {
      if (skill_name) skillCounts.set(skill_name, (skillCounts.get(skill_name) ?? 0) + 1)
    })
    const last =
      [...memberLoads.map(({ timestamp }) => timestamp), ...ownActions.map(({ at }) => at)].sort().at(-1) ?? from
    const first = ownActions[0]
    return {
      user_sub: subByName.get(name) ?? null,
      user_name: name,
      actor_kind: first?.actor_kind ?? ('MEMBER' as const),
      policy_token_id: first?.policy_token_id ?? null,
      skill_loads: memberLoads.length,
      actions: allowedCount(ownActions),
      denials: deniedCount(ownActions),
      top_skills: [...skillCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, AGENT_ACTIVITY_LIMITS.maxTopSkills)
        .map(([skill]) => skill),
      last_activity_at: last,
    }
  })

  const skillNames = [
    ...new Set<string | null>([
      ...scopedLoads.map(({ skill_name }) => skill_name),
      ...scopedActions.map(({ skill_name }) => skill_name ?? null),
    ]),
  ]
  const bySkill = skillNames.map((name) => {
    const skillLoads = scopedLoads.filter(({ skill_name }) => skill_name === name)
    const skillActions = scopedActions.filter(({ skill_name }) => (skill_name ?? null) === name)
    return {
      skill_name: name,
      loads: skillLoads.length,
      actions: allowedCount(skillActions),
      denials: deniedCount(skillActions),
      members: new Set([
        ...skillLoads.map(({ user_name }) => user_name),
        ...skillActions.map(({ user_name }) => user_name),
      ]).size,
    }
  })

  // One row per token, deleted ones included; older records with no token id grouped under null.
  const tokenActions = scopedActions.filter(({ actor_kind }) => actor_kind === 'POLICY_TOKEN')
  const tokenKeys = [...new Set(tokenActions.map(({ policy_token_id }) => policy_token_id))]
  const tokenStep = bucket === 'HOUR' && policyTokenId ? HOUR : 24 * HOUR
  const byPolicyToken = tokenKeys.map((id) => {
    const own = tokenActions.filter(({ policy_token_id }) => policy_token_id === id)
    const known = MOCK_POLICY_TOKENS.find((token) => token.id === id)
    const actionTypes = new Map<string, { event: string; target_type: string; count: number; denied: number }>()
    own.forEach((action) => {
      const key = `${action.event}|${action.target_type}`
      const row = actionTypes.get(key) ?? { event: action.event, target_type: action.target_type, count: 0, denied: 0 }
      row.count += 1
      if (isDenied(action)) row.denied += 1
      actionTypes.set(key, row)
    })
    const buckets = new Map<number, { start: string; actions: number; denials: number }>()
    own.forEach((action) => {
      const start = Math.floor(new Date(action.at).getTime() / tokenStep) * tokenStep
      const point = buckets.get(start) ?? { start: new Date(start).toISOString(), actions: 0, denials: 0 }
      if (isDenied(action)) point.denials += 1
      else point.actions += 1
      buckets.set(start, point)
    })
    return {
      policy_token_id: id,
      token_name: known?.name ?? null,
      deleted: known?.deleted ?? false,
      role_id: known?.role_id ?? null,
      role_name: known?.role_name ?? null,
      expires_at: known?.expires_in_days
        ? new Date(Date.now() + known.expires_in_days * 24 * HOUR).toISOString()
        : null,
      skill_loads: 0,
      actions: allowedCount(own),
      denials: deniedCount(own),
      last_activity_at:
        own
          .map(({ at }) => at)
          .sort()
          .at(-1) ?? from,
      top_actions: [...actionTypes.values()].sort((a, b) => b.count - a.count).slice(0, 3),
      top_skills: [],
      // Only buckets with activity, as q-core returns them.
      timeline: [...buckets.entries()].sort(([a], [b]) => a - b).map(([, point]) => point),
    }
  })

  const activity = (row: { skill_loads?: number; loads?: number; actions: number; denials: number }) =>
    (row.skill_loads ?? row.loads ?? 0) + row.actions + row.denials

  return {
    from,
    to,
    bucket,
    coverage: { sources: SOURCES, note: MOCK_AGENT_ACTIVITY_COVERAGE_NOTE },
    totals: {
      skill_loads: scopedLoads.length,
      actions: allowedCount(scopedActions),
      denials: deniedCount(scopedActions),
      // Counts tokens too, as q-core does for older clients.
      members: memberNames.length,
      policy_tokens: tokenKeys.length,
    },
    timeline,
    actions_by_type: [...byType.values()].sort((a, b) => b.count - a.count),
    by_member: byMember
      .sort((a, b) => activity(b) - activity(a) || a.user_name.localeCompare(b.user_name))
      .slice(0, AGENT_ACTIVITY_LIMITS.maxMembers),
    by_policy_token: byPolicyToken
      .sort((a, b) => b.actions + b.denials - (a.actions + a.denials))
      .slice(0, AGENT_ACTIVITY_LIMITS.maxPolicyTokens),
    by_skill: bySkill
      .sort((a, b) => activity(b) - activity(a) || (a.skill_name ?? '').localeCompare(b.skill_name ?? ''))
      .slice(0, AGENT_ACTIVITY_LIMITS.maxSkills),
    recent: scopedActions.slice(0, AGENT_ACTIVITY_LIMITS.maxRecent),
  }
}

/** q-core's 400s: a range that is empty or over 90 days, an unknown bucket, a malformed skill name. */
export function agentActivityParamsError({
  from,
  to,
  bucket,
  skillName,
  userSub,
  actorKind,
  policyTokenId,
}: AgentActivityParams): string | null {
  const fromTime = new Date(from).getTime()
  const toTime = new Date(to).getTime()
  if (Number.isNaN(fromTime) || Number.isNaN(toTime) || fromTime >= toTime) return '"from" must be before "to"'
  if (toTime - fromTime > AGENT_ACTIVITY_LIMITS.maxRangeDays * 24 * HOUR + 60_000)
    return `The range must not exceed ${AGENT_ACTIVITY_LIMITS.maxRangeDays} days`
  if (bucket !== 'DAY' && bucket !== 'HOUR') return 'The bucket must be DAY or HOUR'
  if (skillName !== undefined && !AGENT_ACTIVITY_LIMITS.skillNamePattern.test(skillName)) return 'Invalid skill name'
  if (policyTokenId !== undefined && !UUID.test(policyTokenId)) return 'Invalid policy token id'
  if (policyTokenId && actorKind === 'MEMBER') return 'A policy token cannot be filtered with actorKind=MEMBER'
  if (userSub && (policyTokenId || actorKind === 'POLICY_TOKEN'))
    return 'userSub cannot be combined with a policy token filter'
  return null
}

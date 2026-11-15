import { type AgentActivityParams, type AgentActivityResponse } from '../agent-activity.types'

/*
 * Agent activity for the mock: actions follow from the skill loads (a load of qovery-deploy often
 * leads to a deploy), plus actions through MCP with no skill, and a few denied deletes in production.
 * Seeded, so every run and every test sees the same data.
 */

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
    { event: 'TRIGGER_DEPLOY', target_type: 'APPLICATION', environment: 'staging', chance: 0.6 },
    { event: 'UPDATE', target_type: 'VARIABLE', environment: 'staging', chance: 0.2 },
  ],
  qovery: [
    { event: 'TRIGGER_RESTART', target_type: 'APPLICATION', environment: 'staging', chance: 0.35 },
    { event: 'TRIGGER_STOP', target_type: 'ENVIRONMENT', environment: 'preview', chance: 0.15 },
  ],
  'qovery-troubleshoot': [
    { event: 'TRIGGER_RESTART', target_type: 'APPLICATION', environment: 'production', chance: 0.4 },
  ],
  'qovery-preview': [{ event: 'CREATE', target_type: 'ENVIRONMENT', environment: 'preview', chance: 0.7 }],
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
  { withDenials }: { withDenials: boolean }
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
        origin: 'SKILL',
        skill_name: load.skill_name,
        event: effect.event,
        target_type: effect.target_type,
        ...target(random, effect),
        outcome: 'ALLOWED',
      })
    }
  }

  const person = (id: string) => people.find((item) => item.id === id) ?? people[0]
  const extra = (
    count: number,
    userId: string,
    make: (index: number) => Omit<MockAgentAction, 'at' | 'user_sub' | 'user_name'>
  ) => {
    for (let index = 0; index < count; index++) {
      const { id, name } = person(userId)
      actions.push({
        at: new Date(Date.now() - (index * 37 + 5) * HOUR).toISOString(),
        user_sub: id,
        user_name: name,
        ...make(index),
      })
    }
  }

  // Through the Qovery MCP server: no skill in the user agent.
  extra(14, 'auth0|mock-priya', (index) => ({
    origin: 'MCP',
    skill_name: null,
    event: index % 2 ? 'TRIGGER_RESTART' : 'UPDATE',
    target_type: index % 2 ? 'APPLICATION' : 'VARIABLE',
    target_name: index % 2 ? 'worker' : 'worker: QUEUE_CONCURRENCY',
    project_name: 'payments',
    environment_name: 'payments-staging',
    outcome: 'ALLOWED',
  }))

  if (withDenials) {
    // Refused by the member's role or policy token: deletes in production.
    extra(4, 'auth0|mock-jordan', () => ({
      origin: 'SKILL',
      skill_name: 'qovery',
      event: 'TRIGGER_DELETE',
      target_type: 'ENVIRONMENT',
      target_name: 'payments-production',
      project_name: 'payments',
      environment_name: 'payments-production',
      outcome: 'DENIED',
    }))
    extra(2, 'auth0|mock-jamie', () => ({
      origin: 'SKILL',
      skill_name: 'qovery-deploy',
      event: 'TRIGGER_DEPLOY',
      target_type: 'APPLICATION',
      target_name: 'checkout',
      project_name: 'storefront',
      environment_name: 'storefront-production',
      outcome: 'DENIED',
    }))
  }

  return actions.sort((a, b) => b.at.localeCompare(a.at))
}

/** What q-core returns: aggregates and the latest 100 actions, for the range and filters asked. */
export function aggregateAgentActivity(
  actions: MockAgentAction[],
  loads: MockSkillLoad[],
  { from, to, bucket, userSub, skillName }: AgentActivityParams
): AgentActivityResponse {
  const fromTime = new Date(from).getTime()
  const toTime = new Date(to).getTime()
  const inRange = (at: string) => {
    const time = new Date(at).getTime()
    return time >= fromTime && time <= toTime
  }
  const matches = (user: string, skill: string | null) =>
    (!userSub || user === userSub) && (!skillName || skill === skillName)
  const scopedActions = actions.filter((action) => inRange(action.at) && matches(action.user_sub, action.skill_name))
  const scopedLoads = loads.filter((load) => inRange(load.timestamp) && matches(load.user_sub, load.skill_name))

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
    bucketed.actions += 1
    if (action.outcome === 'DENIED') bucketed.denials += 1
  })

  const byType = new Map<string, { event: string; target_type: string; count: number; denied: number }>()
  scopedActions.forEach(({ event, target_type, outcome }) => {
    const key = `${event}:${target_type}`
    const row = byType.get(key) ?? { event, target_type, count: 0, denied: 0 }
    row.count += 1
    if (outcome === 'DENIED') row.denied += 1
    byType.set(key, row)
  })

  const memberIds = [
    ...new Set([...scopedLoads.map(({ user_sub }) => user_sub), ...scopedActions.map(({ user_sub }) => user_sub)]),
  ]
  const byMember = memberIds.map((id) => {
    const memberLoads = scopedLoads.filter(({ user_sub }) => user_sub === id)
    const memberActions = scopedActions.filter(({ user_sub }) => user_sub === id)
    const skillCounts = new Map<string, number>()
    memberLoads.forEach(({ skill_name }) => skillCounts.set(skill_name, (skillCounts.get(skill_name) ?? 0) + 1))
    const last =
      [...memberLoads.map(({ timestamp }) => timestamp), ...memberActions.map(({ at }) => at)].sort().at(-1) ?? from
    return {
      user_sub: id,
      user_name: memberLoads[0]?.user_name ?? memberActions[0]?.user_name ?? id,
      skill_loads: memberLoads.length,
      actions: memberActions.length,
      denials: memberActions.filter(({ outcome }) => outcome === 'DENIED').length,
      top_skills: [...skillCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
      last_activity_at: last,
    }
  })

  const skillNames = [
    ...new Set<string | null>([
      ...scopedLoads.map(({ skill_name }) => skill_name),
      ...scopedActions.map(({ skill_name }) => skill_name),
    ]),
  ]
  const bySkill = skillNames.map((name) => {
    const skillLoads = scopedLoads.filter(({ skill_name }) => skill_name === name)
    const skillActions = scopedActions.filter(({ skill_name }) => skill_name === name)
    return {
      skill_name: name,
      loads: skillLoads.length,
      actions: skillActions.length,
      denials: skillActions.filter(({ outcome }) => outcome === 'DENIED').length,
      members: new Set([...skillLoads.map(({ user_sub }) => user_sub), ...skillActions.map(({ user_sub }) => user_sub)])
        .size,
    }
  })

  return {
    coverage: {
      sources: ['API', 'CLI', 'MCP'],
      note: 'Shows actions coding agents took through Qovery (API, CLI, MCP). Commands run directly on your cluster are not visible here.',
    },
    totals: {
      skill_loads: scopedLoads.length,
      actions: scopedActions.length,
      denials: scopedActions.filter(({ outcome }) => outcome === 'DENIED').length,
      members: memberIds.length,
    },
    timeline,
    actions_by_type: [...byType.values()].sort((a, b) => b.count - a.count),
    by_member: byMember.sort((a, b) => a.user_name.localeCompare(b.user_name)),
    by_skill: bySkill.sort((a, b) => b.loads + b.actions - (a.loads + a.actions)),
    recent: scopedActions.slice(0, 100),
  }
}

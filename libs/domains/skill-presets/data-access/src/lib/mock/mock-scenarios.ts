import {
  type SkillPresetAssignedTo,
  type SkillPresetAssignees,
  type SkillPresetBase,
  type SkillPresetChangeType,
  type SkillPresetSkill,
} from '../skill-presets.types'
import { type SkillPresetsMockScenario } from './mock-scenario-names'

export interface MockPresetState {
  name: string
  is_template?: boolean
  description: string
  base: SkillPresetBase
  team_context: string | null
  skills: SkillPresetSkill[]
  assigned_to: SkillPresetAssignedTo
}

export interface MockRevisionSeed {
  change_type: SkillPresetChangeType
  edited_by: string
  edited_at: string
  state: MockPresetState
}

export interface MockPresetSeed {
  id: string
  created_at: string
  creator_name: string
  revisions: MockRevisionSeed[]
}

export interface MockLoadSeed {
  timestamp: string
  member_id: string
  skill_name: string
  from_cache: boolean
}

export interface MockSeed {
  currentUserId: string
  isAdmin: boolean
  assignees: SkillPresetAssignees
  memberRoles: Record<string, string>
  presets: MockPresetSeed[]
  loads: MockLoadSeed[]
  /** The organization's policy tokens. None unless the scenario sets them. */
  policyTokens?: MockPolicyToken[]
  /** AI features start off (ai-features-off, agent-experience-empty). */
  aiFeaturesOff?: boolean
  /** The Copilot starts off. It is on in the other scenarios, read-only. */
  copilotOff?: boolean
  /** Agent actions on top of the skill loads: MCP tool calls, the policy token, refused requests. */
  agentExtras?: { mcp: boolean; policyToken: boolean; denials: boolean }
}

/** A policy token, shaped like `OrganizationPolicyApiToken` in qovery-typescript-axios. */
export interface MockPolicyToken {
  id: string
  created_at: string
  name: string
  description?: string
  role_name: string
  role_id: string
  creator_name: string
  expires_at?: string
  last_used_at?: string
}

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 3_600_000).toISOString()

/** The CI token matches the `policy:<id>:ci-deployer` actor of the agent activity mock. */
function mockPolicyTokens(): MockPolicyToken[] {
  return [
    {
      id: '3f1c9a2e-0000-4000-8000-00000000c1d0',
      created_at: daysFromNow(-41),
      name: 'ci-deployer',
      description: 'CI pipeline: deploys staging environments only.',
      role_name: 'devops',
      role_id: MOCK_ROLE_IDS.devops,
      creator_name: 'Alex Martin',
      expires_at: daysFromNow(49),
      last_used_at: daysFromNow(-0.4),
    },
    {
      id: '3f1c9a2e-0000-4000-8000-00000000a9e1',
      created_at: daysFromNow(-12),
      name: 'review-agent',
      description: 'Reads logs and statuses, never deploys.',
      role_name: 'viewer',
      role_id: MOCK_ROLE_IDS.viewer,
      creator_name: 'Sam Lee',
      last_used_at: daysFromNow(-2),
    },
  ]
}

// Fixed ids: the default roles have fixed ids in q-core, these are stand-ins.
export const MOCK_ROLE_IDS = {
  owner: '00000000-0000-4000-8000-000000000001',
  admin: '00000000-0000-4000-8000-000000000002',
  devops: '00000000-0000-4000-8000-000000000003',
  billing: '00000000-0000-4000-8000-000000000004',
  viewer: '00000000-0000-4000-8000-000000000005',
  backend: '0b5e2c4a-6a51-4d1e-9a0f-1f3c2a7b9e10',
  contractors: '7d2f9c8e-3b14-4a6f-8c5d-2e9a1b0c4d21',
}

const ROLES = [
  { id: MOCK_ROLE_IDS.owner, name: 'Owner' },
  { id: MOCK_ROLE_IDS.admin, name: 'Admin' },
  { id: MOCK_ROLE_IDS.devops, name: 'Devops' },
  { id: MOCK_ROLE_IDS.billing, name: 'Billing' },
  { id: MOCK_ROLE_IDS.viewer, name: 'Viewer' },
  { id: MOCK_ROLE_IDS.backend, name: 'Backend engineers' },
  { id: MOCK_ROLE_IDS.contractors, name: 'Contractors' },
]

const PEOPLE: [string, string, string][] = [
  ['auth0|mock-alex', 'Alex Martin', 'owner'],
  ['auth0|mock-sam', 'Sam Lee', 'admin'],
  ['auth0|mock-priya', 'Priya Shah', 'devops'],
  ['auth0|mock-jordan', 'Jordan Kim', 'devops'],
  ['auth0|mock-taylor', 'Taylor Brooks', 'backend'],
  ['auth0|mock-casey', 'Casey Nguyen', 'backend'],
  ['auth0|mock-riley', 'Riley Chen', 'backend'],
  ['auth0|mock-drew', 'Drew Patel', 'backend'],
  ['auth0|mock-jamie', 'Jamie Rossi', 'contractors'],
  ['auth0|mock-avery', 'Avery Novak', 'contractors'],
  ['auth0|mock-quinn', 'Quinn Garcia', 'viewer'],
  ['auth0|mock-robin', 'Robin Okafor', 'billing'],
]

const emailOf = (name: string) => `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`

const roleIdOf = (role: string) => MOCK_ROLE_IDS[role as keyof typeof MOCK_ROLE_IDS]
const MEMBERS = PEOPLE.map(([id, name, role]) => ({ id, name, email: emailOf(name), role_id: roleIdOf(role) }))
const MEMBER_ROLES = Object.fromEntries(PEOPLE.map(([id, , role]) => [id, roleIdOf(role)]))

const HOUR = 3_600_000
const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * HOUR).toISOString()

const BACKEND_TEAM_CONTEXT = `## How we run Qovery

- Production runs on the \`prod-eu\` cluster, shared by three projects. Never change cluster settings from an agent.
- Every service has a \`staging\` environment. Deploy there first and wait for the smoke tests.
- Services call each other across namespaces through their internal host names, not public URLs.
- Never deploy to production from an agent. Open a pull request and let the pipeline promote it.

## Naming

- Environments: \`<team>-<purpose>\`, for example \`payments-staging\`.
- Preview environments are created per pull request and stop after 4 hours of inactivity.`

const DEPLOY_OVERLAY = `Deploy to the \`staging\` environment first.
Run \`qovery environment deploy --watch\` and wait for the smoke tests to pass.
If a deployment fails twice, stop and ask the user before trying again.`

const TROUBLESHOOT_OVERLAY = `Start with the service logs, then the deployment logs.
Our services log in JSON: filter on \`level=error\` before reading anything else.`

const PLATFORM_TEAM_CONTEXT = `You work with engineers who know Kubernetes well.
Prefer the \`qovery\` CLI and read \`qovery <command> --help\` instead of guessing flags.
Ask before any command that deletes or stops a resource.`

const RELEASE_CHECKLIST = `1. Tag the release: \`git tag vX.Y.Z\`.
2. Deploy the staging environment and wait for the smoke tests.
3. Post the changelog in the release channel.
4. Promote to production from the pipeline, never by hand.`

const STAGING_ONLY = `Only deploy to environments whose name ends with \`-staging\` or \`-preview\`.
If the user asks for another environment, explain that it needs a reviewer and stop.`

const INCIDENT_HANDOFF = `When a deployment fails:

1. Collect the last 50 lines of the deployment logs.
2. Summarize what failed in three sentences.
3. Ask the user to open an incident ticket with that summary. Do not retry on your own.`

const TEAM_CONTEXT_V1 = BACKEND_TEAM_CONTEXT.split('\n## Naming')[0]

function backendTeamRevisions(): MockRevisionSeed[] {
  const v1: MockPresetState = {
    name: 'Backend team',
    description: 'Default for every engineer: our deployment rules on top of the Qovery skills.',
    base: 'QOVERY_FULL',
    team_context: TEAM_CONTEXT_V1,
    skills: [
      { skill_name: 'qovery-deploy', mode: 'OVERLAY', content: DEPLOY_OVERLAY.split('\n')[0] },
      { skill_name: 'qovery-signup', mode: 'DISABLE' },
    ],
    assigned_to: { organization_default: true, role_ids: [], user_ids: [] },
  }
  const v2: MockPresetState = {
    ...v1,
    skills: [
      { skill_name: 'qovery-deploy', mode: 'OVERLAY', content: DEPLOY_OVERLAY },
      { skill_name: 'qovery-signup', mode: 'DISABLE' },
      { skill_name: 'qovery-onboard', mode: 'DISABLE' },
    ],
  }
  const v3: MockPresetState = { ...v2, team_context: BACKEND_TEAM_CONTEXT }
  const v4: MockPresetState = {
    ...v3,
    skills: [
      ...v3.skills,
      { skill_name: 'qovery-troubleshoot', mode: 'OVERLAY', content: TROUBLESHOOT_OVERLAY },
      { skill_name: 'qovery-assess', mode: 'DISABLE' },
    ],
  }
  return [
    { change_type: 'CREATE', edited_by: 'alex.martin@example.com', edited_at: at(24 * 21), state: v1 },
    { change_type: 'UPDATE', edited_by: 'sam.lee@example.com', edited_at: at(24 * 14 + 3), state: v2 },
    { change_type: 'UPDATE', edited_by: 'priya.shah@example.com', edited_at: at(24 * 6 + 5), state: v3 },
    { change_type: 'UPDATE', edited_by: 'sam.lee@example.com', edited_at: at(26), state: v4 },
  ]
}

function platformRevisions(): MockRevisionSeed[] {
  const v1: MockPresetState = {
    name: 'Platform (CLI-first)',
    description: 'For the Devops role: a short CLI-first skill instead of the full Qovery skills.',
    base: 'QOVERY_LEAN',
    team_context: PLATFORM_TEAM_CONTEXT,
    skills: [],
    assigned_to: { organization_default: false, role_ids: [MOCK_ROLE_IDS.devops], user_ids: [] },
  }
  const v2: MockPresetState = {
    ...v1,
    skills: [
      {
        skill_name: 'release-checklist',
        mode: 'ADD',
        description: 'Release checklist. Use when cutting a release or promoting to production.',
        content: RELEASE_CHECKLIST,
      },
    ],
  }
  return [
    { change_type: 'CREATE', edited_by: 'priya.shah@example.com', edited_at: at(24 * 12), state: v1 },
    { change_type: 'UPDATE', edited_by: 'jordan.kim@example.com', edited_at: at(24 * 3 + 2), state: v2 },
  ]
}

function contractorsRevisions(): MockRevisionSeed[] {
  const v1: MockPresetState = {
    name: 'External contractors',
    description: 'No Qovery skills, only our two guardrail skills.',
    base: 'NONE',
    team_context: 'You are helping an external contractor. Keep every change inside staging and preview environments.',
    skills: [
      {
        skill_name: 'staging-only-deploys',
        mode: 'ADD',
        description: 'Deployment rules for contractors. Use before any deployment or environment change.',
        content: STAGING_ONLY,
      },
    ],
    assigned_to: { organization_default: false, role_ids: [], user_ids: ['auth0|mock-jamie'] },
  }
  const v2: MockPresetState = {
    ...v1,
    skills: [
      ...v1.skills,
      {
        skill_name: 'incident-handoff',
        mode: 'ADD',
        description: 'What to do when a deployment fails. Use when a deployment or a service is failing.',
        content: INCIDENT_HANDOFF,
      },
    ],
    assigned_to: { organization_default: false, role_ids: [], user_ids: ['auth0|mock-jamie', 'auth0|mock-avery'] },
  }
  return [
    { change_type: 'CREATE', edited_by: 'alex.martin@example.com', edited_at: at(24 * 9), state: v1 },
    { change_type: 'UPDATE', edited_by: 'sam.lee@example.com', edited_at: at(5), state: v2 },
  ]
}

const QOVERY_SKILLS_LOADED = ['qovery', 'qovery-deploy', 'qovery-troubleshoot', 'qovery-preview', 'qovery-optimize']

function buildLoads(count: number, spanHours: number): MockLoadSeed[] {
  const loaders = MEMBERS.filter(({ id }) => id !== 'auth0|mock-robin' && id !== 'auth0|mock-quinn')
  // Uneven on purpose: a few heavy users, a long tail, quieter weekends.
  const weights = loaders.map((_, index) => Math.max(1, 9 - index))
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const pick = () => {
    let roll = random() * totalWeight
    for (let index = 0; index < loaders.length; index++) {
      roll -= weights[index]
      if (roll <= 0) return loaders[index]
    }
    return loaders[0]
  }
  const loads: MockLoadSeed[] = []
  while (loads.length < count) {
    const hoursAgo = random() * spanHours + 0.2
    const day = new Date(Date.now() - hoursAgo * HOUR).getDay()
    if ((day === 0 || day === 6) && random() < 0.7) continue
    const member = pick()
    const isContractor = member.id === 'auth0|mock-jamie' || member.id === 'auth0|mock-avery'
    const isDevops = MEMBER_ROLES[member.id] === MOCK_ROLE_IDS.devops
    const pool = isContractor
      ? ['staging-only-deploys', 'incident-handoff', 'qovery-deploy']
      : isDevops
        ? ['qovery', 'release-checklist']
        : QOVERY_SKILLS_LOADED
    loads.push({
      timestamp: at(hoursAgo),
      member_id: member.id,
      skill_name: pool[Math.floor(random() * pool.length)],
      from_cache: random() < 0.68,
    })
  }
  return loads.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

function typicalSeed(): MockSeed {
  return {
    currentUserId: 'auth0|mock-alex',
    isAdmin: true,
    assignees: { roles: ROLES, members: MEMBERS },
    memberRoles: MEMBER_ROLES,
    presets: [
      {
        id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a01',
        created_at: at(24 * 21),
        creator_name: 'Alex Martin',
        revisions: backendTeamRevisions(),
      },
      {
        id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a02',
        created_at: at(24 * 12),
        creator_name: 'Priya Shah',
        revisions: platformRevisions(),
      },
      {
        id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a03',
        created_at: at(24 * 9),
        creator_name: 'Alex Martin',
        revisions: contractorsRevisions(),
      },
      {
        id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a05',
        created_at: at(24 * 4),
        creator_name: 'Sam Lee',
        revisions: [
          {
            change_type: 'CREATE',
            edited_by: 'sam.lee@example.com',
            edited_at: at(24 * 4),
            state: {
              name: 'New team starter',
              is_template: true,
              description: 'Our starting point for a new team: copy it, then assign the copy.',
              base: 'QOVERY_FULL',
              team_context: BACKEND_TEAM_CONTEXT.split('\n## Naming')[0],
              skills: [{ skill_name: 'qovery-deploy', mode: 'OVERLAY', content: DEPLOY_OVERLAY }],
              assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
            },
          },
        ],
      },
    ],
    loads: buildLoads(36, 24 * 4),
  }
}

function conflictsSeed(): MockSeed {
  const seed = typicalSeed()
  seed.presets.push({
    id: '0193f1c2-5a7e-7b10-9a0e-3d1f2c4b5a04',
    created_at: at(48),
    creator_name: 'Sam Lee',
    revisions: [
      {
        change_type: 'CREATE',
        edited_by: 'sam.lee@example.com',
        edited_at: at(48),
        state: {
          name: 'Admins',
          description: 'Admins and on-call engineers.',
          base: 'QOVERY_FULL',
          team_context: null,
          skills: [],
          assigned_to: {
            organization_default: false,
            role_ids: [MOCK_ROLE_IDS.admin],
            user_ids: ['auth0|mock-taylor'],
          },
        },
      },
    ],
  })
  return seed
}

/** About 60 KB of markdown, to check editors and diffs with very long content. */
function longRunbook() {
  const section = (index: number) => `## Step ${index + 1}: check the service

1. Open the service logs and filter on \`level=error\`.
2. Compare the last two deployments and note what changed.
3. If the change is a configuration change, revert it in a pull request.
4. If the change is in the code, ask the user which commit to roll back to.
`
  return Array.from({ length: 220 }, (_, index) => section(index)).join('\n')
}

function largeSeed(): MockSeed {
  const seed = typicalSeed()
  const history = backendTeamRevisions()
  const last = history[history.length - 1]
  for (let index = 0; index < 116; index++) {
    const editor = MEMBERS[index % 4]
    history.push({
      change_type: 'UPDATE',
      edited_by: editor.email,
      edited_at: at(25 - (index + 1) * 0.2),
      state: {
        ...last.state,
        team_context: `${BACKEND_TEAM_CONTEXT}\n\nOn-call rotation note ${index + 1}: page the platform team first.`,
      },
    })
  }
  seed.presets[0].revisions = history
  seed.presets[1].revisions[1].state.skills.push({
    skill_name: 'incident-runbook',
    mode: 'ADD',
    description: 'Long incident runbook. Use when a production service is degraded.',
    content: longRunbook(),
  })
  const extraTeams = ['payments', 'search', 'mobile-api', 'data', 'growth', 'identity', 'billing', 'infra']
  for (let index = 0; index < 37; index++) {
    const team = `${extraTeams[index % extraTeams.length]}-${Math.floor(index / extraTeams.length) + 1}`
    seed.presets.push({
      id: `0193f1c2-5a7e-7b10-9a0e-${(index + 100).toString().padStart(12, '0')}`,
      created_at: at(24 * 30 - index),
      creator_name: MEMBERS[index % MEMBERS.length].name,
      revisions: [
        {
          change_type: 'CREATE',
          edited_by: MEMBERS[index % MEMBERS.length].email,
          edited_at: at(24 * 30 - index),
          state: {
            name: `Team ${team}`,
            description: `Preset for the ${team} team.`,
            base: index % 3 === 0 ? 'QOVERY_LEAN' : 'QOVERY_FULL',
            team_context: `The ${team} team deploys from its own project. Ask before touching shared resources.`,
            skills: index % 2 === 0 ? [{ skill_name: 'qovery-assess', mode: 'DISABLE' }] : [],
            assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
          },
        },
      ],
    })
  }
  seed.loads = buildLoads(600, 24 * 14)
  return seed
}

export function buildMockSeed(scenario: SkillPresetsMockScenario): MockSeed {
  switch (scenario) {
    case 'empty':
      return { ...typicalSeed(), presets: [], loads: [] }
    case 'conflicts':
      return conflictsSeed()
    case 'large':
      return largeSeed()
    case 'agent-activity':
    case 'agent-experience-active':
      return { ...typicalSeed(), loads: buildLoads(420, 24 * 30), policyTokens: mockPolicyTokens() }
    case 'ai-features-off':
      return { ...typicalSeed(), aiFeaturesOff: true, copilotOff: true }
    case 'agent-experience-empty':
      return {
        ...typicalSeed(),
        presets: [],
        loads: [],
        aiFeaturesOff: true,
        copilotOff: true,
        agentExtras: { mcp: false, policyToken: false, denials: false },
      }
    case 'agent-experience-partial':
      // Agents already load the Qovery skills, but nobody has set up a preset or a policy token.
      return {
        ...typicalSeed(),
        presets: [],
        loads: buildLoads(90, 24 * 7),
        copilotOff: true,
        agentExtras: { mcp: true, policyToken: false, denials: false },
      }
    case 'agent-activity-empty':
      return { ...typicalSeed(), loads: [], agentExtras: { mcp: false, policyToken: false, denials: false } }
    case 'member':
      // Taylor is a backend engineer: the organization default applies to them.
      return {
        ...typicalSeed(),
        currentUserId: 'auth0|mock-taylor',
        isAdmin: false,
        loads: buildLoads(420, 24 * 30),
        policyTokens: mockPolicyTokens(),
      }
    case 'member-no-preset': {
      // Same organization without an organization default: nothing applies to Taylor.
      const seed = typicalSeed()
      return {
        ...seed,
        currentUserId: 'auth0|mock-taylor',
        isAdmin: false,
        presets: seed.presets.filter(({ revisions }) => !revisions.at(-1)?.state.assigned_to.organization_default),
      }
    }
    default:
      return typicalSeed()
  }
}

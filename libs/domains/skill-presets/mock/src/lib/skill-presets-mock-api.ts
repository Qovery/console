import {
  type OrganizationEventResponse,
  OrganizationEventSubTargetType,
  OrganizationEventType,
  type SkillLoadPurpose,
  type SkillPresetAssignedTo,
  type SkillPresetChangeType,
  type SkillPresetManifestResponse,
  type SkillPresetRequest,
  type SkillPresetResolutionSource,
  type SkillPresetResolvedSkillResponse,
  type SkillPresetResponse,
  type SkillPresetRevisionResponse,
} from 'qovery-typescript-axios'
import { type AgentActivityQueryParams } from '@qovery/domains/skill-presets/data-access'
import {
  SKILL_NAME_PATTERN,
  SKILL_PRESET_LIMITS,
  approxTokens,
  effectiveRoleId,
  isOwnerRole,
  isQoverySkillName,
  resolvePresetFor,
  totalPresetTextLength,
} from '@qovery/domains/skill-presets/util'
import {
  type MockAgentAction,
  agentActivityParamsError,
  aggregateAgentActivity,
  buildMockAgentActions,
} from './mock-agent-activity'
import { inspectSkillPresetContent } from './mock-content-inspector'
import { MOCK_REVIEW_MODEL, MOCK_REVIEW_PROMPT_VERSION, reviewSkillPresetContent } from './mock-model-review'
import { type SkillPresetsMockScenario } from './mock-scenario-names'
import { type MockPresetState, buildMockSeed } from './mock-scenarios'
import { buildSkillPresetApiError } from './mock-tools'

/** Deterministic stand-in for SHA-256: 64 hex characters, clearly not a real hash of the content. */
export function mockHash(text: string) {
  let hash = ''
  for (let round = 0; round < 8; round++) {
    let value = 0x811c9dc5 ^ round
    for (let index = 0; index < text.length; index++) {
      value ^= text.charCodeAt(index)
      value = Math.imul(value, 0x01000193) >>> 0
    }
    hash += value.toString(16).padStart(8, '0')
  }
  return hash
}

const clone = <T>(value: T): T => (value === undefined ? value : JSON.parse(JSON.stringify(value)))

const toState = (body: SkillPresetRequest): MockPresetState => ({
  name: body.name.trim(),
  is_template: Boolean(body.is_template),
  description: body.description ?? '',
  base: body.base ?? 'FULL',
  team_context: body.team_context?.trim() ? body.team_context : null,
  skills: (body.skills ?? []).map((skill) => ({
    skill_name: skill.skill_name.trim(),
    mode: skill.mode,
    description: skill.description ?? null,
    content: skill.content ?? null,
  })),
  assigned_to: {
    organization_default: Boolean(body.assigned_to?.organization_default),
    role_ids: body.assigned_to?.role_ids ?? [],
    user_ids: body.assigned_to?.user_ids ?? [],
  },
})

interface StoredPreset extends MockPresetState {
  id: string
  created_at: string
  updated_at: string
  revision: number
  creator_name: string
}

function validate(state: MockPresetState): string | null {
  const limits = SKILL_PRESET_LIMITS
  if (!state.name || state.name.length > limits.nameMaxLength) {
    return `The name must be between 1 and ${limits.nameMaxLength} characters`
  }
  if (state.description.length > limits.descriptionMaxLength) {
    return `The description must not exceed ${limits.descriptionMaxLength} characters`
  }
  if ((state.team_context?.length ?? 0) > limits.teamContextMaxLength) {
    return `The team context must not exceed ${limits.teamContextMaxLength} characters`
  }
  if (state.skills.length > limits.maxSkills) return `A preset holds at most ${limits.maxSkills} skills`
  const names = state.skills.map(({ skill_name }) => skill_name)
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  if (duplicates.length > 0) return `Each skill may appear once, found duplicates: ${duplicates.join(', ')}`
  for (const skill of state.skills) {
    const name = skill.skill_name
    if (!SKILL_NAME_PATTERN.test(name)) {
      return `Skill name '${name}' must be lowercase letters, digits and hyphens, at most 64 characters`
    }
    if (skill.mode === 'ADD' && isQoverySkillName(name)) {
      return `Skill name '${name}' is reserved for Qovery skills: use OVERLAY or REPLACE, or another name`
    }
    if (skill.mode !== 'ADD' && !isQoverySkillName(name)) {
      return `Skill '${name}' is not a Qovery skill: only ADD applies to the organization's own skills`
    }
    if (skill.mode !== 'ADD' && state.base !== 'FULL') {
      return `Skill '${name}' uses ${skill.mode}, which only applies to the FULL base. Put team instructions in the team context instead.`
    }
    if ((skill.mode === 'DISABLE' || skill.mode === 'OVERLAY') && skill.description) {
      return `Skill '${name}' uses ${skill.mode}, which takes no description`
    }
    if (skill.mode === 'DISABLE') {
      if (skill.content) return `Skill '${name}' uses DISABLE, which takes no content`
      continue
    }
    if (!skill.content?.trim()) return `Skill '${name}' needs content`
    if (skill.content.length > limits.skillContentMaxLength) {
      return `Skill '${name}' content must not exceed ${limits.skillContentMaxLength} characters`
    }
    if ((skill.mode === 'ADD' || skill.mode === 'REPLACE') && !skill.description?.trim()) {
      return `Skill '${name}' needs a description: agents decide when to load a skill from it`
    }
  }
  if (totalPresetTextLength(state) > limits.totalTextMaxLength) {
    return `A preset holds at most ${limits.totalTextMaxLength} characters of text in total, so that it can be reviewed before it reaches members`
  }
  const isAssigned =
    state.assigned_to.organization_default ||
    state.assigned_to.role_ids.length > 0 ||
    state.assigned_to.user_ids.length > 0
  if (state.is_template && isAssigned) {
    return 'A template cannot be assigned: copy it into a preset and assign that one'
  }
  return null
}

function fieldsOf(state: MockPresetState) {
  return [
    { location: 'description', text: state.description },
    ...(state.team_context ? [{ location: 'team context', text: state.team_context }] : []),
    ...state.skills.flatMap((skill) => [
      ...(skill.description
        ? [{ location: `description of skill '${skill.skill_name}'`, text: skill.description }]
        : []),
      ...(skill.content ? [{ location: `content of skill '${skill.skill_name}'`, text: skill.content }] : []),
    ]),
  ]
}

/** The rule check, then the model review, as q-core runs them. */
function inspect(state: MockPresetState) {
  const fields = fieldsOf(state)
  return [...inspectSkillPresetContent(fields), ...reviewSkillPresetContent(fields)]
}

const HOUR_MS = 3_600_000

const PASSED_REVIEW = {
  verdict: 'ALLOW' as const,
  model: MOCK_REVIEW_MODEL,
  prompt_version: MOCK_REVIEW_PROMPT_VERSION,
  findings: [],
}

const ADMIN_ONLY = 'You need the permission to manage organization data to do this'

const ACTIVITY_TIMED_OUT_DETAIL =
  'This range holds too much activity to read in time. Narrow the range, or filter by member or skill.'

export function createSkillPresetsMockApi(scenario: SkillPresetsMockScenario, organizationName = 'Acme (mock)') {
  const seed = buildMockSeed(scenario)
  const latency = scenario === 'slow' ? 2000 : 250
  const members = seed.assignees.members
  const memberEmail = (id: string) => members.find((member) => member.id === id)?.email ?? id
  const currentUser = members.find(({ id }) => id === seed.currentUserId) ?? members[0]

  let presets: StoredPreset[] = []
  const revisions: SkillPresetRevisionResponse[] = []
  const events: OrganizationEventResponse[] = []
  let idCounter = 0
  const loadRecords: {
    timestamp: string
    user_sub: string
    user_name: string
    skill_name: string
    skill_preset_id: string | null
    skill_preset_name: string | null
    from_cache: boolean
    tokens: number
  }[] = []

  const pushEvent = (
    event_type: OrganizationEventType,
    triggered_by: string,
    timestamp: string,
    change: unknown,
    original_change?: unknown
  ) => {
    idCounter += 1
    events.push({
      id: `mock-event-${idCounter}`,
      timestamp,
      event_type,
      target_type: 'ORGANIZATION',
      target_id: 'mock-organization',
      target_name: organizationName,
      sub_target_type: OrganizationEventSubTargetType.SKILL_PRESET,
      change: JSON.stringify(change),
      original_change: original_change ? JSON.stringify(original_change) : null,
      origin: event_type === OrganizationEventType.SKILL_LOAD ? 'CLI' : 'CONSOLE',
      triggered_by,
    })
  }

  const auditView = (preset: StoredPreset) => ({
    id: preset.id,
    name: preset.name,
    is_template: Boolean(preset.is_template),
    base: preset.base,
    revision: preset.revision,
    team_context: preset.team_context,
    team_context_sha256: preset.team_context ? mockHash(preset.team_context) : null,
    skills: preset.skills.map((skill) => ({
      ...skill,
      content_sha256: skill.content ? mockHash(skill.content) : null,
    })),
    assigned_to: preset.assigned_to,
    content_omitted: false,
    security_review: PASSED_REVIEW,
  })

  const recordRevision = (
    preset: StoredPreset,
    change_type: SkillPresetChangeType,
    edited_by: string,
    edited_at: string
  ) => {
    revisions.push({
      skill_preset_id: preset.id,
      security_review: change_type === 'DELETE' ? null : PASSED_REVIEW,
      revision: preset.revision,
      change_type,
      edited_by,
      edited_at,
      name: preset.name,
      is_template: Boolean(preset.is_template),
      description: preset.description,
      base: preset.base,
      team_context: preset.team_context,
      skills: clone(preset.skills),
      assigned_to: clone(preset.assigned_to),
    })
  }

  // Replay the seed through the same code paths the mutations use, so its revisions and audit
  // entries have exactly the shapes a save produces.
  for (const presetSeed of seed.presets) {
    let previous: StoredPreset | undefined
    presetSeed.revisions.forEach((revisionSeed, index) => {
      const preset: StoredPreset = {
        ...clone(revisionSeed.state),
        id: presetSeed.id,
        created_at: presetSeed.created_at,
        updated_at: revisionSeed.edited_at,
        revision: index + 1,
        creator_name: presetSeed.creator_name,
      }
      recordRevision(preset, revisionSeed.change_type, revisionSeed.edited_by, revisionSeed.edited_at)
      pushEvent(
        revisionSeed.change_type,
        revisionSeed.edited_by,
        revisionSeed.edited_at,
        auditView(preset),
        revisionSeed.change_type === 'UPDATE' && previous ? auditView(previous) : undefined
      )
      previous = preset
    })
    if (previous) presets.push(previous)
  }

  // The same resolution as the editor's preview, so mock mode and the UI cannot drift apart.
  const resolveFor = (userId: string): { source: SkillPresetResolutionSource; preset?: StoredPreset } => {
    const roleId = effectiveRoleId(seed.memberRoles[userId], seed.assignees.roles)
    const { source, preset } = resolvePresetFor(
      presets.filter(({ is_template }) => !is_template),
      { userId, roleId }
    )
    return { source, preset: preset ?? undefined }
  }

  for (const load of seed.loads) {
    const { source, preset } = resolveFor(load.member_id)
    const skill = preset?.skills.find(({ skill_name }) => skill_name === load.skill_name)
    const change = {
      skill_name: load.skill_name,
      source,
      skill_preset_id: preset?.id ?? null,
      skill_preset_name: preset?.name ?? null,
      revision: preset?.revision ?? null,
      mode: skill?.mode ?? null,
      content_sha256: skill?.content ? mockHash(skill.content) : null,
      team_context_sha256: preset?.team_context ? mockHash(preset.team_context) : null,
      from_cache: load.from_cache,
    }
    pushEvent(OrganizationEventType.SKILL_LOAD, memberEmail(load.member_id), load.timestamp, change)
    loadRecords.push({
      timestamp: load.timestamp,
      user_sub: load.member_id,
      user_name: members.find(({ id }) => id === load.member_id)?.name ?? load.member_id,
      skill_name: load.skill_name,
      skill_preset_id: preset?.id ?? null,
      skill_preset_name: preset?.name ?? null,
      from_cache: load.from_cache,
      tokens: load.from_cache ? 0 : approxTokens(skill?.content) + approxTokens(preset?.team_context),
    })
  }

  // Saves wait for the model review: about 1.5 seconds, so the progress state shows.
  const writeLatency = Math.max(latency, 1500)
  const respond = <T>(value: T, delay = latency): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(clone(value)), delay))
  const fail = (status: number, detail: string, extra?: Record<string, unknown>, delay = latency): Promise<never> =>
    new Promise((_, reject) => setTimeout(() => reject(buildSkillPresetApiError(status, detail, extra)), delay))

  const toResponse = (preset: StoredPreset): SkillPresetResponse => ({
    id: preset.id,
    created_at: preset.created_at,
    updated_at: preset.updated_at,
    name: preset.name,
    description: preset.description,
    base: preset.base,
    team_context: preset.team_context,
    skills: preset.skills,
    revision: preset.revision,
    is_template: Boolean(preset.is_template),
    creator_name: preset.creator_name,
    assigned_to: preset.assigned_to,
  })

  const assignmentConflict = (assignedTo: Required<SkillPresetAssignedTo>, exceptId?: string) =>
    presets.some(
      (preset) =>
        preset.id !== exceptId &&
        ((assignedTo.organization_default && preset.assigned_to.organization_default) ||
          assignedTo.role_ids.some((roleId) => preset.assigned_to.role_ids.includes(roleId)) ||
          assignedTo.user_ids.some((userId) => preset.assigned_to.user_ids.includes(userId)))
    )

  const now = () => new Date().toISOString()
  let reviewFailedOnce = false
  // Off in the ai-features-off scenario until an admin turns them on. Resets on reload.
  let aiFeaturesOn = scenario !== 'ai-features-off' && !seed.aiFeaturesOff
  // The Copilot's organization config, as the DevOps Copilot service returns it.
  let copilotFailedOnce = false
  let policyTokens = [...(seed.policyTokens ?? [])]
  const copilot = { enabled: !seed.copilotOff, read_only: true, instructions: '', token_mode: 'jwt' as const }
  // The timeout scenario reads at most 7 days in time, as a busy organization would.
  const activityTimesOut = ({ from, to }: { from: string; to: string }) =>
    scenario === 'agent-activity-timeout' &&
    new Date(to).getTime() - new Date(from).getTime() > 7 * 24 * HOUR_MS + 60_000
  const checkWrite = (state: MockPresetState, exceptId?: string): Promise<never> | null => {
    if (!aiFeaturesOn) return fail(403, 'AI features are disabled for this organization')
    const invalid = validate(state)
    if (invalid) return fail(400, invalid)
    if (presets.some((preset) => preset.id !== exceptId && preset.name === state.name)) {
      return fail(409, `Skill preset name '${state.name}' already exists`)
    }
    const { role_ids, user_ids } = state.assigned_to
    if (role_ids.length + user_ids.length > SKILL_PRESET_LIMITS.maxAssignments) {
      return fail(
        400,
        `A preset holds at most ${SKILL_PRESET_LIMITS.maxAssignments} assignments: assign a role rather than each member`
      )
    }
    if (role_ids.some((id) => seed.assignees.roles.some((role) => role.id === id && isOwnerRole(role)))) {
      return fail(
        400,
        'Assign the Admin role rather than the Owner role: the organization owner is resolved as an admin'
      )
    }
    const unknownRole = state.assigned_to.role_ids.find((id) => !seed.assignees.roles.some((role) => role.id === id))
    if (unknownRole) return fail(404, `Role ${unknownRole} does not exist in this organization`)
    if (scenario === 'review-unavailable' && !reviewFailedOnce) {
      reviewFailedOnce = true
      return fail(503, 'Skill preset security review unavailable', undefined, writeLatency)
    }
    const findings = inspect(state)
    if (findings.length > 0) {
      // A refused save leaves a SKILL_PRESET_REJECTED audit entry: hashes and findings, never the text.
      const rejected = {
        attempted_change: exceptId ? 'UPDATE' : 'CREATE',
        skill_preset_id: exceptId ?? null,
        name: state.name,
        base: state.base,
        is_template: Boolean(state.is_template),
        description_sha256: mockHash(state.description),
        team_context_sha256: state.team_context ? mockHash(state.team_context) : null,
        skills: state.skills.map(({ skill_name, mode, description, content }) => ({
          skill_name,
          mode,
          description_sha256: description ? mockHash(description) : null,
          content_sha256: content ? mockHash(content) : null,
        })),
        assigned_to: state.assigned_to,
        findings,
      }
      pushEvent(OrganizationEventType.SKILL_PRESET_REJECTED, currentUser.email, now(), rejected)
      return fail(
        422,
        `This preset was rejected to protect the members it applies to. ${findings
          .map((finding) => `${finding.location}, line ${finding.line}: ${finding.reason} [${finding.rule_id}]`)
          .join('; ')}.`,
        { type: 'about:blank', title: 'Skill preset rejected for security', findings },
        writeLatency
      )
    }
    if (assignmentConflict(state.assigned_to, exceptId)) {
      return fail(409, 'One of the assignment targets already receives another skill preset: unassign it there first')
    }
    return null
  }

  const findPreset = (skillPresetId: string) => presets.find(({ id }) => id === skillPresetId)
  const forbidden = () => fail(403, ADMIN_ONLY)
  let mockActions: MockAgentAction[] | null = null
  const agentActions = () =>
    (mockActions ??= buildMockAgentActions(loadRecords, members, {
      withDenials: seed.agentExtras?.denials ?? true,
      withMcp: seed.agentExtras?.mcp ?? true,
      withPolicyToken: seed.agentExtras?.policyToken ?? true,
    }))
  let concurrentSaveDone = false
  let listFailedOnce = false

  const api = {
    listSkillPresets(_organizationId: string, { isTemplate }: { isTemplate?: boolean } = {}) {
      if (!seed.isAdmin) return forbidden()
      // Fails once, so the error state and its retry can both be shown.
      if (scenario === 'errors' && !listFailedOnce) {
        listFailedOnce = true
        return fail(500, 'Internal server error')
      }
      return respond(
        [...presets]
          .filter((preset) => isTemplate === undefined || Boolean(preset.is_template) === isTemplate)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(toResponse)
      )
    },
    getSkillPreset(skillPresetId: string) {
      if (!seed.isAdmin) return forbidden()
      const preset = findPreset(skillPresetId)
      return preset ? respond(toResponse(preset)) : fail(404, `Skill preset ${skillPresetId} does not exist`)
    },
    createSkillPreset(_organizationId: string, body: SkillPresetRequest) {
      if (!seed.isAdmin) return forbidden()
      const state = toState(body)
      const rejection = checkWrite(state)
      if (rejection) return rejection
      idCounter += 1
      const timestamp = now()
      const preset: StoredPreset = {
        ...state,
        id: `0193f1c2-mock-7000-8000-${idCounter.toString().padStart(12, '0')}`,
        created_at: timestamp,
        updated_at: timestamp,
        revision: 1,
        creator_name: currentUser.name,
      }
      presets.push(preset)
      recordRevision(preset, 'CREATE', currentUser.email, timestamp)
      pushEvent('CREATE', currentUser.email, timestamp, auditView(preset))
      return respond(toResponse(preset), writeLatency)
    },
    editSkillPreset(skillPresetId: string, body: SkillPresetRequest) {
      if (!seed.isAdmin) return forbidden()
      const previous = findPreset(skillPresetId)
      if (!previous) return fail(404, `Skill preset ${skillPresetId} does not exist`)
      // The conflicts scenario plays a concurrent save once, on the Admins preset.
      if (scenario === 'conflicts' && previous.name === 'Admins' && !concurrentSaveDone) {
        concurrentSaveDone = true
        return fail(409, `Skill preset ${skillPresetId} was changed by someone else: reload it and try again`)
      }
      const state = toState(body)
      const rejection = checkWrite(state, skillPresetId)
      if (rejection) return rejection
      const timestamp = now()
      const preset: StoredPreset = { ...previous, ...state, updated_at: timestamp, revision: previous.revision + 1 }
      presets = presets.map((item) => (item.id === skillPresetId ? preset : item))
      recordRevision(preset, 'UPDATE', currentUser.email, timestamp)
      pushEvent('UPDATE', currentUser.email, timestamp, auditView(preset), auditView(previous))
      return respond(toResponse(preset), writeLatency)
    },
    deleteSkillPreset(skillPresetId: string) {
      if (!seed.isAdmin) return forbidden()
      const preset = findPreset(skillPresetId)
      if (!preset) return fail(404, `Skill preset ${skillPresetId} does not exist`)
      const timestamp = now()
      presets = presets.filter(({ id }) => id !== skillPresetId)
      recordRevision({ ...preset, revision: preset.revision + 1 }, 'DELETE', currentUser.email, timestamp)
      pushEvent('DELETE', currentUser.email, timestamp, { ...auditView(preset), security_review: null })
      return respond(undefined)
    },
    listSkillPresetRevisions(
      _organizationId: string,
      { skillPresetId, limit = 50 }: { skillPresetId?: string; limit?: number } = {}
    ) {
      if (!seed.isAdmin) return forbidden()
      const results = revisions
        .filter((revision) => !skillPresetId || revision.skill_preset_id === skillPresetId)
        .sort((a, b) => b.edited_at.localeCompare(a.edited_at) || b.revision - a.revision)
        .slice(0, Math.min(Math.max(limit, 1), 100))
      return respond(results)
    },
    getResolvedSkillPreset() {
      const { source, preset } = resolveFor(currentUser.id)
      const summary = (text?: string | null) =>
        text ? { approx_tokens: approxTokens(text), sha256: mockHash(text) } : null
      const manifest: SkillPresetManifestResponse = {
        source,
        skill_preset: preset
          ? {
              id: preset.id,
              name: preset.name,
              base: preset.base,
              revision: preset.revision,
              updated_at: preset.updated_at,
              team_context: summary(preset.team_context),
              skills: preset.skills.map((skill) => ({
                skill_name: skill.skill_name,
                mode: skill.mode,
                description: skill.description ?? null,
                content: summary(skill.content),
              })),
            }
          : null,
      }
      return respond(manifest)
    },
    getResolvedSkill(_organizationId: string, skillName: string, { purpose }: { purpose: SkillLoadPurpose }) {
      const { source, preset } = resolveFor(currentUser.id)
      const skill = preset?.skills.find(({ skill_name }) => skill_name === skillName)
      if (!skill && !isQoverySkillName(skillName)) return fail(404, `There is no skill '${skillName}' to load`)
      const response: SkillPresetResolvedSkillResponse = {
        source,
        skill_name: skillName,
        skill_preset: preset ? { id: preset.id, name: preset.name, revision: preset.revision } : null,
        mode: skill?.mode ?? null,
        description: skill?.description ?? null,
        content: skill?.content ?? null,
        content_sha256: skill?.content ? mockHash(skill.content) : null,
        team_context: preset?.team_context ?? null,
        team_context_sha256: preset?.team_context ? mockHash(preset.team_context) : null,
      }
      const change = {
        skill_name: skillName,
        source,
        skill_preset_id: preset?.id ?? null,
        skill_preset_name: preset?.name ?? null,
        revision: preset?.revision ?? null,
        mode: skill?.mode ?? null,
        content_sha256: response.content_sha256 ?? null,
        team_context_sha256: response.team_context_sha256 ?? null,
        from_cache: false,
      }
      // Same change shape for both. Only an agent's LOAD counts in usage.
      pushEvent(
        purpose === 'VIEW' ? OrganizationEventType.SKILL_VIEW : OrganizationEventType.SKILL_LOAD,
        currentUser.email,
        now(),
        change
      )
      if (purpose === 'LOAD') {
        loadRecords.push({
          timestamp: now(),
          user_sub: currentUser.id,
          user_name: currentUser.name,
          skill_name: skillName,
          skill_preset_id: preset?.id ?? null,
          skill_preset_name: preset?.name ?? null,
          from_cache: false,
          tokens: approxTokens(skill?.content) + approxTokens(preset?.team_context),
        })
      }
      return respond(response)
    },
    listAssignees() {
      return respond(seed.assignees)
    },
    /** Plays the DevOps Copilot service for its config and recurring task calls. Anything else answers 404. */
    async copilotRequest(method: string, url: string, body?: string) {
      const path = url.replace(/^https?:\/\/[^/]+/, '')
      if (method === 'get' && /\/organization\/[^/]+\/config$/.test(path)) {
        return respond({ org_config: { ...copilot }, role_configs: [] })
      }
      if (method === 'put' && /\/organization\/[^/]+\/config\/org$/.test(path)) {
        if (!seed.isAdmin) return forbidden()
        const request = (body ? JSON.parse(body) : {}) as { enabled?: boolean; read_only?: boolean; token_mode?: 'jwt' }
        if (request.enabled && !aiFeaturesOn) return fail(403, 'AI features are disabled for this organization')
        if (request.enabled && seed.copilotFailsOnce && !copilotFailedOnce) {
          copilotFailedOnce = true
          return fail(503, 'The Copilot service did not answer')
        }
        copilot.enabled = request.enabled ?? copilot.enabled
        copilot.read_only = request.read_only ?? copilot.read_only
        return respond({ org_config: { ...copilot } })
      }
      if (method === 'get' && /\/organization\/[^/]+\/recurring-tasks$/.test(path)) return respond({ tasks: [] })
      return fail(404, 'Not found')
    },
    listPolicyTokens() {
      if (!seed.isAdmin) return forbidden()
      return respond(policyTokens)
    },
    deletePolicyToken(policyTokenId: string) {
      if (!seed.isAdmin) return forbidden()
      policyTokens = policyTokens.filter(({ id }) => id !== policyTokenId)
      return respond(undefined)
    },
    aiFeaturesEnabled() {
      return respond(aiFeaturesOn)
    },
    enableAiFeatures() {
      if (!seed.isAdmin) return forbidden()
      aiFeaturesOn = true
      return respond(undefined)
    },
    getAgentActivity(_organizationId: string, params: AgentActivityQueryParams) {
      if (!seed.isAdmin) return forbidden()
      if (activityTimesOut(params)) return fail(503, ACTIVITY_TIMED_OUT_DETAIL)
      const invalid = agentActivityParamsError(params)
      if (invalid) return fail(400, invalid)
      return respond(aggregateAgentActivity(agentActions(), loadRecords, params))
    },
    getMyAgentActivity(_organizationId: string, params: AgentActivityQueryParams) {
      if (activityTimesOut(params)) return fail(503, ACTIVITY_TIMED_OUT_DETAIL)
      // /me ignores organization-wide actor filters and only shows the caller's actions and loads.
      const own = { ...params, actorKind: undefined, policyTokenId: undefined, userSub: currentUser.id }
      const invalid = agentActivityParamsError(own)
      if (invalid) return fail(400, invalid)
      const activity = aggregateAgentActivity(agentActions(), loadRecords, own)
      return respond({ ...activity, by_policy_token: [] })
    },
  }

  return Object.assign(api, {
    /** Test helper: every audit entry recorded so far, oldest first. */
    auditEvents: () => clone(events),
  })
}

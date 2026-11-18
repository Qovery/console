import {
  getSkillPresetErrorStatus,
  getSkillPresetFindings,
  isSkillPresetAiFeaturesOff,
  isSkillPresetConcurrentModification,
  isSkillPresetReviewUnavailable,
} from '../skill-presets.errors'
import { type SkillLoadChange, type SkillPresetRequest } from '../skill-presets.types'
import { MOCK_ROLE_IDS } from './mock-scenarios'
import { MOCK_MODEL_ONLY_SAMPLE, MOCK_UNSAFE_SAMPLE } from './mock-tools'
import { createSkillPresetsMockApi } from './skill-presets-mock-api'

const ORGANIZATION_ID = 'organization-1'

const request = (overrides: Partial<SkillPresetRequest> = {}): SkillPresetRequest => ({
  name: 'Release team',
  is_template: false,
  description: 'For release managers.',
  base: 'QOVERY_FULL',
  team_context: 'Deploy to staging first.',
  skills: [{ skill_name: 'qovery-deploy', mode: 'OVERLAY', content: 'Wait for the smoke tests.' }],
  assigned_to: { organization_default: false, role_ids: [], user_ids: [] },
  ...overrides,
})

describe('createSkillPresetsMockApi', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  const settle = async <T>(promise: Promise<T>) => {
    const settled = promise.then(
      (value) => ({ value, error: undefined }),
      (error: unknown) => ({ value: undefined, error })
    )
    await jest.runAllTimersAsync()
    return settled
  }

  it('serves the typical scenario with three presets in the documented shape', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { value: presets } = await settle(api.listSkillPresets(ORGANIZATION_ID))

    expect(presets).toHaveLength(4)
    expect(
      presets
        ?.filter(({ is_template }) => !is_template)
        .map(({ base }) => base)
        .sort()
    ).toEqual(['NONE', 'QOVERY_FULL', 'QOVERY_LEAN'])
    expect(presets?.[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        revision: expect.any(Number),
        assigned_to: expect.objectContaining({ organization_default: expect.any(Boolean) }),
      })
    )
  })

  it('starts empty in the empty scenario', async () => {
    const { value } = await settle(createSkillPresetsMockApi('empty').listSkillPresets(ORGANIZATION_ID))
    expect(value).toEqual([])
  })

  it('rejects unsafe content with 422 findings pointing at the field and the 1-based line', async () => {
    const api = createSkillPresetsMockApi('security-rejection')
    const { error } = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({
          team_context: `Our clusters are in eu-west-3.\n${MOCK_UNSAFE_SAMPLE}`,
          skills: [
            {
              skill_name: 'release-checklist',
              mode: 'ADD',
              description: 'Release checklist. Use when cutting a release.',
              content: 'See https://collector.example.net/notes',
            },
          ],
        })
      )
    )

    expect(getSkillPresetErrorStatus(error)).toBe(422)
    const findings = getSkillPresetFindings(error)
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'RULES', rule_id: 'dump-secrets', location: 'team context', line: 2 }),
        expect.objectContaining({
          source: 'MODEL',
          rule_id: 'data-exfiltration',
          location: 'team context',
          line: 6,
          reason: 'Asks the agent to send environment data to an outside address',
        }),
        expect.objectContaining({ rule_id: 'read-credentials', location: 'team context', line: 3 }),
        expect.objectContaining({ rule_id: 'override-instructions', location: 'team context', line: 4 }),
        expect.objectContaining({ rule_id: 'conceal-from-user', location: 'team context', line: 5 }),
        expect.objectContaining({
          rule_id: 'external-url',
          location: "content of skill 'release-checklist'",
          line: 1,
          reason: 'Links to collector.example.net, which is not an allowed host',
        }),
      ])
    )
  })

  it('lets protective negations and allowed hosts through', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { error } = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({ team_context: 'Never deploy without asking the user.\nDocs: https://www.qovery.com/docs' })
      )
    )
    expect(error).toBeUndefined()
  })

  it('answers 409 when a target already receives another preset', async () => {
    const api = createSkillPresetsMockApi('conflicts')
    const { error } = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({ assigned_to: { organization_default: false, role_ids: [MOCK_ROLE_IDS.admin], user_ids: [] } })
      )
    )
    expect(getSkillPresetErrorStatus(error)).toBe(409)
  })

  it('records a revision and an UPDATE audit entry with the previous state on edit', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { value: presets } = await settle(api.listSkillPresets(ORGANIZATION_ID))
    const preset = presets?.find(({ base }) => base === 'QOVERY_LEAN')
    if (!preset) throw new Error('missing preset')

    const { value: saved } = await settle(
      api.editSkillPreset(
        preset.id,
        request({ name: preset.name, base: 'QOVERY_LEAN', skills: [], assigned_to: preset.assigned_to })
      )
    )
    const { value: revisions } = await settle(
      api.listSkillPresetRevisions(ORGANIZATION_ID, { skillPresetId: preset.id })
    )

    expect(saved?.revision).toBe(preset.revision + 1)
    expect(revisions?.[0]).toEqual(expect.objectContaining({ revision: preset.revision + 1, change_type: 'UPDATE' }))
    const lastEvent = api.auditEvents().at(-1)
    expect(lastEvent?.event_type).toBe('UPDATE')
    expect(lastEvent?.sub_target_type).toBe('SKILL_PRESET')
    expect(JSON.parse(lastEvent?.original_change ?? '{}').revision).toBe(preset.revision)
  })

  it('keeps a DELETE revision after deleting a preset', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { value: presets } = await settle(api.listSkillPresets(ORGANIZATION_ID))
    const preset = presets?.[0]
    if (!preset) throw new Error('missing preset')

    await settle(api.deleteSkillPreset(preset.id))
    const { value: revisions } = await settle(
      api.listSkillPresetRevisions(ORGANIZATION_ID, { skillPresetId: preset.id })
    )
    const { value: remaining } = await settle(api.listSkillPresets(ORGANIZATION_ID))

    expect(revisions?.[0].change_type).toBe('DELETE')
    expect(remaining).toHaveLength(3)
  })

  it('pages skill loads as LOAD audit entries', async () => {
    const api = createSkillPresetsMockApi('large')
    const { value: firstPage } = await settle(api.listSkillLoads(ORGANIZATION_ID, { pageSize: 50 }))

    expect(firstPage?.events).toHaveLength(50)
    expect(firstPage?.links?.next).toContain('continueToken=50')
    const load = JSON.parse(firstPage?.events?.[0].change ?? '{}') as SkillLoadChange
    expect(load).toEqual(
      expect.objectContaining({
        skill_name: expect.any(String),
        from_cache: expect.any(Boolean),
        source: expect.any(String),
      })
    )
  })

  it('aggregates usage with totals, timeline and breakdowns', async () => {
    const api = createSkillPresetsMockApi('typical')
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 3_600_000)
    const { value: usage } = await settle(
      api.getSkillPresetUsage(ORGANIZATION_ID, { from: from.toISOString(), to: to.toISOString(), bucket: 'DAY' })
    )

    expect(usage?.totals.loads).toBe(36)
    expect(usage?.timeline.reduce((sum, { loads }) => sum + loads, 0)).toBe(36)
    expect(usage?.by_skill[0]).toEqual(
      expect.objectContaining({ skill_name: expect.any(String), last_loaded_at: expect.any(String) })
    )
    expect(usage?.by_member.length).toBeGreaterThan(0)
  })

  it('answers 403 to a member on admin endpoints but serves their manifest', async () => {
    const api = createSkillPresetsMockApi('member')
    const { error } = await settle(api.listSkillPresets(ORGANIZATION_ID))
    const { value: manifest } = await settle(api.getResolvedSkillPreset(ORGANIZATION_ID))

    expect(getSkillPresetErrorStatus(error)).toBe(403)
    expect(manifest?.source).toBe('ORGANIZATION')
    expect(manifest?.skill_preset?.team_context?.sha256).toHaveLength(64)
  })

  it('fails the list once in the errors scenario, then loads on retry', async () => {
    const api = createSkillPresetsMockApi('errors')
    const first = await settle(api.listSkillPresets(ORGANIZATION_ID))
    const retry = await settle(api.listSkillPresets(ORGANIZATION_ID))

    expect(getSkillPresetErrorStatus(first.error)).toBe(500)
    expect(retry.error).toBeUndefined()
    expect(retry.value?.length).toBeGreaterThan(0)
  })

  it.each([
    'empty',
    'typical',
    'conflicts',
    'security-rejection',
    'model-rejection',
    'large',
    'slow',
    'ai-features-off',
    'review-unavailable',
  ] as const)('never answers an error on reads in the %s scenario', async (scenario) => {
    const api = createSkillPresetsMockApi(scenario)
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 3_600_000)
    for (let attempt = 0; attempt < 3; attempt++) {
      const results = await Promise.all([
        settle(api.listSkillPresets(ORGANIZATION_ID)),
        settle(api.listSkillPresetRevisions(ORGANIZATION_ID)),
        settle(api.listSkillLoads(ORGANIZATION_ID, { pageSize: 30 })),
        settle(
          api.getSkillPresetUsage(ORGANIZATION_ID, { from: from.toISOString(), to: to.toISOString(), bucket: 'DAY' })
        ),
        settle(api.getResolvedSkillPreset(ORGANIZATION_ID)),
        settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy', { purpose: 'VIEW' })),
        settle(api.listAssignees()),
      ])
      expect(results.map(({ error }) => error)).toEqual(results.map(() => undefined))
    }
  })

  it('resolves no preset for the member in the member-no-preset scenario', async () => {
    const api = createSkillPresetsMockApi('member-no-preset')
    const { value: manifest } = await settle(api.getResolvedSkillPreset(ORGANIZATION_ID))
    const { value: skill } = await settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy', { purpose: 'VIEW' }))

    expect(manifest).toEqual({ source: 'QOVERY_DEFAULT', skill_preset: null })
    expect(skill).toEqual(expect.objectContaining({ source: 'QOVERY_DEFAULT', mode: null, team_context: null }))
  })

  it('serves the full text of one skill with its hashes', async () => {
    const api = createSkillPresetsMockApi('member')
    const { value } = await settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy', { purpose: 'VIEW' }))
    expect(value).toEqual(
      expect.objectContaining({
        mode: 'OVERLAY',
        content: expect.stringContaining('staging'),
        content_sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        team_context: expect.stringContaining('How we run Qovery'),
      })
    )
  })

  it('filters templates and refuses an assigned template', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { value: templates } = await settle(api.listSkillPresets(ORGANIZATION_ID, { isTemplate: true }))
    const { error } = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({ is_template: true, assigned_to: { organization_default: true, role_ids: [], user_ids: [] } })
      )
    )

    expect(templates?.map(({ name }) => name)).toEqual(['New team starter'])
    expect(getSkillPresetErrorStatus(error)).toBe(400)
  })

  it('refuses content on DISABLE and a description on OVERLAY', async () => {
    const api = createSkillPresetsMockApi('typical')
    const disable = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({ skills: [{ skill_name: 'qovery-assess', mode: 'DISABLE', content: 'x' }] })
      )
    )
    const overlay = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({ skills: [{ skill_name: 'qovery-deploy', mode: 'OVERLAY', description: 'x', content: 'y' }] })
      )
    )
    expect(getSkillPresetErrorStatus(disable.error)).toBe(400)
    expect(getSkillPresetErrorStatus(overlay.error)).toBe(400)
  })

  it('answers 404 when deleting a preset twice, and 409 on a concurrent save in the conflicts scenario', async () => {
    const api = createSkillPresetsMockApi('conflicts')
    const { value: presets } = await settle(api.listSkillPresets(ORGANIZATION_ID))
    const admins = presets?.find(({ name }) => name === 'Admins')
    if (!admins) throw new Error('missing preset')

    const concurrent = await settle(
      api.editSkillPreset(admins.id, request({ name: 'Admins', assigned_to: admins.assigned_to }))
    )
    expect(isSkillPresetConcurrentModification(concurrent.error)).toBe(true)

    await settle(api.deleteSkillPreset(admins.id))
    const again = await settle(api.deleteSkillPreset(admins.id))
    expect(getSkillPresetErrorStatus(again.error)).toBe(404)
  })

  it('blocks a reworded line by the model review alone, and keeps a trace without the text', async () => {
    const api = createSkillPresetsMockApi('model-rejection')
    const { error } = await settle(
      api.createSkillPreset(ORGANIZATION_ID, request({ team_context: MOCK_MODEL_ONLY_SAMPLE }))
    )

    expect(getSkillPresetFindings(error)).toEqual([
      expect.objectContaining({ source: 'MODEL', rule_id: 'data-exfiltration', location: 'team context', line: 1 }),
    ])
    const event = api.auditEvents().at(-1)
    const trace = JSON.parse(event?.change ?? '{}')
    expect(event?.event_type).toBe('REJECTED')
    expect(event?.sub_target_type).toBe('SKILL_PRESET')
    expect(trace).toEqual(
      expect.objectContaining({
        attempted_change: 'CREATE',
        skill_preset_id: null,
        team_context_sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        findings: [expect.objectContaining({ source: 'MODEL', rule_id: 'data-exfiltration' })],
      })
    )
    expect(JSON.stringify(trace)).not.toContain('collector.example.net')
  })

  it('answers 503 once when the review is unavailable, then saves the same draft', async () => {
    const api = createSkillPresetsMockApi('review-unavailable')
    const first = await settle(api.createSkillPreset(ORGANIZATION_ID, request()))
    const retry = await settle(api.createSkillPreset(ORGANIZATION_ID, request()))

    expect(isSkillPresetReviewUnavailable(first.error)).toBe(true)
    expect(retry.value?.name).toBe('Release team')
  })

  it('refuses writes with 403 when AI features are off, but keeps reads and deletes', async () => {
    const api = createSkillPresetsMockApi('ai-features-off')
    const { error } = await settle(api.createSkillPreset(ORGANIZATION_ID, request()))
    const { value } = await settle(api.listSkillPresets(ORGANIZATION_ID))
    const deleted = await settle(api.deleteSkillPreset(value?.[0]?.id ?? ''))

    expect(getSkillPresetErrorStatus(error)).toBe(403)
    expect(isSkillPresetAiFeaturesOff(error)).toBe(true)
    expect(value?.length).toBeGreaterThan(0)
    expect(deleted.error).toBeUndefined()
  })

  it('refuses more than 200,000 characters of text in total', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { error } = await settle(
      api.createSkillPreset(
        ORGANIZATION_ID,
        request({
          team_context: 'x'.repeat(30000),
          skills: Array.from({ length: 3 }, (_, index) => ({
            skill_name: `runbook-${index}`,
            mode: 'ADD' as const,
            description: 'Runbook. Use when on call.',
            content: 'y'.repeat(60000),
          })),
        })
      )
    )
    expect(getSkillPresetErrorStatus(error)).toBe(400)
  })

  it('records the review on every saved revision', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { value } = await settle(api.listSkillPresetRevisions(ORGANIZATION_ID))
    expect(value?.[0].security_review).toEqual({
      verdict: 'ALLOW',
      model: expect.any(String),
      prompt_version: 'v1',
      findings: [],
    })
    await settle(api.deleteSkillPreset(value?.[0]?.skill_preset_id ?? ''))
    const { value: afterDelete } = await settle(api.listSkillPresetRevisions(ORGANIZATION_ID))
    expect(afterDelete?.[0]).toEqual(expect.objectContaining({ change_type: 'DELETE', security_review: null }))
  })

  it('turns AI features on in the ai-features-off scenario, then saves', async () => {
    const api = createSkillPresetsMockApi('ai-features-off')
    expect((await settle(api.aiFeaturesEnabled())).value).toBe(false)

    await settle(api.enableAiFeatures(ORGANIZATION_ID))

    expect((await settle(api.aiFeaturesEnabled())).value).toBe(true)
    expect((await settle(api.createSkillPreset(ORGANIZATION_ID, request()))).error).toBeUndefined()
  })

  it('refuses to turn AI features on for a member', async () => {
    const { error } = await settle(createSkillPresetsMockApi('member').enableAiFeatures(ORGANIZATION_ID))
    expect(getSkillPresetErrorStatus(error)).toBe(403)
  })

  it('audits a read for display as VIEW and keeps it out of usage and skill loads', async () => {
    const api = createSkillPresetsMockApi('typical')
    const to = new Date(Date.now() + 60_000)
    const from = new Date(to.getTime() - 30 * 24 * 3_600_000)
    const usage = () =>
      settle(
        api.getSkillPresetUsage(ORGANIZATION_ID, { from: from.toISOString(), to: to.toISOString(), bucket: 'DAY' })
      )
    const before = (await usage()).value?.totals.loads

    await settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy', { purpose: 'VIEW' }))
    const event = api.auditEvents().at(-1)
    expect(event?.event_type).toBe('VIEW')
    expect(JSON.parse(event?.change ?? '{}')).toEqual(
      expect.objectContaining({ skill_name: 'qovery-deploy', from_cache: false })
    )
    expect((await usage()).value?.totals.loads).toBe(before)
    const { value: loads } = await settle(api.listSkillLoads(ORGANIZATION_ID, { pageSize: 100 }))
    expect(loads?.events?.every(({ event_type }) => (event_type as string) === 'LOAD')).toBe(true)

    await settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy', { purpose: 'LOAD' }))
    expect(api.auditEvents().at(-1)?.event_type).toBe('LOAD')
    expect((await usage()).value?.totals.loads).toBe((before ?? 0) + 1)
  })

  describe('agent activity', () => {
    const range = () => {
      const to = new Date(Date.now() + 60_000)
      return {
        from: new Date(to.getTime() - 30 * 24 * 3_600_000).toISOString(),
        to: to.toISOString(),
        bucket: 'DAY' as const,
      }
    }

    it('links actions to the skills that led to them, with denials in production', async () => {
      const { value } = await settle(
        createSkillPresetsMockApi('agent-activity').getAgentActivity(ORGANIZATION_ID, range())
      )

      expect(value?.coverage).toEqual({
        sources: ['SKILL_LOAD', 'SKILL_API_ACTION', 'MCP_TOOL_CALL', 'POLICY_DENIAL', 'POLICY_TOKEN_API_ACTION'],
        note: expect.stringContaining('Only actions taken through Qovery'),
      })
      expect(value?.bucket).toBe('DAY')
      expect(value?.totals.actions).toBeGreaterThan(50)
      expect(value?.totals.denials).toBe(14)
      expect(value?.by_skill.find(({ skill_name }) => skill_name === 'qovery-deploy')?.actions).toBeGreaterThan(0)
      expect(value?.by_skill.some(({ skill_name }) => skill_name === null)).toBe(true)
      expect(value?.recent.length).toBeLessThanOrEqual(100)
      expect(value?.recent.some(({ origin, event }) => origin === 'MCP_TOOL_CALL' && event === 'MCP')).toBe(true)
      expect(
        value?.recent.some(
          ({ origin, outcome, event, environment_name }) =>
            origin === 'POLICY_DENIAL' &&
            outcome === 'DENIED' &&
            event === 'POLICY_FAILED' &&
            environment_name === 'payments-production'
        )
      ).toBe(true)
    })

    it('counts allowed actions and denials apart, as q-core does', async () => {
      const { value } = await settle(
        createSkillPresetsMockApi('agent-activity').getAgentActivity(ORGANIZATION_ID, range())
      )
      const allowed = value?.recent.filter(({ outcome }) => outcome === 'ALLOWED') ?? []
      const sum = (key: 'actions' | 'denials') => value?.timeline.reduce((total, point) => total + point[key], 0)

      expect(sum('actions')).toBe(value?.totals.actions)
      expect(sum('denials')).toBe(value?.totals.denials)
      expect(allowed.every(({ origin }) => origin !== 'POLICY_DENIAL')).toBe(true)
      expect(value?.actions_by_type.reduce((total, row) => total + row.count, 0)).toBe(
        (value?.totals.actions ?? 0) + (value?.totals.denials ?? 0)
      )
    })

    it('breaks policy tokens down, a deleted one and older unnamed records included', async () => {
      const { value } = await settle(
        createSkillPresetsMockApi('agent-activity').getAgentActivity(ORGANIZATION_ID, range())
      )
      const tokens = value?.by_policy_token ?? []

      expect(tokens.map(({ token_name }) => token_name ?? 'legacy').sort()).toEqual([
        'ci-deployer',
        'cleanup-bot',
        'legacy',
        'review-agent',
      ])
      expect(tokens.find(({ token_name }) => token_name === 'cleanup-bot')).toMatchObject({
        deleted: true,
        denials: 1,
        role_name: 'devops',
      })
      expect(tokens.find(({ policy_token_id }) => policy_token_id === null)).toMatchObject({ token_name: null })
      const ciDeployer = tokens.find(({ token_name }) => token_name === 'ci-deployer')
      expect(ciDeployer?.top_actions.length).toBeLessThanOrEqual(3)
      expect(ciDeployer?.timeline.every(({ actions, denials }) => actions + denials > 0)).toBe(true)
      expect(value?.totals.policy_tokens).toBe(4)
      // by_member still lists tokens, with their kind, and totals.members counts them, as in q-core.
      expect(value?.by_member.filter(({ actor_kind }) => actor_kind === 'POLICY_TOKEN').length).toBe(4)
      expect(value?.coverage.sources).toContain('POLICY_TOKEN_API_ACTION')
    })

    it('filters on actor kind, a token, the outcome and the source', async () => {
      const api = createSkillPresetsMockApi('agent-activity')
      const ciDeployer = '3f1c9a2e-0000-4000-8000-00000000c1d0'
      const { value: tokens } = await settle(
        api.getAgentActivity(ORGANIZATION_ID, { ...range(), actorType: 'POLICY_TOKEN' })
      )
      expect(tokens?.recent.every(({ actor_kind }) => actor_kind === 'POLICY_TOKEN')).toBe(true)
      expect(tokens?.totals.skill_loads).toBe(0)

      const { value: one } = await settle(
        api.getAgentActivity(ORGANIZATION_ID, { ...range(), policyTokenId: ciDeployer })
      )
      expect(new Set(one?.recent.map(({ policy_token_id }) => policy_token_id))).toEqual(new Set([ciDeployer]))
      expect(one?.by_policy_token.map(({ token_name }) => token_name)).toEqual(['ci-deployer'])

      const { value: denied } = await settle(api.getAgentActivity(ORGANIZATION_ID, { ...range(), outcome: 'DENIED' }))
      expect(denied?.totals.actions).toBe(0)

      const { value: calls } = await settle(
        api.getAgentActivity(ORGANIZATION_ID, { ...range(), source: 'POLICY_TOKEN_API_ACTION' })
      )
      expect(calls?.recent.every(({ origin }) => origin === 'POLICY_TOKEN_API_ACTION')).toBe(true)
      expect(calls?.recent.length).toBeGreaterThan(0)
    })

    it('refuses the filter combinations q-core refuses', async () => {
      const api = createSkillPresetsMockApi('agent-activity')
      for (const params of [
        { ...range(), policyTokenId: 'not-a-uuid' },
        { ...range(), policyTokenId: '3f1c9a2e-0000-4000-8000-00000000c1d0', actorType: 'MEMBER' as const },
        { ...range(), userSub: 'auth0|mock-jordan', actorType: 'POLICY_TOKEN' as const },
      ]) {
        const { error } = await settle(api.getAgentActivity(ORGANIZATION_ID, params))
        expect(getSkillPresetErrorStatus(error)).toBe(400)
      }
    })

    it('never lists policy tokens on /me, and ignores the actor filters there', async () => {
      const { value } = await settle(
        createSkillPresetsMockApi('member').getMyAgentActivity(ORGANIZATION_ID, {
          ...range(),
          actorType: 'POLICY_TOKEN',
        } as never)
      )
      expect(value?.by_policy_token).toEqual([])
      expect(value?.recent.length).toBeGreaterThan(0)
    })

    it('refuses an invalid range, bucket or skill name with a 400', async () => {
      const api = createSkillPresetsMockApi('agent-activity')
      const to = new Date().toISOString()
      const tooLong = new Date(Date.now() - 91 * 24 * 3_600_000).toISOString()

      for (const params of [
        { from: to, to: tooLong, bucket: 'DAY' as const },
        { from: tooLong, to, bucket: 'DAY' as const },
        { ...range(), bucket: 'WEEK' as unknown as 'DAY' },
        { ...range(), skillName: 'Not A Skill!' },
      ]) {
        const { error } = await settle(api.getAgentActivity(ORGANIZATION_ID, params))
        expect(getSkillPresetErrorStatus(error)).toBe(400)
      }
    })

    it('filters on a member and a skill', async () => {
      const api = createSkillPresetsMockApi('agent-activity')
      const { value } = await settle(
        api.getAgentActivity(ORGANIZATION_ID, { ...range(), userSub: 'auth0|mock-jordan' })
      )
      expect(value?.by_member.map(({ user_sub }) => user_sub)).toEqual(['auth0|mock-jordan'])
      const { value: bySkill } = await settle(
        api.getAgentActivity(ORGANIZATION_ID, { ...range(), skillName: 'qovery-deploy' })
      )
      expect(bySkill?.recent.every(({ skill_name }) => skill_name === 'qovery-deploy')).toBe(true)
    })

    it('plays the three Agents states', async () => {
      const empty = createSkillPresetsMockApi('agent-experience-empty')
      const { value: emptyActivity } = await settle(empty.getAgentActivity(ORGANIZATION_ID, range()))
      expect(emptyActivity?.totals).toEqual({ skill_loads: 0, actions: 0, denials: 0, members: 0, policy_tokens: 0 })
      expect((await settle(empty.listPolicyTokens())).value).toEqual([])
      // New organizations have AI features on.
      expect((await settle(empty.aiFeaturesEnabled())).value).toBe(true)

      const partial = createSkillPresetsMockApi('agent-experience-partial')
      const { value: partialActivity } = await settle(partial.getAgentActivity(ORGANIZATION_ID, range()))
      expect(partialActivity?.totals.skill_loads).toBeGreaterThan(0)
      expect(partialActivity?.totals.denials).toBe(0)
      expect(partialActivity?.by_member.some(({ user_sub }) => user_sub === null)).toBe(false)
      expect((await settle(partial.listSkillPresets(ORGANIZATION_ID, { isTemplate: false }))).value).toEqual([])

      const active = createSkillPresetsMockApi('agent-experience-active')
      const { value: tokens } = await settle(active.listPolicyTokens())
      expect(tokens?.map(({ name }) => name)).toEqual(['ci-deployer', 'review-agent'])
    })

    it('plays the Copilot config: off until AI features and then the Copilot are turned on', async () => {
      const api = createSkillPresetsMockApi('ai-features-off')
      const config = async () =>
        (
          (await settle(api.copilotRequest('get', 'https://copilot.example/organization/o/config'))).value as {
            org_config: { enabled: boolean }
          }
        ).org_config.enabled
      const turnOn = () =>
        settle(
          api.copilotRequest('put', '/organization/o/config/org', JSON.stringify({ enabled: true, read_only: true }))
        )

      expect(await config()).toBe(false)
      expect(getSkillPresetErrorStatus((await turnOn()).error)).toBe(403)
      await settle(api.enableAiFeatures(ORGANIZATION_ID))
      await turnOn()
      expect(await config()).toBe(true)
      expect(getSkillPresetErrorStatus((await settle(api.copilotRequest('get', '/other'))).error)).toBe(404)
    })

    it('is empty in the agent-activity-empty scenario', async () => {
      const { value } = await settle(
        createSkillPresetsMockApi('agent-activity-empty').getAgentActivity(ORGANIZATION_ID, range())
      )
      expect(value?.totals).toEqual({ skill_loads: 0, actions: 0, denials: 0, members: 0, policy_tokens: 0 })
      expect(value?.recent).toEqual([])
    })

    it('shows a member only their own activity, and refuses them the organization view', async () => {
      const api = createSkillPresetsMockApi('member')
      const { value } = await settle(api.getMyAgentActivity(ORGANIZATION_ID, range()))
      const { error } = await settle(api.getAgentActivity(ORGANIZATION_ID, range()))

      expect(new Set(value?.recent.map(({ user_sub }) => user_sub))).toEqual(new Set(['auth0|mock-taylor']))
      expect(value?.by_member.every(({ user_sub }) => user_sub === 'auth0|mock-taylor')).toBe(true)
      expect(getSkillPresetErrorStatus(error)).toBe(403)
    })
  })
})

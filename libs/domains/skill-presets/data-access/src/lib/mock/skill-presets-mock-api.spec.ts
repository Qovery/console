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
        settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy')),
        settle(api.listAssignees()),
      ])
      expect(results.map(({ error }) => error)).toEqual(results.map(() => undefined))
    }
  })

  it('resolves no preset for the member in the member-no-preset scenario', async () => {
    const api = createSkillPresetsMockApi('member-no-preset')
    const { value: manifest } = await settle(api.getResolvedSkillPreset(ORGANIZATION_ID))
    const { value: skill } = await settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy'))

    expect(manifest).toEqual({ source: 'QOVERY_DEFAULT', skill_preset: null })
    expect(skill).toEqual(expect.objectContaining({ source: 'QOVERY_DEFAULT', mode: null, team_context: null }))
  })

  it('serves the full text of one skill with its hashes', async () => {
    const api = createSkillPresetsMockApi('member')
    const { value } = await settle(api.getResolvedSkill(ORGANIZATION_ID, 'qovery-deploy'))
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
    const trace = JSON.parse(api.auditEvents().at(-1)?.change ?? '{}')
    expect(trace.review_verdict).toBe('BLOCK')
    expect(JSON.stringify(trace)).not.toContain('collector.example.net')
  })

  it('answers 503 once when the review is unavailable, then saves the same draft', async () => {
    const api = createSkillPresetsMockApi('review-unavailable')
    const first = await settle(api.createSkillPreset(ORGANIZATION_ID, request()))
    const retry = await settle(api.createSkillPreset(ORGANIZATION_ID, request()))

    expect(isSkillPresetReviewUnavailable(first.error)).toBe(true)
    expect(retry.value?.name).toBe('Release team')
  })

  it('refuses writes when AI features are off, but keeps reads', async () => {
    const api = createSkillPresetsMockApi('ai-features-off')
    const { error } = await settle(api.createSkillPreset(ORGANIZATION_ID, request()))
    const { value } = await settle(api.listSkillPresets(ORGANIZATION_ID))

    expect(isSkillPresetAiFeaturesOff(error)).toBe(true)
    expect(value?.length).toBeGreaterThan(0)
  })

  it('records the review on every saved revision', async () => {
    const api = createSkillPresetsMockApi('typical')
    const { value } = await settle(api.listSkillPresetRevisions(ORGANIZATION_ID))
    expect(value?.[0]).toEqual(
      expect.objectContaining({
        review_verdict: 'ALLOW',
        review_model: expect.any(String),
        review_prompt_version: 'v1',
      })
    )
  })
})

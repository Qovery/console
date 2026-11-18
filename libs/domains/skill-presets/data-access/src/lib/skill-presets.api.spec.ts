import axios from 'axios'
import { skillPresetsApi } from './skill-presets.api'
import { buildSkillPresetApiError, getSkillPresetErrorStatus } from './skill-presets.errors'
import { mutations, skillPresets } from './skill-presets.queries'

// The HTTP path, with the mock off: requests are checked at the axios boundary.
jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: undefined,
}))
jest.mock('axios', () => {
  const instance = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() }
  return { __esModule: true, default: instance, ...instance }
})

const mockGetOrganizationEvents = jest.fn()
const mockEditOrganizationAiFeatures = jest.fn()
jest.mock('qovery-typescript-axios', () => ({
  ...jest.requireActual('qovery-typescript-axios'),
  // The API module builds these clients when it loads: the methods call through to the mocks later.
  OrganizationEventApi: function OrganizationEventApi() {
    return { getOrganizationEvents: (...args: unknown[]) => mockGetOrganizationEvents(...args) }
  },
  OrganizationMainCallsApi: function OrganizationMainCallsApi() {
    return { editOrganizationAiFeatures: (...args: unknown[]) => mockEditOrganizationAiFeatures(...args) }
  },
}))

const http = jest.mocked(axios)
const ORG = 'organization-1'
const PRESET = 'preset-1'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('skill presets API, over HTTP', () => {
  it('lists presets with the template filter and returns the results', async () => {
    http.get.mockResolvedValue({ data: { results: [{ id: PRESET }] } })
    await expect(skillPresetsApi.listSkillPresets(ORG, { isTemplate: false })).resolves.toEqual([{ id: PRESET }])
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset`, { params: { isTemplate: false } })
  })

  it('reads, creates, edits and deletes a preset on its own paths', async () => {
    const body = { name: 'Backend' } as never
    http.get.mockResolvedValue({ data: { id: PRESET } })
    http.post.mockResolvedValue({ data: { id: PRESET } })
    http.put.mockResolvedValue({ data: { id: PRESET, revision: 2 } })
    http.delete.mockResolvedValue({ data: undefined })

    await skillPresetsApi.getSkillPreset(PRESET)
    await skillPresetsApi.createSkillPreset(ORG, body)
    await expect(skillPresetsApi.editSkillPreset(PRESET, body)).resolves.toEqual({ id: PRESET, revision: 2 })
    await skillPresetsApi.deleteSkillPreset(PRESET)

    expect(http.get).toHaveBeenCalledWith(`/skillPreset/${PRESET}`)
    expect(http.post).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset`, body)
    expect(http.put).toHaveBeenCalledWith(`/skillPreset/${PRESET}`, body)
    expect(http.delete).toHaveBeenCalledWith(`/skillPreset/${PRESET}`)
  })

  it('lists revisions for one preset with a limit', async () => {
    http.get.mockResolvedValue({ data: { results: [] } })
    await skillPresetsApi.listSkillPresetRevisions(ORG, { skillPresetId: PRESET, limit: 1 })
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset/revision`, {
      params: { skillPresetId: PRESET, limit: 1 },
    })
  })

  it('reads what an agent receives, and a skill for display only', async () => {
    http.get.mockResolvedValue({ data: {} })
    await skillPresetsApi.getResolvedSkillPreset(ORG)
    await skillPresetsApi.getResolvedSkill(ORG, 'qovery deploy', { purpose: 'VIEW' })
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset/resolved`)
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset/resolved/skill/qovery%20deploy`, {
      params: { purpose: 'VIEW' },
    })
  })

  it('reads the organization activity, the caller’s own activity and the usage', async () => {
    http.get.mockResolvedValue({ data: { totals: {} } })
    const params = { from: 'a', to: 'b', bucket: 'DAY' } as never
    await skillPresetsApi.getAgentActivity(ORG, params)
    await skillPresetsApi.getMyAgentActivity(ORG, params)
    await skillPresetsApi.getSkillPresetUsage(ORG, params)
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/agentActivity`, { params })
    // The actor filter goes out as actorKind.
    await skillPresetsApi.getAgentActivity(ORG, { ...(params as object), actorKind: 'POLICY_TOKEN' } as never)
    expect(http.get).toHaveBeenLastCalledWith(`/organization/${ORG}/agentActivity`, {
      params: expect.objectContaining({ actorKind: 'POLICY_TOKEN' }),
    })
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/agentActivity/me`, { params })
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset/usage`, { params })
  })

  it('reads skill loads from the audit logs, filtered on SKILL_LOAD and SKILL_PRESET, with its cursors', async () => {
    mockGetOrganizationEvents.mockResolvedValue({ data: { events: [] } })
    await skillPresetsApi.listSkillLoads(ORG, { pageSize: 10, continueToken: 'next' })
    expect(mockGetOrganizationEvents).toHaveBeenCalledWith(
      ORG,
      10,
      undefined,
      undefined,
      'next',
      undefined,
      'SKILL_LOAD',
      undefined,
      undefined,
      'SKILL_PRESET'
    )
  })

  it('turns AI features on with the organization endpoint', async () => {
    mockEditOrganizationAiFeatures.mockResolvedValue({ data: {} })
    await mutations.enableAiFeatures({ organizationId: ORG })
    expect(mockEditOrganizationAiFeatures).toHaveBeenCalledWith(ORG, { enabled: true })
  })

  it.each([403, 409, 422, 503])('passes a %i answer on to the caller', async (status) => {
    http.put.mockRejectedValue(buildSkillPresetApiError(status, 'refused'))
    const error = await skillPresetsApi.editSkillPreset(PRESET, {} as never).catch((e: unknown) => e)
    expect(getSkillPresetErrorStatus(error)).toBe(status)
  })

  it('counts deleting a preset that is already gone (404) as done, and nothing else', async () => {
    http.delete.mockRejectedValueOnce(buildSkillPresetApiError(404, 'not found'))
    await expect(mutations.deleteSkillPreset({ organizationId: ORG, skillPresetId: PRESET })).resolves.toBeUndefined()

    http.delete.mockRejectedValueOnce(buildSkillPresetApiError(403, 'forbidden'))
    await expect(mutations.deleteSkillPreset({ organizationId: ORG, skillPresetId: PRESET })).rejects.toMatchObject({
      response: { status: 403 },
    })
  })
})

describe('skill presets query keys', () => {
  it('keys each query by its organization and parameters, so caches never mix', () => {
    expect(skillPresets.list({ organizationId: ORG }).queryKey).toEqual(['skillPresets', 'list', ORG, 'all'])
    expect(skillPresets.list({ organizationId: ORG, isTemplate: true }).queryKey).toEqual([
      'skillPresets',
      'list',
      ORG,
      true,
    ])
    expect(skillPresets.revisions({ organizationId: ORG }).queryKey).toContain('all')
    expect(skillPresets.resolvedSkill({ organizationId: ORG, skillName: 'qovery' }).queryKey).toEqual([
      'skillPresets',
      'resolvedSkill',
      ORG,
      'qovery',
    ])
  })

  it('fetches through the API module', async () => {
    http.get.mockResolvedValue({ data: { results: [{ id: PRESET }] } })
    await expect(skillPresets.list({ organizationId: ORG, isTemplate: false }).queryFn({} as never)).resolves.toEqual([
      { id: PRESET },
    ])
    http.get.mockResolvedValue({ data: { id: PRESET } })
    await skillPresets.details({ skillPresetId: PRESET }).queryFn({} as never)
    await skillPresets.resolved({ organizationId: ORG }).queryFn({} as never)
    expect(http.get).toHaveBeenCalledWith(`/skillPreset/${PRESET}`)
    expect(http.get).toHaveBeenCalledWith(`/organization/${ORG}/skillPreset/resolved`)
  })

  it('refuses the mock-only queries outside mock mode', async () => {
    await expect(skillPresets.mockPolicyTokens({ organizationId: ORG }).queryFn({} as never)).rejects.toThrow(
      'The skill presets mock is not active'
    )
    await expect(skillPresets.mockAssignees({ organizationId: ORG }).queryFn({} as never)).rejects.toThrow(
      'The skill presets mock is not active'
    )
  })
})

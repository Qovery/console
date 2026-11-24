import axios from 'axios'
import { getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/util'
import { mutations, skillPresets } from './domains-skill-presets-data-access'

jest.mock('axios', () => ({
  __esModule: true,
  default: { defaults: { baseURL: 'https://api.qovery.com' }, request: jest.fn() },
}))

const request = jest.mocked(axios.request)
const requestMatching = (method: string, url: string, body?: object) =>
  expect.objectContaining({ method, url, ...(body && { data: JSON.stringify(body) }) })

const ORG = 'organization-1'
const PRESET = 'preset-1'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('skill preset queries and mutations, over HTTP', () => {
  it('lists presets with the template filter and returns the results', async () => {
    request.mockResolvedValue({ data: { results: [{ id: PRESET }] } })
    await expect(skillPresets.list({ organizationId: ORG, isTemplate: false }).queryFn({} as never)).resolves.toEqual([
      { id: PRESET },
    ])
    expect(request).toHaveBeenCalledWith(requestMatching('GET', `/organization/${ORG}/skillPreset?isTemplate=false`))
  })

  it('reads, creates, edits and deletes a preset on its own paths', async () => {
    const body = { name: 'Backend' }
    request
      .mockResolvedValueOnce({ data: { id: PRESET } })
      .mockResolvedValueOnce({ data: { id: PRESET } })
      .mockResolvedValueOnce({ data: { id: PRESET, revision: 2 } })
      .mockResolvedValueOnce({ data: undefined })

    await skillPresets.details({ skillPresetId: PRESET }).queryFn({} as never)
    await mutations.createSkillPreset({ organizationId: ORG, body })
    await expect(mutations.editSkillPreset({ organizationId: ORG, skillPresetId: PRESET, body })).resolves.toEqual({
      id: PRESET,
      revision: 2,
    })
    await mutations.deleteSkillPreset({ organizationId: ORG, skillPresetId: PRESET })

    expect(request).toHaveBeenCalledWith(requestMatching('GET', `/skillPreset/${PRESET}`))
    expect(request).toHaveBeenCalledWith(requestMatching('POST', `/organization/${ORG}/skillPreset`, body))
    expect(request).toHaveBeenCalledWith(requestMatching('PUT', `/skillPreset/${PRESET}`, body))
    expect(request).toHaveBeenCalledWith(requestMatching('DELETE', `/skillPreset/${PRESET}`))
  })

  it('lists revisions for one preset with a limit', async () => {
    request.mockResolvedValue({ data: { results: [] } })
    await skillPresets.revisions({ organizationId: ORG, skillPresetId: PRESET, limit: 1 }).queryFn({} as never)
    expect(request).toHaveBeenCalledWith(
      requestMatching('GET', `/organization/${ORG}/skillPreset/revision?skillPresetId=${PRESET}&limit=1`)
    )
  })

  it('reads what an agent receives, and a skill for display only', async () => {
    request.mockResolvedValue({ data: {} })
    await skillPresets.resolved({ organizationId: ORG }).queryFn({} as never)
    await skillPresets.resolvedSkill({ organizationId: ORG, skillName: 'qovery deploy' }).queryFn({} as never)
    expect(request).toHaveBeenCalledWith(requestMatching('GET', `/organization/${ORG}/skillPreset/resolved`))
    expect(request).toHaveBeenCalledWith(
      requestMatching('GET', `/organization/${ORG}/skillPreset/resolved/skill/qovery%20deploy?purpose=VIEW`)
    )
  })

  it('reads the organization activity and the caller’s own activity', async () => {
    request.mockResolvedValue({ data: { totals: {} } })
    const params = { from: 'a', to: 'b', bucket: 'DAY' } as const
    await skillPresets.agentActivity({ organizationId: ORG, ...params, actorKind: 'POLICY_TOKEN' }).queryFn({} as never)
    await skillPresets.myAgentActivity({ organizationId: ORG, ...params }).queryFn({} as never)
    expect(request).toHaveBeenCalledWith(
      requestMatching('GET', `/organization/${ORG}/agentActivity?from=a&to=b&bucket=DAY&actorKind=POLICY_TOKEN`)
    )
    expect(request).toHaveBeenCalledWith(
      requestMatching('GET', `/organization/${ORG}/agentActivity/me?from=a&to=b&bucket=DAY`)
    )
  })

  it('turns AI features on with the organization endpoint', async () => {
    request.mockResolvedValue({ data: {} })
    await mutations.enableAiFeatures({ organizationId: ORG })
    expect(request).toHaveBeenCalledWith(requestMatching('PUT', `/organization/${ORG}/aiFeatures`, { enabled: true }))
  })

  it.each([403, 409, 422, 503])('passes a %i answer on to the caller', async (status) => {
    request.mockRejectedValue({ response: { status } })
    const error = await mutations
      .editSkillPreset({ organizationId: ORG, skillPresetId: PRESET, body: { name: 'Backend' } })
      .catch((e: unknown) => e)
    expect(getSkillPresetErrorStatus(error)).toBe(status)
  })

  it('counts deleting a preset that is already gone (404) as done, and nothing else', async () => {
    request.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(mutations.deleteSkillPreset({ organizationId: ORG, skillPresetId: PRESET })).resolves.toBeUndefined()

    request.mockRejectedValueOnce({ response: { status: 403 } })
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
    expect(skillPresets.revisions({ organizationId: ORG }).queryKey).toEqual([
      'skillPresets',
      'revisions',
      ORG,
      'all',
      100,
    ])
    expect(skillPresets.revisions({ organizationId: ORG, skillPresetId: PRESET, limit: 1 }).queryKey).toEqual([
      'skillPresets',
      'revisions',
      ORG,
      PRESET,
      1,
    ])
    expect(skillPresets.resolvedSkill({ organizationId: ORG, skillName: 'qovery' }).queryKey).toEqual([
      'skillPresets',
      'resolvedSkill',
      ORG,
      'qovery',
    ])
  })
})

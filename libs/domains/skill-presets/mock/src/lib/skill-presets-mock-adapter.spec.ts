import axios, { type AxiosAdapter } from 'axios'
import { getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/util'
import { installSkillPresetsMock, setSkillPresetsMockScenario } from './skill-presets-mock-adapter'

const ORG = 'organization-1'

describe('installSkillPresetsMock', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setSkillPresetsMockScenario()
  })

  it('answers the skill presets endpoints, with query parameters from the URL or the params', async () => {
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const all = await api.get(`/organization/${ORG}/skillPreset`)
    const presets = await api.get(`/organization/${ORG}/skillPreset`, { params: { isTemplate: false } })
    const templates = await api.get(`https://api.example.com/organization/${ORG}/skillPreset?isTemplate=true`)

    expect(all.data.results.length).toBeGreaterThan(presets.data.results.length)
    expect(presets.data.results.every(({ is_template }: { is_template: boolean }) => !is_template)).toBe(true)
    expect(templates.data.results.every(({ is_template }: { is_template: boolean }) => is_template)).toBe(true)
  })

  it('wraps the revision list in results, like the API', async () => {
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const revisions = await api.get(`/organization/${ORG}/skillPreset/revision`, { params: { limit: 5 } })

    expect(Array.isArray(revisions.data.results)).toBe(true)
  })

  it('answers the organization data the pages read, shaped like the generated client', async () => {
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const members = await api.get(`/organization/${ORG}/member`)
    const roles = await api.get(`/organization/${ORG}/availableRole`)
    const organization = await api.get(`/organization/${ORG}`)

    expect(members.data.results[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), email: expect.any(String), role_name: expect.any(String) })
    )
    expect(roles.data.results).toContainEqual(expect.objectContaining({ name: 'Admin' }))
    expect(organization.data).toEqual(expect.objectContaining({ id: ORG, ai_features_enabled: true }))
  })

  it('lists and deletes the mock organization policy tokens, each with its policy', async () => {
    setSkillPresetsMockScenario('agent-experience-active')
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const { results } = (await api.get(`/organization/${ORG}/policyApiToken`)).data
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(({ opa_policy }: { opa_policy?: string }) => opa_policy?.includes('default allow'))).toBe(true)

    await api.delete(`/organization/${ORG}/policyApiToken/${results[0].id}`)
    expect((await api.get(`/organization/${ORG}/policyApiToken`)).data.results).toHaveLength(results.length - 1)
  })

  it('turns AI features on through the organization endpoint', async () => {
    setSkillPresetsMockScenario('ai-features-off')
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    expect((await api.get(`/organization/${ORG}`)).data.ai_features_enabled).toBe(false)
    await api.put(`/organization/${ORG}/aiFeatures`, { enabled: true })
    expect((await api.get(`/organization/${ORG}`)).data.ai_features_enabled).toBe(true)
  })

  it('serves the Copilot service even when its URL is already absolute', async () => {
    const copilot = axios.create({ baseURL: 'https://copilot.example.com' })
    installSkillPresetsMock(copilot, 'copilot', { passthrough: false })

    const response = await copilot.get(`https://copilot.example.com/organization/${ORG}/config`)

    expect(response.data.org_config).toEqual(expect.objectContaining({ enabled: true }))
  })

  it('sends the Copilot requests it does not play on, such as threads', async () => {
    const send = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(async (config) => ({
      data: 'real thread',
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))
    const copilot = axios.create({ baseURL: 'https://copilot.example.com', adapter: send })
    installSkillPresetsMock(copilot, 'copilot')

    const response = await copilot.get(`/owner/user-1/organization/${ORG}/thread`)

    expect(response.data).toBe('real thread')
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('rejects like the API, with the status on the response', async () => {
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const missing = await api.get('/skillPreset/unknown').catch((error: unknown) => error)
    const unplayed = await api.get(`/organization/${ORG}/cluster`).catch((error: unknown) => error)

    expect(getSkillPresetErrorStatus(missing)).toBe(404)
    expect(getSkillPresetErrorStatus(unplayed)).toBe(404)
  })

  it('sends other requests on, and the real organization gets the mock AI features flag', async () => {
    const send = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(async (config) => ({
      data: { id: ORG, name: 'Real organization', ai_features_enabled: false },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))
    const api = axios.create({ adapter: send })
    installSkillPresetsMock(api, 'api')

    await api.get(`/organization/${ORG}/cluster`)
    const organization = await api.get(`/organization/${ORG}`)

    expect(send).toHaveBeenCalledTimes(2)
    expect(organization.data).toEqual({ id: ORG, name: 'Real organization', ai_features_enabled: true })
  })

  it('restores the original adapter when uninstalled', async () => {
    const send = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(async (config) => ({
      data: 'real',
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))
    const api = axios.create({ adapter: send })
    const uninstall = installSkillPresetsMock(api, 'api')

    const { data } = await api.get(`/organization/${ORG}/skillPreset`)
    expect(data).toEqual({ results: expect.any(Array) })
    expect(send).not.toHaveBeenCalled()

    uninstall()
    expect(api.defaults.adapter).toBe(send)
    expect((await api.get(`/organization/${ORG}/skillPreset`)).data).toBe('real')
  })
})

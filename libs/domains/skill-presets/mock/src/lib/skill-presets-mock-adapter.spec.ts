import axios, { type AxiosAdapter } from 'axios'
import { getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/data-access'
import { installSkillPresetsMock, resetSkillPresetsMock } from './skill-presets-mock-adapter'

jest.mock('@qovery/shared/util-node-env', () => ({
  ...jest.requireActual('@qovery/shared/util-node-env'),
  SKILL_PRESETS_MOCK: 'true',
}))

const ORG = 'organization-1'

const useScenario = (scenario: string) => {
  window.sessionStorage.setItem('qovery-mock-skill-presets', scenario)
  resetSkillPresetsMock()
}

describe('installSkillPresetsMock', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    resetSkillPresetsMock()
  })

  it('answers the skill presets endpoints, with query parameters from the URL or the params', async () => {
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const all = await api.get(`/organization/${ORG}/skillPreset`)
    const presets = await api.get(`/organization/${ORG}/skillPreset`, { params: { isTemplate: false } })
    const templates = await api.get(`https://api.example.com/organization/${ORG}/skillPreset?isTemplate=true`)

    expect(all.data.length).toBeGreaterThan(presets.data.length)
    expect(presets.data.every(({ is_template }: { is_template: boolean }) => !is_template)).toBe(true)
    expect(templates.data.every(({ is_template }: { is_template: boolean }) => is_template)).toBe(true)
  })

  it('answers the organization data the pages read, shaped like the generated client', async () => {
    const api = axios.create()
    installSkillPresetsMock(api, 'api', { passthrough: false })

    const members = await api.get(`/organization/${ORG}/member`)
    const roles = await api.get(`/organization/${ORG}/availableRole`)
    const tokens = await api.get(`/organization/${ORG}/policyApiToken`)
    const organization = await api.get(`/organization/${ORG}`)

    expect(members.data.results[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), email: expect.any(String), role_name: expect.any(String) })
    )
    expect(roles.data.results).toContainEqual(expect.objectContaining({ name: 'Admin' }))
    expect(tokens.data.results.every(({ opa_policy }: { opa_policy?: string }) => Boolean(opa_policy))).toBe(true)
    expect(organization.data).toEqual(expect.objectContaining({ id: ORG, ai_features_enabled: true }))
  })

  it('turns AI features on through the organization endpoint', async () => {
    useScenario('ai-features-off')
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

  it('leaves every request untouched when the mock is switched off, and can be removed', async () => {
    useScenario('off')
    window.history.replaceState({}, '', '/?mockSkillPresets=off')
    const send = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(async (config) => ({
      data: 'real',
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))
    const api = axios.create({ adapter: send })
    const uninstall = installSkillPresetsMock(api, 'api')

    expect((await api.get(`/organization/${ORG}/skillPreset`)).data).toBe('real')
    uninstall()
    expect(api.defaults.adapter).toBe(send)
    window.history.replaceState({}, '', '/')
  })
})

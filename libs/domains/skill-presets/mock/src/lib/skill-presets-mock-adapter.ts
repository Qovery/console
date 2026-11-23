import axios, { type AxiosAdapter, AxiosError, type AxiosInstance } from 'axios'
import { SKILL_PRESETS_MOCK_MEMBER_SCENARIOS, type SkillPresetsMockScenario } from './mock-scenario-names'
import { type SkillPresetsMockServer, type SkillPresetsMockService } from './skill-presets-mock-server'

let server: { scenario: SkillPresetsMockScenario; instance: Promise<SkillPresetsMockServer> } | undefined

let scenario: SkillPresetsMockScenario = 'typical'

export function setSkillPresetsMockScenario(next: SkillPresetsMockScenario = 'typical') {
  scenario = next
  resetSkillPresetsMock()
}

export function isSkillPresetsMockMember() {
  return SKILL_PRESETS_MOCK_MEMBER_SCENARIOS.includes(scenario)
}

function resolveServer(): Promise<SkillPresetsMockServer> {
  if (server?.scenario !== scenario) {
    const instance = import('./skill-presets-mock-server').then(({ createSkillPresetsMockServer }) =>
      createSkillPresetsMockServer(scenario)
    )
    server = { scenario, instance }
  }
  return server.instance
}

/**
 * Serves the skill presets pages from the mock scenario at the HTTP boundary: the instance's adapter
 * answers the endpoints the mock plays and sends every other request on as usual.
 * `passthrough: false` answers only from the mock,
 * for tests without a real API.
 */
export function installSkillPresetsMock(
  instance: AxiosInstance,
  service: SkillPresetsMockService,
  { passthrough = true }: { passthrough?: boolean } = {}
) {
  const defaultAdapter = instance.defaults.adapter
  const send: AxiosAdapter = axios.getAdapter(defaultAdapter)
  instance.defaults.adapter = async (config) => {
    const answer = (await resolveServer()).handle(service, config, passthrough ? send : undefined)
    if (answer) return answer
    if (passthrough) return send(config)
    throw new AxiosError('Not played by the mock', AxiosError.ERR_BAD_REQUEST, config, undefined, {
      data: { status: 404, detail: 'Not played by the mock' },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config,
    })
  }
  return () => {
    instance.defaults.adapter = defaultAdapter
  }
}

/** Drops the in-memory mock, so the next request starts from the scenario's seed. */
export function resetSkillPresetsMock() {
  server = undefined
}

/** Test helper: the audit entries the mock recorded, oldest first. */
export async function getSkillPresetsMockAuditEvents() {
  return (await resolveServer()).auditEvents()
}

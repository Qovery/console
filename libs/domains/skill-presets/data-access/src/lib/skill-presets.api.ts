import axios from 'axios'
import {
  OrganizationEventApi,
  type OrganizationEventResponseList,
  type OrganizationEventSubTargetType,
  type OrganizationEventType,
  OrganizationMainCallsApi,
} from 'qovery-typescript-axios'
import { type AgentActivityParams, type AgentActivityResponse } from './agent-activity.types'
import { getSkillPresetsMockScenario } from './skill-presets-mock-mode'
import {
  type InjectedSkillResponse,
  type ResolvedSkillPurpose,
  SKILL_LOAD_EVENT_TYPE,
  SKILL_PRESET_SUB_TARGET_TYPE,
  type SkillPresetAssignees,
  type SkillPresetManifestResponse,
  type SkillPresetRequest,
  type SkillPresetResponse,
  type SkillPresetRevisionResponse,
  type SkillPresetUsageParams,
  type SkillPresetUsageResponse,
} from './skill-presets.types'

/*
 * Temporary API module for skill presets.
 *
 * TODO: the skill presets endpoints are not in qovery-openapi-spec yet. Once they are released in
 * `qovery-typescript-axios`, replace `httpSkillPresetsApi` with the generated `SkillPresetsApi` (same
 * method names) and delete this file's axios calls. The paths have no `/api` prefix: the axios auth
 * interceptor adds the API base URL and the token, like it does for the generated client.
 */

export interface SkillLoadsParams {
  pageSize?: number
  continueToken?: string | null
  stepBackToken?: string | null
}

export interface SkillPresetsApi {
  /** `isTemplate` filters on the template flag; omit it to list every preset, templates included. */
  listSkillPresets(organizationId: string, params?: { isTemplate?: boolean }): Promise<SkillPresetResponse[]>
  getSkillPreset(skillPresetId: string): Promise<SkillPresetResponse>
  createSkillPreset(organizationId: string, body: SkillPresetRequest): Promise<SkillPresetResponse>
  editSkillPreset(skillPresetId: string, body: SkillPresetRequest): Promise<SkillPresetResponse>
  deleteSkillPreset(skillPresetId: string): Promise<void>
  listSkillPresetRevisions(
    organizationId: string,
    params?: { skillPresetId?: string; limit?: number }
  ): Promise<SkillPresetRevisionResponse[]>
  getResolvedSkillPreset(organizationId: string): Promise<SkillPresetManifestResponse>
  /**
   * Audited by q-core as `purpose`: LOAD (an agent's load, counted in usage) or VIEW (a read for
   * display, not counted). The Console only ever reads for display, so it sends VIEW.
   */
  getResolvedSkill(
    organizationId: string,
    skillName: string,
    params: { purpose: ResolvedSkillPurpose }
  ): Promise<InjectedSkillResponse>
  /** Skill loads are audit log entries: event LOAD, sub-target SKILL_PRESET. */
  listSkillLoads(organizationId: string, params?: SkillLoadsParams): Promise<OrganizationEventResponseList>
  getSkillPresetUsage(organizationId: string, params: SkillPresetUsageParams): Promise<SkillPresetUsageResponse>
  /**
   * Turns AI features on for the organization (`PUT /organization/{id}/aiFeatures`, owners and admins).
   * Not a skill presets endpoint: it goes through this module only so the mock can play it.
   */
  enableAiFeatures(organizationId: string): Promise<void>
  /** What coding agents did on Qovery, for the whole organization (owners and admins). */
  getAgentActivity(organizationId: string, params: AgentActivityParams): Promise<AgentActivityResponse>
  /** The caller's own agent activity, for any member. Never includes other people. */
  getMyAgentActivity(
    organizationId: string,
    params: Omit<AgentActivityParams, 'userSub'>
  ): Promise<AgentActivityResponse>
}

const eventsApi = new OrganizationEventApi()
const organizationApi = new OrganizationMainCallsApi()

const httpSkillPresetsApi: SkillPresetsApi = {
  async listSkillPresets(organizationId, { isTemplate } = {}) {
    const response = await axios.get<{ results: SkillPresetResponse[] }>(
      `/organization/${organizationId}/skillPreset`,
      {
        params: { isTemplate },
      }
    )
    return response.data.results
  },
  async getSkillPreset(skillPresetId) {
    const response = await axios.get<SkillPresetResponse>(`/skillPreset/${skillPresetId}`)
    return response.data
  },
  async createSkillPreset(organizationId, body) {
    const response = await axios.post<SkillPresetResponse>(`/organization/${organizationId}/skillPreset`, body)
    return response.data
  },
  async editSkillPreset(skillPresetId, body) {
    const response = await axios.put<SkillPresetResponse>(`/skillPreset/${skillPresetId}`, body)
    return response.data
  },
  async deleteSkillPreset(skillPresetId) {
    await axios.delete(`/skillPreset/${skillPresetId}`)
  },
  async listSkillPresetRevisions(organizationId, { skillPresetId, limit } = {}) {
    const response = await axios.get<{ results: SkillPresetRevisionResponse[] }>(
      `/organization/${organizationId}/skillPreset/revision`,
      { params: { skillPresetId, limit } }
    )
    return response.data.results
  },
  async getResolvedSkill(organizationId, skillName, { purpose }) {
    const response = await axios.get<InjectedSkillResponse>(
      `/organization/${organizationId}/skillPreset/resolved/skill/${encodeURIComponent(skillName)}`,
      { params: { purpose } }
    )
    return response.data
  },
  async getResolvedSkillPreset(organizationId) {
    const response = await axios.get<SkillPresetManifestResponse>(
      `/organization/${organizationId}/skillPreset/resolved`
    )
    return response.data
  },
  async listSkillLoads(organizationId, { pageSize = 30, continueToken, stepBackToken } = {}) {
    const response = await eventsApi.getOrganizationEvents(
      organizationId,
      pageSize,
      undefined,
      undefined,
      continueToken ?? undefined,
      stepBackToken ?? undefined,
      // The generated enums do not list LOAD and SKILL_PRESET yet.
      SKILL_LOAD_EVENT_TYPE as OrganizationEventType,
      undefined,
      undefined,
      SKILL_PRESET_SUB_TARGET_TYPE as OrganizationEventSubTargetType
    )
    return response.data
  },
  async enableAiFeatures(organizationId) {
    await organizationApi.editOrganizationAiFeatures(organizationId, { enabled: true })
  },
  async getAgentActivity(organizationId, params) {
    const response = await axios.get<AgentActivityResponse>(`/organization/${organizationId}/agentActivity`, {
      params,
    })
    return response.data
  },
  async getMyAgentActivity(organizationId, params) {
    const response = await axios.get<AgentActivityResponse>(`/organization/${organizationId}/agentActivity/me`, {
      params,
    })
    return response.data
  },
  async getSkillPresetUsage(organizationId, params) {
    const response = await axios.get<SkillPresetUsageResponse>(`/organization/${organizationId}/skillPreset/usage`, {
      params,
    })
    return response.data
  },
}

type MockSkillPresetsApi = SkillPresetsApi & {
  listAssignees: () => Promise<SkillPresetAssignees>
  aiFeaturesEnabled: () => Promise<boolean>
}

let mockApi: { scenario: string; api: Promise<MockSkillPresetsApi> } | undefined

function resolveMockApi(): Promise<MockSkillPresetsApi> | null {
  const scenario = getSkillPresetsMockScenario()
  if (!scenario) return null
  if (mockApi?.scenario !== scenario) {
    // Loaded on demand so the mock data never ships in the main bundle.
    const api = import('./mock/skill-presets-mock-api').then(({ createSkillPresetsMockApi }) =>
      createSkillPresetsMockApi(scenario)
    )
    mockApi = { scenario, api }
  }
  return mockApi.api
}

async function resolveApi(): Promise<SkillPresetsApi> {
  return (await resolveMockApi()) ?? httpSkillPresetsApi
}

/** Descriptions and the unsafe sample of the mock scenarios, loaded only when the mock is active. */
export const loadSkillPresetsMockTools = () => import('./mock/mock-tools')

/**
 * Members and roles of the mock organization. Outside mock mode the Console's own members and roles
 * queries are used instead, so the mock never sees real people.
 */
export async function listMockSkillPresetAssignees(): Promise<SkillPresetAssignees> {
  const api = await resolveMockApi()
  if (!api) throw new Error('The skill presets mock is not active')
  return api.listAssignees()
}

/** Mock mode only: whether the mock organization has AI features on. It changes when they are turned on. */
export async function getMockAiFeaturesEnabled(): Promise<boolean> {
  const api = await resolveMockApi()
  if (!api) throw new Error('The skill presets mock is not active')
  return api.aiFeaturesEnabled()
}

/** Test helper: drop the in-memory mock so the next call starts from the scenario's seed. */
export function resetSkillPresetsMockApi() {
  mockApi = undefined
}

export const skillPresetsApi: SkillPresetsApi = {
  listSkillPresets: async (...args) => (await resolveApi()).listSkillPresets(...args),
  getSkillPreset: async (...args) => (await resolveApi()).getSkillPreset(...args),
  createSkillPreset: async (...args) => (await resolveApi()).createSkillPreset(...args),
  editSkillPreset: async (...args) => (await resolveApi()).editSkillPreset(...args),
  deleteSkillPreset: async (...args) => (await resolveApi()).deleteSkillPreset(...args),
  listSkillPresetRevisions: async (...args) => (await resolveApi()).listSkillPresetRevisions(...args),
  getResolvedSkillPreset: async (...args) => (await resolveApi()).getResolvedSkillPreset(...args),
  getResolvedSkill: async (...args) => (await resolveApi()).getResolvedSkill(...args),
  listSkillLoads: async (...args) => (await resolveApi()).listSkillLoads(...args),
  getSkillPresetUsage: async (...args) => (await resolveApi()).getSkillPresetUsage(...args),
  enableAiFeatures: async (...args) => (await resolveApi()).enableAiFeatures(...args),
  getAgentActivity: async (...args) => (await resolveApi()).getAgentActivity(...args),
  getMyAgentActivity: async (...args) => (await resolveApi()).getMyAgentActivity(...args),
}

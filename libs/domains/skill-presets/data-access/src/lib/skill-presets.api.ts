import axios from 'axios'
import {
  MembersApi,
  OrganizationEventApi,
  type OrganizationEventResponseList,
  type OrganizationEventSubTargetType,
  type OrganizationEventType,
  OrganizationMainCallsApi,
} from 'qovery-typescript-axios'
import { getSkillPresetsMockScenario } from './skill-presets-mock-mode'
import {
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
  listSkillPresets(organizationId: string): Promise<SkillPresetResponse[]>
  getSkillPreset(skillPresetId: string): Promise<SkillPresetResponse>
  createSkillPreset(organizationId: string, body: SkillPresetRequest): Promise<SkillPresetResponse>
  editSkillPreset(skillPresetId: string, body: SkillPresetRequest): Promise<SkillPresetResponse>
  deleteSkillPreset(skillPresetId: string): Promise<void>
  listSkillPresetRevisions(
    organizationId: string,
    params?: { skillPresetId?: string; limit?: number }
  ): Promise<SkillPresetRevisionResponse[]>
  getResolvedSkillPreset(organizationId: string): Promise<SkillPresetManifestResponse>
  /** Skill loads are audit log entries: event LOAD, sub-target SKILL_PRESET. */
  listSkillLoads(organizationId: string, params?: SkillLoadsParams): Promise<OrganizationEventResponseList>
  listAssignees(organizationId: string): Promise<SkillPresetAssignees>
  getSkillPresetUsage(organizationId: string, params: SkillPresetUsageParams): Promise<SkillPresetUsageResponse>
}

const eventsApi = new OrganizationEventApi()
const organizationApi = new OrganizationMainCallsApi()
const membersApi = new MembersApi()

const httpSkillPresetsApi: SkillPresetsApi = {
  async listSkillPresets(organizationId) {
    const response = await axios.get<{ results: SkillPresetResponse[] }>(`/organization/${organizationId}/skillPreset`)
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
      `/organization/${organizationId}/skillPresetRevision`,
      { params: { skillPresetId, limit } }
    )
    return response.data.results
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
  async listAssignees(organizationId) {
    const [roles, members] = await Promise.all([
      organizationApi.listOrganizationAvailableRoles(organizationId),
      membersApi.getOrganizationMembers(organizationId),
    ])
    return {
      roles: (roles.data.results ?? []).map(({ id, name }) => ({ id, name })),
      members: (members.data.results ?? []).map(({ id, name, nickname, email, role_id }) => ({
        id,
        name: name || nickname || email,
        email,
        role_id,
      })),
    }
  },
  async getSkillPresetUsage(organizationId, params) {
    const response = await axios.get<SkillPresetUsageResponse>(`/organization/${organizationId}/skillPreset/usage`, {
      params,
    })
    return response.data
  },
}

let mockApi: { scenario: string; api: Promise<SkillPresetsApi> } | undefined

async function resolveApi(): Promise<SkillPresetsApi> {
  const scenario = getSkillPresetsMockScenario()
  if (!scenario) return httpSkillPresetsApi
  if (mockApi?.scenario !== scenario) {
    // Loaded on demand so the mock data never ships in the main bundle.
    const api = import('./mock/skill-presets-mock-api').then(({ createSkillPresetsMockApi }) =>
      createSkillPresetsMockApi(scenario)
    )
    mockApi = { scenario, api }
  }
  return mockApi.api
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
  listSkillLoads: async (...args) => (await resolveApi()).listSkillLoads(...args),
  listAssignees: async (...args) => (await resolveApi()).listAssignees(...args),
  getSkillPresetUsage: async (...args) => (await resolveApi()).getSkillPresetUsage(...args),
}

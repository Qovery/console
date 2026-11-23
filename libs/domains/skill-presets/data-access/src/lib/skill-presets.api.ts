import axios from 'axios'
import { OrganizationMainCallsApi } from 'qovery-typescript-axios'
import { type AgentActivityParams, type AgentActivityResponse } from './agent-activity.types'
import {
  type InjectedSkillResponse,
  type ResolvedSkillPurpose,
  type SkillPresetManifestResponse,
  type SkillPresetRequest,
  type SkillPresetResponse,
  type SkillPresetRevisionResponse,
} from './skill-presets.types'

/*
 * Temporary API module for skill presets.
 *
 * TODO: the skill presets and agent activity endpoints are added to qovery-openapi-spec by
 * Qovery/qovery-openapi-spec#1261. Once it is released in `qovery-typescript-axios`, replace
 * `skillPresetsApi` with the generated `SkillPresetsApi` (same method names), swap the types in
 * skill-presets.types.ts and agent-activity.types.ts for the generated ones, and delete this file's
 * axios calls. The paths have no `/api` prefix: the axios auth interceptor adds the API base URL and
 * the token, like it does for the generated client.
 */

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
  /** Turns AI features on for the organization (`PUT /organization/{id}/aiFeatures`, owners and admins). */
  enableAiFeatures(organizationId: string): Promise<void>
  /** What coding agents did on Qovery, for the whole organization (owners and admins). */
  getAgentActivity(organizationId: string, params: AgentActivityParams): Promise<AgentActivityResponse>
  /** The caller's own agent activity, for any member. Never includes other people. */
  getMyAgentActivity(
    organizationId: string,
    params: Omit<AgentActivityParams, 'userSub'>
  ): Promise<AgentActivityResponse>
}

const organizationApi = new OrganizationMainCallsApi()

export const skillPresetsApi: SkillPresetsApi = {
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
}

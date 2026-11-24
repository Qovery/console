import { AgentActivityApi, OrganizationMainCallsApi, SkillPresetsApi } from 'qovery-typescript-axios'
import { type AgentActivityParams, type AgentActivityResponse } from './agent-activity.types'
import {
  type InjectedSkillResponse,
  type ResolvedSkillPurpose,
  type SkillPresetManifestResponse,
  type SkillPresetRequest,
  type SkillPresetResponse,
  type SkillPresetRevisionResponse,
} from './skill-presets.types'

export interface SkillPresetsClient {
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

const presetsApi = new SkillPresetsApi()
const activityApi = new AgentActivityApi()
const organizationApi = new OrganizationMainCallsApi()

export const skillPresetsApi: SkillPresetsClient = {
  async listSkillPresets(organizationId, { isTemplate } = {}) {
    const response = await presetsApi.listSkillPresets(organizationId, isTemplate)
    return response.data.results
  },
  async getSkillPreset(skillPresetId) {
    const response = await presetsApi.getSkillPreset(skillPresetId)
    return response.data
  },
  async createSkillPreset(organizationId, body) {
    const response = await presetsApi.createSkillPreset(organizationId, body)
    return response.data
  },
  async editSkillPreset(skillPresetId, body) {
    const response = await presetsApi.editSkillPreset(skillPresetId, body)
    return response.data
  },
  async deleteSkillPreset(skillPresetId) {
    await presetsApi.deleteSkillPreset(skillPresetId)
  },
  async listSkillPresetRevisions(organizationId, { skillPresetId, limit } = {}) {
    const response = await presetsApi.listSkillPresetRevisions(organizationId, skillPresetId, limit)
    return response.data.results
  },
  async getResolvedSkill(organizationId, skillName, { purpose }) {
    const response = await presetsApi.getResolvedSkill(organizationId, skillName, purpose)
    return response.data
  },
  async getResolvedSkillPreset(organizationId) {
    const response = await presetsApi.getResolvedSkillPreset(organizationId)
    return response.data
  },
  async enableAiFeatures(organizationId) {
    await organizationApi.editOrganizationAiFeatures(organizationId, { enabled: true })
  },
  async getAgentActivity(
    organizationId,
    { from, to, bucket, userSub, skillName, actorKind, policyTokenId, outcome, source }
  ) {
    const response = await activityApi.getAgentActivity(
      organizationId,
      from,
      to,
      bucket,
      userSub,
      skillName,
      actorKind,
      policyTokenId,
      outcome,
      source
    )
    return response.data
  },
  async getMyAgentActivity(organizationId, { from, to, bucket, skillName, outcome, source }) {
    const response = await activityApi.getMyAgentActivity(organizationId, from, to, bucket, skillName, outcome, source)
    return response.data
  },
}

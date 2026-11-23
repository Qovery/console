import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type AgentActivityParams } from './agent-activity.types'
import { skillPresetsApi } from './skill-presets.api'
import { getSkillPresetErrorStatus } from './skill-presets.errors'
import { type SkillPresetRequest } from './skill-presets.types'

/** The API's maximum: it has no offset, so older revisions than this cannot be listed. */
export const SKILL_PRESET_REVISIONS_PAGE_SIZE = 100

export const skillPresets = createQueryKeys('skillPresets', {
  list: ({ organizationId, isTemplate }: { organizationId: string; isTemplate?: boolean }) => ({
    queryKey: [organizationId, isTemplate ?? 'all'],
    queryFn: () => skillPresetsApi.listSkillPresets(organizationId, { isTemplate }),
  }),
  details: ({ skillPresetId }: { skillPresetId: string }) => ({
    queryKey: [skillPresetId],
    queryFn: () => skillPresetsApi.getSkillPreset(skillPresetId),
  }),
  revisions: ({
    organizationId,
    skillPresetId,
    limit = SKILL_PRESET_REVISIONS_PAGE_SIZE,
  }: {
    organizationId: string
    skillPresetId?: string
    limit?: number
  }) => ({
    queryKey: [organizationId, skillPresetId ?? 'all', limit],
    queryFn: () => skillPresetsApi.listSkillPresetRevisions(organizationId, { skillPresetId, limit }),
  }),
  resolved: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => skillPresetsApi.getResolvedSkillPreset(organizationId),
  }),
  agentActivity: ({ organizationId, ...params }: { organizationId: string } & AgentActivityParams) => ({
    queryKey: [organizationId, params],
    queryFn: () => skillPresetsApi.getAgentActivity(organizationId, params),
  }),
  myAgentActivity: ({
    organizationId,
    ...params
  }: { organizationId: string } & Omit<AgentActivityParams, 'userSub'>) => ({
    queryKey: [organizationId, params],
    queryFn: () => skillPresetsApi.getMyAgentActivity(organizationId, params),
  }),
  resolvedSkill: ({ organizationId, skillName }: { organizationId: string; skillName: string }) => ({
    queryKey: [organizationId, skillName],
    // Displayed, not loaded by an agent: audited as a VIEW, never counted in usage.
    queryFn: () => skillPresetsApi.getResolvedSkill(organizationId, skillName, { purpose: 'VIEW' }),
  }),
})

export const mutations = {
  enableAiFeatures: ({ organizationId }: { organizationId: string }) =>
    skillPresetsApi.enableAiFeatures(organizationId),
  createSkillPreset: ({ organizationId, body }: { organizationId: string; body: SkillPresetRequest }) =>
    skillPresetsApi.createSkillPreset(organizationId, body),
  editSkillPreset: ({
    skillPresetId,
    body,
  }: {
    organizationId: string
    skillPresetId: string
    body: SkillPresetRequest
  }) => skillPresetsApi.editSkillPreset(skillPresetId, body),
  /** Deleting a preset that is already gone (404) counts as done: the result is the same. */
  deleteSkillPreset: async ({ skillPresetId }: { organizationId: string; skillPresetId: string }) => {
    try {
      await skillPresetsApi.deleteSkillPreset(skillPresetId)
    } catch (error) {
      if (getSkillPresetErrorStatus(error) !== 404) throw error
    }
  },
}

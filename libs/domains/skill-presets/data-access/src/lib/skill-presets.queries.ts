import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type SkillLoadsParams,
  getMockAiFeaturesEnabled,
  listMockSkillPresetAssignees,
  skillPresetsApi,
} from './skill-presets.api'
import { getSkillPresetErrorStatus } from './skill-presets.errors'
import { type SkillPresetRequest, type SkillPresetUsageParams } from './skill-presets.types'

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
  loads: ({ organizationId, ...params }: { organizationId: string } & SkillLoadsParams) => ({
    queryKey: [organizationId, params],
    queryFn: () => skillPresetsApi.listSkillLoads(organizationId, params),
  }),
  resolved: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => skillPresetsApi.getResolvedSkillPreset(organizationId),
  }),
  resolvedSkill: ({ organizationId, skillName }: { organizationId: string; skillName: string }) => ({
    queryKey: [organizationId, skillName],
    // Displayed, not loaded by an agent: audited as a VIEW, never counted in usage.
    queryFn: () => skillPresetsApi.getResolvedSkill(organizationId, skillName, { purpose: 'VIEW' }),
  }),
  usage: ({ organizationId, ...params }: { organizationId: string } & SkillPresetUsageParams) => ({
    queryKey: [organizationId, params],
    queryFn: () => skillPresetsApi.getSkillPresetUsage(organizationId, params),
  }),
  /** Mock mode only: see `getMockAiFeaturesEnabled`. */
  mockAiFeatures: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => getMockAiFeaturesEnabled(),
  }),
  /** Mock mode only: see `listMockSkillPresetAssignees`. */
  mockAssignees: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => listMockSkillPresetAssignees(),
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

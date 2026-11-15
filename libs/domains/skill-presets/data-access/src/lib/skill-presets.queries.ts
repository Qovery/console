import { createQueryKeys } from '@lukemorales/query-key-factory'
import { type SkillLoadsParams, skillPresetsApi } from './skill-presets.api'
import { type SkillPresetRequest, type SkillPresetUsageParams } from './skill-presets.types'

export const skillPresets = createQueryKeys('skillPresets', {
  list: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => skillPresetsApi.listSkillPresets(organizationId),
  }),
  details: ({ skillPresetId }: { skillPresetId: string }) => ({
    queryKey: [skillPresetId],
    queryFn: () => skillPresetsApi.getSkillPreset(skillPresetId),
  }),
  revisions: ({ organizationId, skillPresetId }: { organizationId: string; skillPresetId?: string }) => ({
    queryKey: [organizationId, skillPresetId ?? 'all'],
    queryFn: () => skillPresetsApi.listSkillPresetRevisions(organizationId, { skillPresetId, limit: 100 }),
  }),
  loads: ({ organizationId, ...params }: { organizationId: string } & SkillLoadsParams) => ({
    queryKey: [organizationId, params],
    queryFn: () => skillPresetsApi.listSkillLoads(organizationId, params),
  }),
  resolved: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => skillPresetsApi.getResolvedSkillPreset(organizationId),
  }),
  usage: ({ organizationId, ...params }: { organizationId: string } & SkillPresetUsageParams) => ({
    queryKey: [organizationId, params],
    queryFn: () => skillPresetsApi.getSkillPresetUsage(organizationId, params),
  }),
  assignees: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    queryFn: () => skillPresetsApi.listAssignees(organizationId),
  }),
})

export const mutations = {
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
  deleteSkillPreset: ({ skillPresetId }: { organizationId: string; skillPresetId: string }) =>
    skillPresetsApi.deleteSkillPreset(skillPresetId),
}

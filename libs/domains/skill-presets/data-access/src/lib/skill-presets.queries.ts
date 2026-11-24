import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type AgentActionOutcome,
  AgentActivityApi,
  type AgentActivitySource,
  type AgentActorKind,
  OrganizationMainCallsApi,
  SkillLoadPurpose,
  type SkillPresetRequest,
  SkillPresetsApi,
  type SkillUsageBucket,
} from 'qovery-typescript-axios'
import { getSkillPresetErrorStatus } from './skill-presets.errors'

/** The API's maximum: it has no offset, so older revisions than this cannot be listed. */
export const SKILL_PRESET_REVISIONS_PAGE_SIZE = 100

const presetsApi = new SkillPresetsApi()
const activityApi = new AgentActivityApi()
const organizationApi = new OrganizationMainCallsApi()

export interface AgentActivityQueryParams {
  from: string
  to: string
  bucket: SkillUsageBucket
  /** Admin endpoint only. */
  userSub?: string
  skillName?: string
  /**
   * Admin endpoint only (`/me` ignores them). `policyTokenId` implies POLICY_TOKEN. A 400 answers a
   * token with `actorKind=MEMBER`, or `userSub` with a token or `actorKind=POLICY_TOKEN`.
   */
  actorKind?: AgentActorKind
  policyTokenId?: string
  outcome?: AgentActionOutcome
  source?: AgentActivitySource
}

type MyAgentActivityQueryParams = Omit<AgentActivityQueryParams, 'userSub' | 'actorKind' | 'policyTokenId'>

export const skillPresets = createQueryKeys('skillPresets', {
  list: ({ organizationId, isTemplate }: { organizationId: string; isTemplate?: boolean }) => ({
    queryKey: [organizationId, isTemplate ?? 'all'],
    async queryFn() {
      const response = await presetsApi.listSkillPresets(organizationId, isTemplate)
      return response.data.results
    },
  }),
  details: ({ skillPresetId }: { skillPresetId: string }) => ({
    queryKey: [skillPresetId],
    async queryFn() {
      const response = await presetsApi.getSkillPreset(skillPresetId)
      return response.data
    },
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
    async queryFn() {
      const response = await presetsApi.listSkillPresetRevisions(organizationId, skillPresetId, limit)
      return response.data.results
    },
  }),
  resolved: ({ organizationId }: { organizationId: string }) => ({
    queryKey: [organizationId],
    async queryFn() {
      const response = await presetsApi.getResolvedSkillPreset(organizationId)
      return response.data
    },
  }),
  agentActivity: ({ organizationId, ...params }: { organizationId: string } & AgentActivityQueryParams) => ({
    queryKey: [organizationId, params],
    async queryFn() {
      const { from, to, bucket, userSub, skillName, actorKind, policyTokenId, outcome, source } = params
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
  }),
  myAgentActivity: ({ organizationId, ...params }: { organizationId: string } & MyAgentActivityQueryParams) => ({
    queryKey: [organizationId, params],
    async queryFn() {
      const { from, to, bucket, skillName, outcome, source } = params
      const response = await activityApi.getMyAgentActivity(
        organizationId,
        from,
        to,
        bucket,
        skillName,
        outcome,
        source
      )
      return response.data
    },
  }),
  resolvedSkill: ({ organizationId, skillName }: { organizationId: string; skillName: string }) => ({
    queryKey: [organizationId, skillName],
    // Displayed, not loaded by an agent: audited as a VIEW, never counted in usage.
    async queryFn() {
      const response = await presetsApi.getResolvedSkill(organizationId, skillName, SkillLoadPurpose.VIEW)
      return response.data
    },
  }),
})

export const mutations = {
  async enableAiFeatures({ organizationId }: { organizationId: string }) {
    await organizationApi.editOrganizationAiFeatures(organizationId, { enabled: true })
  },
  async createSkillPreset({ organizationId, body }: { organizationId: string; body: SkillPresetRequest }) {
    const response = await presetsApi.createSkillPreset(organizationId, body)
    return response.data
  },
  async editSkillPreset({
    skillPresetId,
    body,
  }: {
    organizationId: string
    skillPresetId: string
    body: SkillPresetRequest
  }) {
    const response = await presetsApi.editSkillPreset(skillPresetId, body)
    return response.data
  },
  /** Deleting a preset that is already gone (404) counts as done: the result is the same. */
  deleteSkillPreset: async ({ skillPresetId }: { organizationId: string; skillPresetId: string }) => {
    try {
      await presetsApi.deleteSkillPreset(skillPresetId)
    } catch (error) {
      if (getSkillPresetErrorStatus(error) !== 404) throw error
    }
  },
}

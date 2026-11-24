import { z } from 'zod'
import { AGENT_ACTIVITY_LIMITS } from '@qovery/domains/skill-presets/data-access'
import { type AgentActivityBucket, type AgentActivityParams, type AgentActivitySource } from './agent-activity.types'

export const ACTIVITY_RANGES: { value: string; label: string; hours: number; bucket: AgentActivityBucket }[] = [
  { value: '1d', label: '24 hours', hours: 24, bucket: 'HOUR' },
  { value: '7d', label: '7 days', hours: 24 * 7, bucket: 'DAY' },
  { value: '30d', label: '30 days', hours: 24 * 30, bucket: 'DAY' },
  { value: '90d', label: '90 days', hours: 24 * 90, bucket: 'DAY' },
]
export const DEFAULT_RANGE = '30d'

export const SOURCE_FILTER_LABELS = {
  SKILL_LOAD: 'Skill loads',
  SKILL_API_ACTION: 'Skills',
  MCP_TOOL_CALL: 'MCP',
  POLICY_TOKEN_API_ACTION: 'Policy token calls (API, CLI, Terraform)',
  POLICY_DENIAL: 'Refused requests',
} satisfies Record<AgentActivitySource, string>

const findRange = (value?: string) => ACTIVITY_RANGES.find((range) => range.value === value)
const policyTokenId = z.guid()

/** The Activity filters, kept in the URL so a filtered view can be shared or linked to. */
export const activitySearchSchema = z.object({
  range: z
    .string()
    .refine((value) => Boolean(findRange(value)))
    .optional()
    .catch(undefined),
  actor: z
    .string()
    .refine((value) => {
      const { actorKind, userSub, policyTokenId: tokenId } = parseActor(value)
      return Boolean(actorKind || userSub?.trim() || policyTokenId.safeParse(tokenId).success)
    })
    .optional()
    .catch(undefined),
  skill: z
    .string()
    .regex(AGENT_ACTIVITY_LIMITS.skillNamePattern)
    // Old links used "none" for a filter the API cannot apply to its aggregates.
    .refine((value) => value !== 'none')
    .optional()
    .catch(undefined),
  outcome: z.enum(['ALLOWED', 'DENIED']).optional().catch(undefined),
  via: z
    .custom<AgentActivitySource>(
      (value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(SOURCE_FILTER_LABELS, value)
    )
    .optional()
    .catch(undefined),
  view: z.enum(['member', 'token', 'skill']).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type ActivitySearch = z.infer<typeof activitySearchSchema>
export type ActivityScope = 'organization' | 'me'

export const memberActor = (userSub: string) => `member:${userSub}`
export const tokenActor = (tokenId: string) => `token:${tokenId}`

export function parseActor(actor?: string) {
  if (actor === 'members') return { actorKind: 'MEMBER' as const }
  if (actor === 'tokens') return { actorKind: 'POLICY_TOKEN' as const }
  if (actor?.startsWith('member:')) return { userSub: actor.slice('member:'.length) }
  if (actor?.startsWith('token:')) return { policyTokenId: actor.slice('token:'.length) }
  return {}
}

export const activityRange = (search: ActivitySearch) =>
  findRange(search.range) ?? findRange(DEFAULT_RANGE) ?? ACTIVITY_RANGES[0]

/**
 * Now, rounded up to the minute: the query key stays the same within a minute, and the window moves
 * forward on the next render after it.
 */
export const activityWindowEnd = () => new Date(Math.ceil(Date.now() / 60_000) * 60_000)

/** The query params for the API. `to` is passed in, so the range stays stable between renders. */
export function activityParams(search: ActivitySearch, to: Date, scope: ActivityScope): AgentActivityParams {
  const range = activityRange(search)
  return {
    from: new Date(to.getTime() - range.hours * 3_600_000).toISOString(),
    to: to.toISOString(),
    bucket: range.bucket,
    // A member only ever sees their own activity: no actor filter.
    ...(scope === 'organization' ? parseActor(search.actor) : {}),
    skillName: search.skill,
    outcome: search.outcome,
    source: search.via,
  }
}

export const hasActivityFilters = (search: ActivitySearch, scope: ActivityScope) =>
  Boolean((scope === 'organization' && search.actor) || search.skill || search.outcome || search.via)

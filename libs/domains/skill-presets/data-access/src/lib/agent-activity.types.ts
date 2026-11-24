import {
  type AgentActionOutcome,
  type AgentActivitySource,
  type AgentActorKind,
  type SkillUsageBucket,
} from 'qovery-typescript-axios'

export type {
  AgentActionOutcome,
  AgentActivityResponse,
  AgentActivitySource,
  AgentActorKind as AgentActorType,
  SkillUsageBucket as AgentActivityBucket,
} from 'qovery-typescript-axios'

/** Range and limits of the endpoints: 30 days by default, 90 at most. Anything else is a 400. */
export const AGENT_ACTIVITY_LIMITS = {
  defaultRangeDays: 30,
  maxRangeDays: 90,
  maxRecent: 100,
  maxMembers: 500,
  maxPolicyTokens: 100,
  maxSkills: 100,
  maxTopSkills: 3,
  skillNamePattern: /^[a-z0-9._-]{1,64}$/,
} as const

export interface AgentActivityParams {
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

/**
 * Types of the agent activity endpoints, mirroring the q-core contract (JSON in snake_case).
 *
 * TODO: replace with the types of `qovery-typescript-axios` once the endpoints are released.
 */

export type AgentActivityBucket = 'DAY' | 'HOUR'
export type AgentActionOrigin = 'SKILL' | 'MCP'
export type AgentActionOutcome = 'ALLOWED' | 'DENIED'

export interface AgentActivityParams {
  from: string
  to: string
  bucket: AgentActivityBucket
  /** Admin endpoint only. */
  userSub?: string
  skillName?: string
}

export interface AgentActivityResponse {
  /** What the numbers can and cannot see, said by q-core. */
  coverage: { sources: string[]; note: string }
  totals: { skill_loads: number; actions: number; denials: number; members: number }
  timeline: { start: string; skill_loads: number; actions: number; denials: number }[]
  /** `event` is an audit event type (TRIGGER_DEPLOY, UPDATE...), `target_type` an audit target type. */
  actions_by_type: { event: string; target_type: string; count: number; denied: number }[]
  by_member: {
    user_sub: string
    user_name: string
    skill_loads: number
    actions: number
    denials: number
    top_skills: string[]
    last_activity_at: string
  }[]
  /** A null skill groups actions with no skill attributed (MCP, or no skill in the user agent). */
  by_skill: { skill_name: string | null; loads: number; actions: number; denials: number; members: number }[]
  /** Most recent first, at most 100. Never holds prompt or code content. */
  recent: {
    at: string
    user_sub: string
    user_name: string
    origin: AgentActionOrigin
    skill_name: string | null
    event: string
    target_type: string
    target_name: string
    project_name: string | null
    environment_name: string | null
    outcome: AgentActionOutcome
  }[]
}

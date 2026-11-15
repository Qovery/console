/**
 * Types of the agent activity endpoints, mirroring the q-core contract (JSON in snake_case).
 *
 * TODO: replace with the types of `qovery-typescript-axios` once the endpoints are released.
 */

export type AgentActivityBucket = 'DAY' | 'HOUR'
/**
 * Where q-core reads agent activity from. Version 1 links what Qovery already records:
 * - `SKILL_LOAD`: a skill an agent loaded.
 * - `SKILL_API_ACTION`: an API call made with a skill user agent.
 * - `MCP_TOOL_CALL`: a tool call through the Qovery MCP server.
 * - `POLICY_DENIAL`: a request refused (by a policy token, or the member's role from a skill).
 */
export type AgentActivitySource = 'SKILL_LOAD' | 'SKILL_API_ACTION' | 'MCP_TOOL_CALL' | 'POLICY_DENIAL'
/** The source of one action in `recent`. A skill load is not an action. */
export type AgentActionOrigin = Exclude<AgentActivitySource, 'SKILL_LOAD'>
/** `DENIED` for a `POLICY_DENIAL`, `ALLOWED` otherwise. */
export type AgentActionOutcome = 'ALLOWED' | 'DENIED'

/** Range and limits of the endpoints: 30 days by default, 90 at most. Anything else is a 400. */
export const AGENT_ACTIVITY_LIMITS = {
  defaultRangeDays: 30,
  maxRangeDays: 90,
  maxRecent: 100,
  maxMembers: 500,
  maxSkills: 100,
  maxTopSkills: 3,
  skillNamePattern: /^[a-z0-9._-]{1,64}$/,
} as const

export interface AgentActivityParams {
  from: string
  to: string
  bucket: AgentActivityBucket
  /** Admin endpoint only. */
  userSub?: string
  skillName?: string
}

export interface AgentActivityResponse {
  /** The range and bucket q-core used, defaults applied. */
  from: string
  to: string
  bucket: AgentActivityBucket
  /** What the numbers can and cannot see: a fixed set of sources and a fixed note. */
  coverage: { sources: AgentActivitySource[]; note: string }
  /** `actions` counts allowed agent actions only; `denials` counts the refused ones. */
  totals: { skill_loads: number; actions: number; denials: number; members: number }
  /** Same split as the totals: `actions` allowed only. */
  timeline: { start: string; skill_loads: number; actions: number; denials: number }[]
  /**
   * `event` and `target_type` are raw audit values (TRIGGER_DEPLOY, MCP, POLICY_FAILED...), for the
   * Console to label. `count` includes the denied ones.
   */
  actions_by_type: { event: string; target_type: string; count: number; denied: number }[]
  /** At most 500, the most active first. */
  by_member: {
    /** Null for an actor that loaded no skill in the range, such as a policy token (`policy:<id>:<name>`). */
    user_sub: string | null
    user_name: string
    skill_loads: number
    actions: number
    denials: number
    top_skills: string[]
    last_activity_at: string
  }[]
  /** At most 100. A null skill groups actions that name no skill (MCP, or a plain API call). */
  by_skill: { skill_name: string | null; loads: number; actions: number; denials: number; members: number }[]
  /** Most recent first, at most 100. Never holds prompt or code content. */
  recent: {
    at: string
    user_sub: string | null
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

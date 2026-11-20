/**
 * The setup state of Agents, from what the organization already has. No new signal: "connected" means
 * we have seen agent activity in the last 30 days (a skill load, an action or a denial). It does not
 * prove an agent is installed today, and the setup card says only what it means.
 */

export type AgentExperienceStepId = 'preset' | 'policy-token' | 'connect'
export type AgentExperienceState = 'empty' | 'partial' | 'active'

export interface AgentExperienceSetupInput {
  /** From agent activity, over the last 30 days. */
  skillLoads: number
  actions: number
  denials: number
  /** Presets, templates excluded. */
  presets: number
  policyTokens: number
}

export interface AgentExperienceSetup {
  state: AgentExperienceState
  /** In display order. */
  steps: { id: AgentExperienceStepId; done: boolean }[]
  doneCount: number
  /** The one step to highlight, or null when everything is done. */
  nextStep: AgentExperienceStepId | null
}

// The value first: the organization's own preset, then the limits, then connecting agents, which load
// that preset. AI features are not a step: new organizations have them on, and the setup card shows
// Turn on AI when they are off.
const ORDER: AgentExperienceStepId[] = ['preset', 'policy-token', 'connect']

export function computeAgentExperienceSetup(input: AgentExperienceSetupInput): AgentExperienceSetup {
  const connected = input.skillLoads + input.actions + input.denials > 0
  const done: Record<AgentExperienceStepId, boolean> = {
    connect: connected,
    preset: input.presets > 0,
    'policy-token': input.policyTokens > 0,
  }
  const state: AgentExperienceState =
    connected && done.preset && done['policy-token']
      ? 'active'
      : !connected && !done.preset && !done['policy-token']
        ? 'empty'
        : 'partial'
  const steps = ORDER.map((id) => ({ id, done: done[id] }))
  return {
    state,
    steps,
    doneCount: steps.filter((step) => step.done).length,
    nextStep: ORDER.find((id) => !done[id]) ?? null,
  }
}

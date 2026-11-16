/**
 * The setup state of Agents, from what the organization already has. No new signal:
 * "connected" means agents have loaded a skill or acted on Qovery, as agent activity reports it.
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
// that preset. AI features are not a step: new organizations have them on, and the Overview shows a
// notice when they are off. Only steps the user does: agents acting is shown on Activity.
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

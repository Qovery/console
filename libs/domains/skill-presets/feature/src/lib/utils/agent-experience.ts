/**
 * The setup state of Agent Experience, from what the organization already has. No new signal:
 * "connected" means agents have loaded a skill or acted on Qovery, as agent activity reports it.
 */

export type AgentExperienceStepId = 'ai' | 'connect' | 'preset' | 'policy-token' | 'activity'
export type AgentExperienceState = 'empty' | 'partial' | 'active'

export interface AgentExperienceSetupInput {
  /** From agent activity, over the last 30 days. */
  skillLoads: number
  actions: number
  denials: number
  /** Presets, templates excluded. */
  presets: number
  policyTokens: number
  aiFeaturesEnabled: boolean
  /** The Copilot's own switch. "Turn on AI" turns on both. */
  copilotEnabled: boolean
}

export interface AgentExperienceSetup {
  state: AgentExperienceState
  /** In display order. */
  steps: { id: AgentExperienceStepId; done: boolean }[]
  doneCount: number
  /** The one step to highlight, or null when everything is done. */
  nextStep: AgentExperienceStepId | null
}

// AI comes first: the Copilot and saving a preset both need AI features on.
const ORDER: AgentExperienceStepId[] = ['ai', 'connect', 'preset', 'policy-token', 'activity']

export function computeAgentExperienceSetup(input: AgentExperienceSetupInput): AgentExperienceSetup {
  const connected = input.skillLoads + input.actions + input.denials > 0
  const done: Record<AgentExperienceStepId, boolean> = {
    connect: connected,
    preset: input.presets > 0,
    'policy-token': input.policyTokens > 0,
    // One step for two switches: AI features and the Copilot.
    ai: input.aiFeaturesEnabled && input.copilotEnabled,
    activity: input.actions + input.denials > 0,
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

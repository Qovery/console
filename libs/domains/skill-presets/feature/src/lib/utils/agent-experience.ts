/**
 * The setup state of Agent Experience, from what the organization already has. No new signal:
 * "connected" means agents have loaded a skill or acted on Qovery, as agent activity reports it.
 */

export type AgentExperienceStepId = 'connect' | 'preset' | 'policy-token' | 'ai-features' | 'activity'
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
}

export interface AgentExperienceSetup {
  state: AgentExperienceState
  /** In display order. */
  steps: { id: AgentExperienceStepId; done: boolean }[]
  doneCount: number
  /** The one step to highlight, or null when everything is done. */
  nextStep: AgentExperienceStepId | null
}

const DISPLAY_ORDER: AgentExperienceStepId[] = ['connect', 'preset', 'policy-token', 'ai-features', 'activity']
// Presets can only be saved with AI features on, so turning them on comes before creating one.
const PRIORITY: AgentExperienceStepId[] = ['connect', 'ai-features', 'preset', 'policy-token', 'activity']

export function computeAgentExperienceSetup(input: AgentExperienceSetupInput): AgentExperienceSetup {
  const connected = input.skillLoads + input.actions + input.denials > 0
  const done: Record<AgentExperienceStepId, boolean> = {
    connect: connected,
    preset: input.presets > 0,
    'policy-token': input.policyTokens > 0,
    'ai-features': input.aiFeaturesEnabled,
    activity: input.actions + input.denials > 0,
  }
  const state: AgentExperienceState =
    connected && done.preset && done['policy-token']
      ? 'active'
      : !connected && !done.preset && !done['policy-token']
        ? 'empty'
        : 'partial'
  const steps = DISPLAY_ORDER.map((id) => ({ id, done: done[id] }))
  return {
    state,
    steps,
    doneCount: steps.filter((step) => step.done).length,
    nextStep: PRIORITY.find((id) => !done[id]) ?? null,
  }
}

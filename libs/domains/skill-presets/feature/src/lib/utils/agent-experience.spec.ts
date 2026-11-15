import { computeAgentExperienceSetup } from './agent-experience'

const nothing = {
  skillLoads: 0,
  actions: 0,
  denials: 0,
  presets: 0,
  policyTokens: 0,
  aiFeaturesEnabled: false,
  copilotEnabled: false,
}

describe('computeAgentExperienceSetup', () => {
  it('is empty the first time, and asks to turn on AI features first', () => {
    const setup = computeAgentExperienceSetup(nothing)
    expect(setup.state).toBe('empty')
    expect(setup.doneCount).toBe(0)
    expect(setup.nextStep).toBe('ai-features')
    expect(computeAgentExperienceSetup({ ...nothing, aiFeaturesEnabled: true }).nextStep).toBe('connect')
  })

  it('counts the Copilot as on only with AI features on', () => {
    const copilotOnly = computeAgentExperienceSetup({ ...nothing, copilotEnabled: true })
    expect(copilotOnly.steps.find(({ id }) => id === 'copilot')?.done).toBe(false)
    const both = computeAgentExperienceSetup({ ...nothing, copilotEnabled: true, aiFeaturesEnabled: true })
    expect(both.steps.find(({ id }) => id === 'copilot')?.done).toBe(true)
  })

  it('is partial once agents load skills, and asks for AI features before a preset', () => {
    const setup = computeAgentExperienceSetup({ ...nothing, skillLoads: 12 })
    expect(setup.state).toBe('partial')
    expect(setup.nextStep).toBe('ai-features')
    expect(computeAgentExperienceSetup({ ...nothing, skillLoads: 12, aiFeaturesEnabled: true }).nextStep).toBe('preset')
  })

  it('counts a preset or a policy token alone as partial', () => {
    expect(computeAgentExperienceSetup({ ...nothing, presets: 1 }).state).toBe('partial')
    expect(computeAgentExperienceSetup({ ...nothing, policyTokens: 1 }).state).toBe('partial')
  })

  it('is active with agents, a preset and a policy token', () => {
    const setup = computeAgentExperienceSetup({
      skillLoads: 40,
      actions: 9,
      denials: 1,
      presets: 2,
      policyTokens: 1,
      aiFeaturesEnabled: true,
      copilotEnabled: true,
    })
    expect(setup.state).toBe('active')
    expect(setup.doneCount).toBe(6)
    expect(setup.nextStep).toBeNull()
  })
})

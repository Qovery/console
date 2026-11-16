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
  it('is empty the first time, and asks to turn on AI first', () => {
    const setup = computeAgentExperienceSetup(nothing)
    expect(setup.state).toBe('empty')
    expect(setup.steps.map(({ id }) => id)).toEqual(['ai', 'connect', 'preset', 'policy-token'])
    expect(setup.doneCount).toBe(0)
    expect(setup.nextStep).toBe('ai')
  })

  it('counts AI as on only when AI features and the Copilot are both on', () => {
    const ai = (input: Partial<typeof nothing>) =>
      computeAgentExperienceSetup({ ...nothing, ...input }).steps.find(({ id }) => id === 'ai')?.done
    expect(ai({ aiFeaturesEnabled: true })).toBe(false)
    expect(ai({ copilotEnabled: true })).toBe(false)
    expect(ai({ aiFeaturesEnabled: true, copilotEnabled: true })).toBe(true)
    expect(computeAgentExperienceSetup({ ...nothing, aiFeaturesEnabled: true, copilotEnabled: true }).nextStep).toBe(
      'connect'
    )
  })

  it('is partial once agents load skills, and asks for AI features before a preset', () => {
    const setup = computeAgentExperienceSetup({ ...nothing, skillLoads: 12 })
    expect(setup.state).toBe('partial')
    expect(setup.nextStep).toBe('ai')
    expect(
      computeAgentExperienceSetup({ ...nothing, skillLoads: 12, aiFeaturesEnabled: true, copilotEnabled: true })
        .nextStep
    ).toBe('preset')
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
    expect(setup.doneCount).toBe(4)
    expect(setup.nextStep).toBeNull()
  })
})

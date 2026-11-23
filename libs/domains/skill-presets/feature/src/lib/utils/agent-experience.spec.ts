import { computeAgentExperienceSetup } from './agent-experience'

const nothing = { skillLoads: 0, actions: 0, denials: 0, presets: 0, policyTokens: 0 }

describe('computeAgentExperienceSetup', () => {
  it('is empty the first time, and starts with a custom preset', () => {
    const setup = computeAgentExperienceSetup(nothing)
    expect(setup.state).toBe('empty')
    expect(setup.steps.map(({ id }) => id)).toEqual(['preset', 'policy-token', 'connect'])
    expect(setup.doneCount).toBe(0)
    expect(setup.nextStep).toBe('preset')
  })

  it('is partial once agents load skills, and still asks for a preset first', () => {
    const setup = computeAgentExperienceSetup({ ...nothing, skillLoads: 12 })
    expect(setup.state).toBe('partial')
    expect(setup.nextStep).toBe('preset')
    expect(setup.steps.find(({ id }) => id === 'connect')?.done).toBe(true)
  })

  it('counts an action alone as connected', () => {
    const setup = computeAgentExperienceSetup({ ...nothing, actions: 1 })
    expect(setup.state).toBe('partial')
    expect(setup.steps.find(({ id }) => id === 'connect')?.done).toBe(true)
  })

  it('counts a denial alone as connected', () => {
    const setup = computeAgentExperienceSetup({ ...nothing, denials: 1 })
    expect(setup.state).toBe('partial')
    expect(setup.steps.find(({ id }) => id === 'connect')?.done).toBe(true)
  })

  it('asks to connect an agent last', () => {
    expect(computeAgentExperienceSetup({ ...nothing, presets: 1, policyTokens: 1 }).nextStep).toBe('connect')
  })

  it('counts a preset or a policy token alone as partial', () => {
    expect(computeAgentExperienceSetup({ ...nothing, presets: 1 }).state).toBe('partial')
    expect(computeAgentExperienceSetup({ ...nothing, policyTokens: 1 }).state).toBe('partial')
  })

  it('is active with agents, a preset and a policy token', () => {
    const setup = computeAgentExperienceSetup({ skillLoads: 40, actions: 9, denials: 1, presets: 2, policyTokens: 1 })
    expect(setup.state).toBe('active')
    expect(setup.doneCount).toBe(3)
    expect(setup.nextStep).toBeNull()
  })
})

import { StateEnum } from 'qovery-typescript-axios'
import { hasAnyDeployedService, hasAnyEnvironment } from './use-onboarding-completion'

describe('hasAnyEnvironment', () => {
  it('returns true when any project contains an environment', () => {
    expect(hasAnyEnvironment([[], [{ id: 'environment-2' }]])).toBe(true)
  })

  it('returns false when no project contains an environment', () => {
    expect(hasAnyEnvironment([[], undefined])).toBe(false)
  })
})

describe('hasAnyDeployedService', () => {
  it('returns true when any environment contains a deployed service', () => {
    expect(
      hasAnyDeployedService([
        { applications: [{ state: StateEnum.STOPPED }] },
        { containers: [{ state: StateEnum.DEPLOYED }] },
      ])
    ).toBe(true)
  })

  it('returns false when no environment has a deployed service', () => {
    expect(
      hasAnyDeployedService([
        { applications: [{ state: StateEnum.STOPPED }] },
        { jobs: [{ state: StateEnum.DEPLOYMENT_ERROR }] },
      ])
    ).toBe(false)
  })

  it('returns false when service statuses are unavailable', () => {
    expect(hasAnyDeployedService([undefined])).toBe(false)
  })
})

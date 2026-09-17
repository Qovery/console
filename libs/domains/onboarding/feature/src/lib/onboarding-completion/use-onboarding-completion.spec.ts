import { useQueries } from '@tanstack/react-query'
import { StateEnum } from 'qovery-typescript-axios'
import { renderHook } from '@qovery/shared/util-tests'
import { hasAnyDeployedService, hasAnyEnvironment, useOnboardingCompletion } from './use-onboarding-completion'

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest.fn(),
}))

const mockedUseQueries = jest.mocked(useQueries)

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

  it('returns true when an environment contains a deployed agentic workflow', () => {
    expect(hasAnyDeployedService([{ agentic_workflows: [{ state: StateEnum.DEPLOYED }] }])).toBe(true)
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

describe('useOnboardingCompletion', () => {
  beforeEach(() => {
    mockedUseQueries.mockReset()
  })

  it('polls service statuses while onboarding is active', () => {
    mockedUseQueries
      .mockReturnValueOnce([{ data: [{ id: 'environment-1' }] }] as never)
      .mockReturnValueOnce([] as never)

    renderHook(() => useOnboardingCompletion({ projectIds: ['project-1'], enabled: true }))

    expect(mockedUseQueries).toHaveBeenNthCalledWith(2, {
      queries: [expect.objectContaining({ enabled: true, refetchInterval: 3000 })],
    })
  })

  it('stops polling service statuses when onboarding is inactive', () => {
    mockedUseQueries
      .mockReturnValueOnce([{ data: [{ id: 'environment-1' }] }] as never)
      .mockReturnValueOnce([] as never)

    renderHook(() => useOnboardingCompletion({ projectIds: ['project-1'], enabled: false }))

    expect(mockedUseQueries).toHaveBeenNthCalledWith(2, {
      queries: [expect.objectContaining({ enabled: false, refetchInterval: undefined })],
    })
  })
})

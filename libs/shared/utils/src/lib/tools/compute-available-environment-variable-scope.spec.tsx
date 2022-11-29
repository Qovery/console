import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { computeAvailableScope, getScopeHierarchy } from './compute-available-environment-variable-scope'

describe('computeAvailableEnvironmentVariableScope', () => {
  describe('when the scope is not set', () => {
    it('should return all scope except BUILT_IN', () => {
      const scope = computeAvailableScope(undefined, false)
      expect(scope).toEqual([
        APIVariableScopeEnum.PROJECT,
        APIVariableScopeEnum.ENVIRONMENT,
        APIVariableScopeEnum.APPLICATION,
      ])
    })

    it('should return all scope with BUILT_IN', () => {
      const scope = computeAvailableScope(undefined, true)
      expect(scope).toEqual([
        APIVariableScopeEnum.BUILT_IN,
        APIVariableScopeEnum.PROJECT,
        APIVariableScopeEnum.ENVIRONMENT,
        APIVariableScopeEnum.APPLICATION,
      ])
    })
  })

  describe('when the scope is set', () => {
    const scope = APIVariableScopeEnum.ENVIRONMENT
    it('should return all scope at the same level and below Environment', () => {
      const scopes = computeAvailableScope(scope, false)
      expect(scopes).toEqual([APIVariableScopeEnum.ENVIRONMENT, APIVariableScopeEnum.APPLICATION])
    })
  })
})

describe('getScopeHierarchy', () => {
  it('should return -1 when the scope is not set', () => {
    const hierarchy = getScopeHierarchy()
    expect(hierarchy).toBe(-1)
  })

  it('should return the hierarchy of the scope', () => {
    const hierarchy = getScopeHierarchy(APIVariableScopeEnum.ENVIRONMENT)
    expect(hierarchy).toBe(2)
  })
})

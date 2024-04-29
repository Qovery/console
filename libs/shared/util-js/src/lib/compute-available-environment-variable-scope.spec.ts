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
    it('should return all scope with BUILT_IN - ENVIRONMENT range', () => {
      const scopes = computeAvailableScope(undefined, true, 'ENVIRONMENT')
      expect(scopes).toEqual([
        APIVariableScopeEnum.BUILT_IN,
        APIVariableScopeEnum.PROJECT,
        APIVariableScopeEnum.ENVIRONMENT,
      ])
    })
    it('should return only one PROJECT scope', () => {
      const scopes = computeAvailableScope(undefined, false, 'PROJECT')
      expect(scopes).toEqual([APIVariableScopeEnum.PROJECT])
    })
  })

  describe('when the scope is set', () => {
    const scope = APIVariableScopeEnum.ENVIRONMENT
    it('should return all scope at the same level and below Environment', () => {
      const scopes = computeAvailableScope(scope, false)
      expect(scopes).toEqual([APIVariableScopeEnum.ENVIRONMENT, APIVariableScopeEnum.APPLICATION])
    })
    it('should return all scope at the same level', () => {
      const scopes = computeAvailableScope(scope, false, 'ENVIRONMENT')
      expect(scopes).toEqual([APIVariableScopeEnum.ENVIRONMENT])
    })
  })

  describe('when the scope is set and currentScope is excluded', () => {
    const scope = APIVariableScopeEnum.ENVIRONMENT
    it('should return all scope at the same level and below Environment', () => {
      const scopes = computeAvailableScope(scope, false, undefined, true)
      expect(scopes).toEqual([APIVariableScopeEnum.APPLICATION])
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

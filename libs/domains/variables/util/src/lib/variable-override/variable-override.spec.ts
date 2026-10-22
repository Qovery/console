import { type VariableResponse } from 'qovery-typescript-axios'
import { canOverrideConflictingVariable, getOverridesByParentId, getVariableScopeRank } from './variable-override'

describe('getVariableScopeRank', () => {
  it('ranks project above environment above services', () => {
    expect(getVariableScopeRank('PROJECT')).toBe(1)
    expect(getVariableScopeRank('ENVIRONMENT')).toBe(2)
    expect(getVariableScopeRank('CONTAINER')).toBe(3)
  })

  it('has no rank for built-in or missing scopes', () => {
    expect(getVariableScopeRank('BUILT_IN')).toBeUndefined()
    expect(getVariableScopeRank(undefined)).toBeUndefined()
  })
})

describe('canOverrideConflictingVariable', () => {
  const request = { variable_scope: 'APPLICATION' as const, is_secret: false }

  it('accepts a value variable at a higher scope with the same secret kind', () => {
    expect(
      canOverrideConflictingVariable({ scope: 'ENVIRONMENT', variable_type: 'VALUE', is_secret: false }, request)
    ).toBe(true)
  })

  it('accepts file and override variables', () => {
    expect(canOverrideConflictingVariable({ scope: 'PROJECT', variable_type: 'FILE', is_secret: false }, request)).toBe(
      true
    )
    expect(
      canOverrideConflictingVariable({ scope: 'ENVIRONMENT', variable_type: 'OVERRIDE', is_secret: false }, request)
    ).toBe(true)
  })

  it('rejects a variable at the same or a lower scope', () => {
    expect(
      canOverrideConflictingVariable({ scope: 'APPLICATION', variable_type: 'VALUE', is_secret: false }, request)
    ).toBe(false)
    expect(
      canOverrideConflictingVariable(
        { scope: 'ENVIRONMENT', variable_type: 'VALUE', is_secret: false },
        { variable_scope: 'PROJECT', is_secret: false }
      )
    ).toBe(false)
  })

  it('rejects a different secret kind or an unknown one', () => {
    expect(
      canOverrideConflictingVariable({ scope: 'ENVIRONMENT', variable_type: 'VALUE', is_secret: true }, request)
    ).toBe(false)
    expect(canOverrideConflictingVariable({ scope: 'ENVIRONMENT', variable_type: 'VALUE' }, request)).toBe(false)
  })

  it('rejects aliases, external secrets and unknown types', () => {
    expect(
      canOverrideConflictingVariable({ scope: 'ENVIRONMENT', variable_type: 'ALIAS', is_secret: false }, request)
    ).toBe(false)
    expect(
      canOverrideConflictingVariable(
        { scope: 'ENVIRONMENT', variable_type: 'EXTERNAL_SECRET', is_secret: false },
        request
      )
    ).toBe(false)
    expect(canOverrideConflictingVariable({ scope: 'ENVIRONMENT', is_secret: false }, request)).toBe(false)
  })
})

describe('getOverridesByParentId', () => {
  it('maps each overridden variable id to its override', () => {
    const parent = { id: 'parent', key: 'FOO', scope: 'ENVIRONMENT' } as VariableResponse
    const override = {
      id: 'override',
      key: 'FOO',
      scope: 'APPLICATION',
      overridden_variable: { id: 'parent', key: 'FOO', mount_path: '', scope: 'ENVIRONMENT' },
    } as VariableResponse

    const result = getOverridesByParentId([parent, override])

    expect(result.size).toBe(1)
    expect(result.get('parent')).toBe(override)
  })
})

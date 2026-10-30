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
  const request = { key: 'LOG_LEVEL', variable_scope: 'APPLICATION' as const, is_secret: false }

  it('accepts a value variable at a higher scope with the same secret kind', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'ENVIRONMENT', variable_type: 'VALUE', is_secret: false },
        request
      )
    ).toBe(true)
  })

  it('accepts a file when the request is a file', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'PROJECT', variable_type: 'FILE', is_secret: false },
        { ...request, mount_path: '/app/config' }
      )
    ).toBe(true)
  })

  it('rejects a file when the request is a value, and a value when the request is a file', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'PROJECT', variable_type: 'FILE', is_secret: false },
        request
      )
    ).toBe(false)
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'PROJECT', variable_type: 'VALUE', is_secret: false },
        { ...request, mount_path: '/app/config' }
      )
    ).toBe(false)
  })

  it('rejects an existing override, whose kind the 409 body does not give', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'ENVIRONMENT', variable_type: 'OVERRIDE', is_secret: false },
        request
      )
    ).toBe(false)
  })

  it('rejects a variable with another key, e.g. a mount path conflict', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'OTHER_FILE', scope: 'ENVIRONMENT', variable_type: 'FILE', is_secret: false },
        request
      )
    ).toBe(false)
  })

  it('rejects a variable at the same or a lower scope', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'APPLICATION', variable_type: 'VALUE', is_secret: false },
        request
      )
    ).toBe(false)
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'ENVIRONMENT', variable_type: 'VALUE', is_secret: false },
        { key: 'LOG_LEVEL', variable_scope: 'PROJECT', is_secret: false }
      )
    ).toBe(false)
  })

  it('rejects a different secret kind', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'ENVIRONMENT', variable_type: 'VALUE', is_secret: true },
        request
      )
    ).toBe(false)
  })

  it('rejects aliases, external secrets and built-in variables', () => {
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'ENVIRONMENT', variable_type: 'ALIAS', is_secret: false },
        request
      )
    ).toBe(false)
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'ENVIRONMENT', variable_type: 'EXTERNAL_SECRET', is_secret: false },
        request
      )
    ).toBe(false)
    expect(
      canOverrideConflictingVariable(
        { key: 'LOG_LEVEL', scope: 'BUILT_IN', variable_type: 'BUILT_IN', is_secret: false },
        request
      )
    ).toBe(false)
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

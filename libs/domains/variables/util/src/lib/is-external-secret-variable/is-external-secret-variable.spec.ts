import { type VariableResponse } from 'qovery-typescript-axios'
import { isExternalSecretVariable } from './is-external-secret-variable'

const baseVariable = {
  id: 'var-1',
  key: 'MY_VAR',
  value: 'value',
  scope: 'APPLICATION',
} as VariableResponse

describe('isExternalSecretVariable', () => {
  it('should return true for EXTERNAL_SECRET variables', () => {
    expect(isExternalSecretVariable({ ...baseVariable, variable_type: 'EXTERNAL_SECRET' })).toBe(true)
  })

  it('should return true for EXTERNAL_SECRET variables mounted as files', () => {
    expect(
      isExternalSecretVariable({
        ...baseVariable,
        variable_type: 'EXTERNAL_SECRET',
        mount_path: '/vault/secrets/credentials',
      })
    ).toBe(true)
  })

  it.each(['VALUE', 'FILE', 'ALIAS', 'OVERRIDE'] as const)('should return false for %s variables', (variable_type) => {
    expect(isExternalSecretVariable({ ...baseVariable, variable_type })).toBe(false)
  })
})

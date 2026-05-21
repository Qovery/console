import { type VariableResponse } from 'qovery-typescript-axios'
import { isExternalSecretVariable } from './is-external-secret-variable'

const baseVariable = {
  id: 'var-1',
  key: 'MY_VAR',
  value: 'value',
  scope: 'APPLICATION',
} as VariableResponse

describe('isExternalSecretVariable', () => {
  it.each(['EXTERNAL_SECRET', 'FILE_EXTERNAL_SECRET'] as const)(
    'should return true for %s variables',
    (variable_type) => {
      expect(isExternalSecretVariable({ ...baseVariable, variable_type })).toBe(true)
    }
  )

  it.each(['VALUE', 'FILE', 'ALIAS', 'OVERRIDE'] as const)(
    'should return false for %s variables',
    (variable_type) => {
      expect(isExternalSecretVariable({ ...baseVariable, variable_type })).toBe(false)
    }
  )
})

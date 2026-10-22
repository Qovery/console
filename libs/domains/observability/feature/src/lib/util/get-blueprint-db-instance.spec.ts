import { type VariableResponse } from 'qovery-typescript-axios'
import { getBlueprintDbInstance } from './get-blueprint-db-instance'

describe('getBlueprintDbInstance', () => {
  const serviceId = '8e7407e2-7663-4ad3-ae40-00c0c12d4efd'
  const output = {
    key: 'QOVERY_OUTPUT_TERRAFORM_Z8E7407E2_DB_IDENTIFIER',
    value: 'test-pg-mysql',
    is_secret: false,
  } satisfies Pick<VariableResponse, 'key' | 'value' | 'is_secret'>

  it('reads the database identifier from the matching Terraform output', () => {
    expect(getBlueprintDbInstance(serviceId, [output])).toBe('test-pg-mysql')
  })

  it('ignores another service output and secrets', () => {
    expect(
      getBlueprintDbInstance(serviceId, [{ ...output, key: 'QOVERY_OUTPUT_TERRAFORM_ZOTHER_DB_IDENTIFIER' }])
    ).toBeUndefined()
    expect(getBlueprintDbInstance(serviceId, [{ ...output, is_secret: true }])).toBeUndefined()
  })

  it('rejects values that cannot safely be used in a PromQL selector', () => {
    expect(getBlueprintDbInstance(serviceId, [{ ...output, value: 'db"} or vector(1)' }])).toBeUndefined()
    expect(getBlueprintDbInstance(serviceId, [{ ...output, value: null }])).toBeUndefined()
  })
})

import { type FieldSchemaResponse } from 'qovery-typescript-axios'
import {
  applyPlatformConfigurationDefaults,
  getFieldViolation,
  getPlatformFieldPaths,
  getUnmappedViolations,
  isPlatformConfigurationReady,
  omitEmptyValues,
  toPlatformCloudVendor,
  toPlatformClusterMode,
  toPlatformConfigurationValue,
  updateComponentValue,
} from './platform-configuration-utils'

const scalarField = (key: string, type: 'string' | 'number' | 'bool', defaultValue: string | null = null) =>
  ({ key, label: key, type, required: false, sensitive: false, defaultValue, constraints: {} }) as FieldSchemaResponse

const listenersField = {
  key: 'listeners',
  label: 'Listeners',
  type: 'array',
  required: false,
  sensitive: false,
  constraints: {},
  items: { type: 'object', fields: [scalarField('port', 'number')] },
  itemFields: [],
} as unknown as FieldSchemaResponse

const tlsField = {
  key: 'tls',
  label: 'TLS',
  type: 'object',
  required: false,
  sensitive: false,
  constraints: {},
  fields: [scalarField('secret', 'string')],
} as unknown as FieldSchemaResponse

describe('platform configuration utils', () => {
  it('maps clusters to the platform vocabulary', () => {
    expect(toPlatformClusterMode('MANAGED')).toBe('QOVERY_MANAGED')
    expect(toPlatformClusterMode('SELF_MANAGED')).toBe('CUSTOMER_MANAGED')
    expect(toPlatformClusterMode('PARTIALLY_MANAGED')).toBeUndefined()
    expect(toPlatformCloudVendor('ON_PREMISE')).toBe('UNKNOWN')
    expect(toPlatformCloudVendor('AWS')).toBe('AWS')
    expect(toPlatformCloudVendor(undefined)).toBeUndefined()
  })

  it('fills scalar defaults without overriding values', () => {
    const fields = [scalarField('retention', 'number', '12'), scalarField('enabled', 'bool', 'true')]

    expect(applyPlatformConfigurationDefaults(fields, {})).toEqual({ retention: 12, enabled: true })
    expect(applyPlatformConfigurationDefaults(fields, { retention: '' })).toEqual({ retention: '', enabled: true })
  })

  it('converts number inputs, keeping cleared and invalid values', () => {
    const numberField = { type: 'number' as const }

    expect(toPlatformConfigurationValue(numberField, '24')).toBe(24)
    expect(toPlatformConfigurationValue(numberField, ' ')).toBe('')
    expect(toPlatformConfigurationValue(numberField, '1e')).toBe('1e')
    expect(toPlatformConfigurationValue(numberField, true)).toBeUndefined()
    expect(toPlatformConfigurationValue({ type: 'string' }, 'value')).toBe('value')
  })

  it('omits empty values while keeping array rows in place', () => {
    expect(
      omitEmptyValues({ name: '', port: undefined, tls: { secret: '' }, listeners: [{ port: '' }, { port: 80 }] })
    ).toEqual({ tls: {}, listeners: [{}, { port: 80 }] })
  })

  it('sets and unsets a component value', () => {
    const values = updateComponentValue({ loki: { retention: 12 } }, 'loki', 'storage', 's3')

    expect(values).toEqual({ loki: { retention: 12, storage: 's3' } })
    expect(updateComponentValue(values, 'loki', 'retention', undefined)).toEqual({ loki: { storage: 's3' } })
  })

  it('lists the paths of nested fields and array rows', () => {
    expect(getPlatformFieldPaths([tlsField, listenersField], { listeners: [{ port: 80 }] })).toEqual([
      'tls',
      'tls.secret',
      'listeners',
      'listeners[0]',
      'listeners[0].port',
    ])
  })

  it('maps violations to fields and cluster inputs', () => {
    const violations = [
      { fieldPath: 'tls.secret', code: 'REQUIRED', message: 'Secret is required.' },
      { fieldPath: 'clusterInputs.domain', code: 'REQUIRED', message: 'Domain is required.' },
      { fieldPath: 'unknown', code: 'INVALID', message: 'Something is wrong.' },
    ]
    const requirements = [{ key: 'domain', status: 'MISSING' }] as never

    expect(getFieldViolation(violations, 'tls.secret')).toBe('Secret is required.')
    expect(getFieldViolation(violations, 'domain', 'clusterInputs')).toBe('Domain is required.')
    expect(getUnmappedViolations(violations, [tlsField], {}, requirements)).toEqual([violations[2]])
  })

  it('is ready without violations and with every requirement ready', () => {
    expect(isPlatformConfigurationReady([], [{ key: 'domain', status: 'READY' }] as never)).toBe(true)
    expect(isPlatformConfigurationReady([], [{ key: 'domain', status: 'MISSING' }] as never)).toBe(false)
    expect(isPlatformConfigurationReady([{ fieldPath: 'storage', code: 'REQUIRED', message: 'Required.' }], [])).toBe(
      false
    )
  })
})

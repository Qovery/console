import {
  formatSchemaFieldKey,
  getSchemaFieldBooleanValue,
  getSchemaFieldLengthValidationError,
  getSchemaFieldNumberValidationError,
  getSchemaFieldStringValue,
  getSchemaFieldSummaryValue,
  getSchemaFieldValidationError,
  getSchemaFieldValue,
  isSchemaFieldValid,
  isSchemaFieldValueFulfilled,
  isSchemaFieldValueMatchingPattern,
} from './schema-field'

describe('formatSchemaFieldKey', () => {
  it('formats snake_case and kebab-case keys into a readable label', () => {
    expect(formatSchemaFieldKey('database_name')).toBe('Database name')
    expect(formatSchemaFieldKey('log-storage')).toBe('Log storage')
    expect(formatSchemaFieldKey('CUSTOMER_MANAGED')).toBe('CUSTOMER MANAGED')
  })
})

describe('schema field value coercion', () => {
  it('returns string and boolean values with safe fallbacks', () => {
    expect(getSchemaFieldStringValue('value')).toBe('value')
    expect(getSchemaFieldStringValue(true)).toBe('')
    expect(getSchemaFieldStringValue(undefined)).toBe('')
    expect(getSchemaFieldBooleanValue(true)).toBe(true)
    expect(getSchemaFieldBooleanValue('value')).toBe(false)
    expect(getSchemaFieldBooleanValue(undefined)).toBe(false)
  })

  it('resolves values against the field default without losing their type', () => {
    expect(getSchemaFieldValue({ type: 'number', defaultValue: '12' }, undefined)).toBe('12')
    expect(getSchemaFieldValue({ type: 'number', defaultValue: '12' }, 24)).toBe('24')
    expect(getSchemaFieldValue({ type: 'bool', defaultValue: 'true' }, undefined)).toBe(true)
    expect(getSchemaFieldValue({ type: 'bool' }, 'false')).toBe(false)
    expect(getSchemaFieldValue({ type: 'bool' }, undefined)).toBeUndefined()
    expect(getSchemaFieldValue({ type: 'string', defaultValue: null }, undefined)).toBeUndefined()
    expect(getSchemaFieldValue({ type: 'string' }, { unexpected: true })).toBeUndefined()
  })
})

describe('schema field validation', () => {
  it('treats booleans and non-blank strings as fulfilled', () => {
    expect(isSchemaFieldValueFulfilled(false)).toBe(true)
    expect(isSchemaFieldValueFulfilled('value')).toBe(true)
    expect(isSchemaFieldValueFulfilled('   ')).toBe(false)
    expect(isSchemaFieldValueFulfilled(undefined)).toBe(false)
  })

  it('matches values against the field pattern and ignores broken patterns', () => {
    expect(isSchemaFieldValueMatchingPattern({ pattern: '^[a-z]+$' }, 'value')).toBe(true)
    expect(isSchemaFieldValueMatchingPattern({ pattern: '^[a-z]+$' }, 'Value')).toBe(false)
    expect(isSchemaFieldValueMatchingPattern({ pattern: '(' }, 'value')).toBe(true)
    expect(isSchemaFieldValueMatchingPattern({}, 'value')).toBe(true)
    expect(isSchemaFieldValueMatchingPattern({ pattern: '^[a-z]+$' }, undefined)).toBe(true)
  })

  it('reports length violations with a dedicated message', () => {
    expect(getSchemaFieldLengthValidationError({ minLength: 2, maxLength: 4 }, 'value')).toBe(
      'Value must be between 2 and 4 characters.'
    )
    expect(getSchemaFieldLengthValidationError({ minLength: 8 }, 'value')).toBe('Value must be at least 8 characters.')
    expect(getSchemaFieldLengthValidationError({ maxLength: 3 }, 'value')).toBe('Value must be at most 3 characters.')
    expect(getSchemaFieldLengthValidationError({ minLength: 2, maxLength: 8 }, 'value')).toBeUndefined()
    expect(getSchemaFieldLengthValidationError({ minLength: 2 }, undefined)).toBeUndefined()
  })

  it('reports numeric violations with a dedicated message', () => {
    expect(getSchemaFieldNumberValidationError({ type: 'number', min: 20, max: 65536 }, '19')).toBe(
      'Value must be between 20 and 65536.'
    )
    expect(getSchemaFieldNumberValidationError({ type: 'number', min: 20 }, '19')).toBe('Value must be at least 20.')
    expect(getSchemaFieldNumberValidationError({ type: 'number', max: 65536 }, '65537')).toBe(
      'Value must be at most 65536.'
    )
    expect(getSchemaFieldNumberValidationError({ type: 'number' }, 'not-a-number')).toBe('Value must be a number.')
    expect(getSchemaFieldNumberValidationError({ type: 'number', min: 20, max: 65536 }, '20')).toBeUndefined()
    expect(getSchemaFieldNumberValidationError({ type: 'string', min: 20 }, '19')).toBeUndefined()
  })

  it('combines length and pattern checks into one validation error', () => {
    expect(getSchemaFieldValidationError({ type: 'string', maxLength: 3, pattern: '^[a-z]+$' }, 'value')).toBe(
      'Value must be at most 3 characters.'
    )
    expect(getSchemaFieldValidationError({ type: 'string', pattern: '^[a-z]+$' }, 'Value')).toBe(
      'Value does not match the expected format.'
    )
    expect(getSchemaFieldValidationError({ type: 'string', pattern: '^[a-z]+$' }, 'value')).toBeUndefined()
  })

  it('rejects values outside the allowed values', () => {
    const field = { type: 'string' as const, allowedValues: ['pvc', 's3'] }

    expect(getSchemaFieldValidationError(field, 'gcs')).toBe('Please select one of the allowed values.')
    expect(getSchemaFieldValidationError(field, 's3')).toBeUndefined()
    expect(getSchemaFieldValidationError(field, '')).toBeUndefined()
    expect(getSchemaFieldValidationError({ type: 'bool', allowedValues: ['true'] }, false)).toBeUndefined()
  })

  it('validates required state and constraints together', () => {
    expect(isSchemaFieldValid({ type: 'string', required: true }, undefined)).toBe(false)
    expect(isSchemaFieldValid({ type: 'string', required: true }, 'value')).toBe(true)
    expect(isSchemaFieldValid({ type: 'string', required: false, pattern: '^[a-z]+$' }, 'Value')).toBe(false)
    expect(isSchemaFieldValid({ type: 'string', required: false }, undefined)).toBe(true)
  })
})

describe('getSchemaFieldSummaryValue', () => {
  it('renders booleans as enabled state and masks sensitive values', () => {
    expect(getSchemaFieldSummaryValue({}, true)).toBe('Enabled')
    expect(getSchemaFieldSummaryValue({}, false)).toBe('Disabled')
    expect(getSchemaFieldSummaryValue({ sensitive: true }, 'secret')).toBe('••••••••')
    expect(getSchemaFieldSummaryValue({ sensitive: true }, '')).toBe('')
    expect(getSchemaFieldSummaryValue({ sensitive: false }, 'value')).toBe('value')
  })
})

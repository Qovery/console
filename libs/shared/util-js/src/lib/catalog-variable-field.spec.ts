import {
  formatCatalogKey,
  getCatalogBooleanValue,
  getCatalogFieldLengthValidationError,
  getCatalogFieldNumberValidationError,
  getCatalogFieldValidationError,
  getCatalogStringValue,
  getCatalogSummaryFieldValue,
  getCatalogVariableValue,
  isCatalogFieldValid,
  isCatalogFieldValueFulfilled,
  isCatalogFieldValueMatchingPattern,
} from './catalog-variable-field'

describe('formatCatalogKey', () => {
  it('formats snake_case and kebab-case keys into a readable label', () => {
    expect(formatCatalogKey('database_name')).toBe('Database name')
    expect(formatCatalogKey('log-storage')).toBe('Log storage')
    expect(formatCatalogKey('CUSTOMER_MANAGED')).toBe('CUSTOMER MANAGED')
  })
})

describe('catalog value coercion', () => {
  it('returns string and boolean values with safe fallbacks', () => {
    expect(getCatalogStringValue('value')).toBe('value')
    expect(getCatalogStringValue(true)).toBe('')
    expect(getCatalogStringValue(undefined)).toBe('')
    expect(getCatalogBooleanValue(true)).toBe(true)
    expect(getCatalogBooleanValue('value')).toBe(false)
    expect(getCatalogBooleanValue(undefined)).toBe(false)
  })

  it('resolves values against the field default without losing their type', () => {
    expect(getCatalogVariableValue({ type: 'number', defaultValue: '12' }, undefined)).toBe('12')
    expect(getCatalogVariableValue({ type: 'number', defaultValue: '12' }, 24)).toBe('24')
    expect(getCatalogVariableValue({ type: 'bool', defaultValue: 'true' }, undefined)).toBe(true)
    expect(getCatalogVariableValue({ type: 'bool' }, 'false')).toBe(false)
    expect(getCatalogVariableValue({ type: 'bool' }, undefined)).toBeUndefined()
    expect(getCatalogVariableValue({ type: 'string', defaultValue: null }, undefined)).toBeUndefined()
    expect(getCatalogVariableValue({ type: 'string' }, { unexpected: true })).toBeUndefined()
  })
})

describe('catalog field validation', () => {
  it('treats booleans and non-blank strings as fulfilled', () => {
    expect(isCatalogFieldValueFulfilled(false)).toBe(true)
    expect(isCatalogFieldValueFulfilled('value')).toBe(true)
    expect(isCatalogFieldValueFulfilled('   ')).toBe(false)
    expect(isCatalogFieldValueFulfilled(undefined)).toBe(false)
  })

  it('matches values against the field pattern and ignores broken patterns', () => {
    expect(isCatalogFieldValueMatchingPattern({ pattern: '^[a-z]+$' }, 'value')).toBe(true)
    expect(isCatalogFieldValueMatchingPattern({ pattern: '^[a-z]+$' }, 'Value')).toBe(false)
    expect(isCatalogFieldValueMatchingPattern({ pattern: '(' }, 'value')).toBe(true)
    expect(isCatalogFieldValueMatchingPattern({}, 'value')).toBe(true)
    expect(isCatalogFieldValueMatchingPattern({ pattern: '^[a-z]+$' }, undefined)).toBe(true)
  })

  it('reports length violations with a dedicated message', () => {
    expect(getCatalogFieldLengthValidationError({ minLength: 2, maxLength: 4 }, 'value')).toBe(
      'Value must be between 2 and 4 characters.'
    )
    expect(getCatalogFieldLengthValidationError({ minLength: 8 }, 'value')).toBe('Value must be at least 8 characters.')
    expect(getCatalogFieldLengthValidationError({ maxLength: 3 }, 'value')).toBe('Value must be at most 3 characters.')
    expect(getCatalogFieldLengthValidationError({ minLength: 2, maxLength: 8 }, 'value')).toBeUndefined()
    expect(getCatalogFieldLengthValidationError({ minLength: 2 }, undefined)).toBeUndefined()
  })

  it('reports numeric violations with a dedicated message', () => {
    expect(getCatalogFieldNumberValidationError({ type: 'number', min: 20, max: 65536 }, '19')).toBe(
      'Value must be between 20 and 65536.'
    )
    expect(getCatalogFieldNumberValidationError({ type: 'number', min: 20 }, '19')).toBe(
      'Value must be at least 20.'
    )
    expect(getCatalogFieldNumberValidationError({ type: 'number', max: 65536 }, '65537')).toBe(
      'Value must be at most 65536.'
    )
    expect(getCatalogFieldNumberValidationError({ type: 'number' }, 'not-a-number')).toBe('Value must be a number.')
    expect(getCatalogFieldNumberValidationError({ type: 'number', min: 20, max: 65536 }, '20')).toBeUndefined()
    expect(getCatalogFieldNumberValidationError({ type: 'string', min: 20 }, '19')).toBeUndefined()
  })

  it('combines length and pattern checks into one validation error', () => {
    expect(getCatalogFieldValidationError({ type: 'string', maxLength: 3, pattern: '^[a-z]+$' }, 'value')).toBe(
      'Value must be at most 3 characters.'
    )
    expect(getCatalogFieldValidationError({ type: 'string', pattern: '^[a-z]+$' }, 'Value')).toBe(
      'Value does not match the expected format.'
    )
    expect(getCatalogFieldValidationError({ type: 'string', pattern: '^[a-z]+$' }, 'value')).toBeUndefined()
  })

  it('validates required state and constraints together', () => {
    expect(isCatalogFieldValid({ type: 'string', required: true }, undefined)).toBe(false)
    expect(isCatalogFieldValid({ type: 'string', required: true }, 'value')).toBe(true)
    expect(isCatalogFieldValid({ type: 'string', required: false, pattern: '^[a-z]+$' }, 'Value')).toBe(false)
    expect(isCatalogFieldValid({ type: 'string', required: false }, undefined)).toBe(true)
  })
})

describe('getCatalogSummaryFieldValue', () => {
  it('renders booleans as enabled state and masks sensitive values', () => {
    expect(getCatalogSummaryFieldValue({}, true)).toBe('Enabled')
    expect(getCatalogSummaryFieldValue({}, false)).toBe('Disabled')
    expect(getCatalogSummaryFieldValue({ sensitive: true }, 'secret')).toBe('••••••••')
    expect(getCatalogSummaryFieldValue({ sensitive: true }, '')).toBe('')
    expect(getCatalogSummaryFieldValue({ sensitive: false }, 'value')).toBe('value')
  })
})

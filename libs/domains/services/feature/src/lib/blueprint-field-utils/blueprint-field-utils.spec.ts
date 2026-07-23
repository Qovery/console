import {
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import {
  formatFieldLabel,
  getBlueprintFieldPath,
  getBooleanFieldValue,
  getDefaultBlueprintFieldValues,
  getDefaultContextFieldValue,
  getDefaultFieldValue,
  getFieldLengthValidationError,
  getFieldNumberValidationError,
  getFieldValidationError,
  getStringFieldValue,
  getSummaryFieldValue,
  isFieldValid,
  isFieldValueFulfilled,
  isFieldValueMatchingPattern,
  isOptionalVariableField,
  isOverridableContextVariableField,
  isRequiredVariableField,
  isVariableField,
} from './blueprint-field-utils'

function createVariableField(overrides: Partial<BlueprintManifestVariableField> = {}): BlueprintManifestVariableField {
  return {
    kind: 'variable',
    name: 'field',
    required: true,
    is_secret: false,
    description: 'Field',
    type: { type: 'string' },
    ...overrides,
  } as BlueprintManifestVariableField
}

function createContextVariableField(
  overrides: Partial<BlueprintManifestContextVariableField> = {}
): BlueprintManifestContextVariableField {
  return {
    kind: 'contextVariable',
    name: 'context_field',
    description: 'Context field',
    source: 'environment',
    value: 'context-value',
    ...overrides,
  } as BlueprintManifestContextVariableField
}

describe('getDefaultBlueprintFieldValues', () => {
  it('returns defaults for required, optional, and overridable context fields', () => {
    const fields: BlueprintManifestResponseResultsInner[] = [
      createVariableField({ name: 'required_string', required: true, default_value: 'required-value' }),
      createVariableField({ name: 'optional_string', required: false, default_value: 'optional-value' }),
      {
        ...createVariableField({
          name: 'required_bool',
          required: true,
          type: { type: 'bool' },
          default_value: 'true',
        }),
      },
      {
        ...createContextVariableField({ name: 'overridable_context', value: 'context-value' }),
        overridable: true,
      },
    ] as BlueprintManifestResponseResultsInner[]

    expect(getDefaultBlueprintFieldValues(fields)).toEqual({
      required_string: 'required-value',
      optional_string: 'optional-value',
      required_bool: true,
      overridable_context: 'context-value',
    })
  })

  it('excludes non-overridable context fields and preserves empty values for missing defaults', () => {
    const fields: BlueprintManifestResponseResultsInner[] = [
      createVariableField({ name: 'required_without_default', required: true }),
      createVariableField({ name: 'optional_without_default', required: false }),
      createContextVariableField({ name: 'context_without_override', value: 'ignored' }),
      {
        ...createContextVariableField({ name: 'overridable_without_value', value: undefined }),
        overridable: true,
      },
    ] as BlueprintManifestResponseResultsInner[]

    expect(getDefaultBlueprintFieldValues(fields)).toEqual({
      required_without_default: '',
      optional_without_default: '',
      overridable_without_value: '',
    })
  })
})

describe('field formatting', () => {
  it('builds a field path', () => {
    expect(getBlueprintFieldPath('database_name')).toBe('fields.database_name')
  })

  it('formats a field label', () => {
    expect(formatFieldLabel('database_name')).toBe('Database name')
  })
})

describe('default values', () => {
  it('returns boolean and string variable defaults', () => {
    expect(getDefaultFieldValue(createVariableField({ type: { type: 'bool' }, default_value: 'true' }))).toBe(true)
    expect(getDefaultFieldValue(createVariableField({ type: { type: 'bool' }, default_value: 'false' }))).toBe(false)
    expect(getDefaultFieldValue(createVariableField({ default_value: 'value' }))).toBe('value')
    expect(getDefaultFieldValue(createVariableField())).toBe('')
  })

  it('returns the context value or an empty string', () => {
    expect(getDefaultContextFieldValue(createContextVariableField({ value: 'value' }))).toBe('value')
    expect(getDefaultContextFieldValue(createContextVariableField({ value: undefined }))).toBe('')
  })
})

describe('field value accessors', () => {
  it('gets string values without coercing booleans', () => {
    expect(getStringFieldValue('value')).toBe('value')
    expect(getStringFieldValue(true)).toBe('')
    expect(getStringFieldValue(undefined)).toBe('')
  })

  it('gets boolean values without coercing strings', () => {
    expect(getBooleanFieldValue(true)).toBe(true)
    expect(getBooleanFieldValue('true')).toBe(false)
    expect(getBooleanFieldValue(undefined)).toBe(false)
  })

  it.each([
    ['a non-empty string', 'value', true],
    ['a whitespace-only string', '   ', false],
    ['a boolean', false, true],
    ['an undefined value', undefined, false],
  ] as const)('reports whether %s is fulfilled', (_, value, expected) => {
    expect(isFieldValueFulfilled(value)).toBe(expected)
  })
})

describe('field validation', () => {
  it('matches a field pattern and ignores empty or malformed patterns', () => {
    const field = createVariableField({ type: { type: 'string', pattern: '^value$' } })

    expect(isFieldValueMatchingPattern(field, 'value')).toBe(true)
    expect(isFieldValueMatchingPattern(field, 'other')).toBe(false)
    expect(isFieldValueMatchingPattern(field, '')).toBe(true)
    expect(isFieldValueMatchingPattern(createVariableField({ type: { type: 'string', pattern: '[' } }), 'value')).toBe(
      true
    )
  })

  it('validates minimum and maximum lengths', () => {
    const rangeField = createVariableField({ type: { type: 'string', min_length: 2, max_length: 4 } })
    const minField = createVariableField({ type: { type: 'string', min_length: 2 } })
    const maxField = createVariableField({ type: { type: 'string', max_length: 4 } })

    expect(getFieldLengthValidationError(rangeField, 'a')).toBe('Value must be between 2 and 4 characters.')
    expect(getFieldLengthValidationError(rangeField, 'value')).toBe('Value must be between 2 and 4 characters.')
    expect(getFieldLengthValidationError(rangeField, 'test')).toBeUndefined()
    expect(getFieldLengthValidationError(minField, 'a')).toBe('Value must be at least 2 characters.')
    expect(getFieldLengthValidationError(maxField, 'value')).toBe('Value must be at most 4 characters.')
    expect(getFieldLengthValidationError(rangeField, false)).toBeUndefined()
  })

  it('validates numeric minimum and maximum values', () => {
    const rangeField = createVariableField({ type: { type: 'number', min: 20, max: 65536 } })
    const minField = createVariableField({ type: { type: 'number', min: 20 } })
    const maxField = createVariableField({ type: { type: 'number', max: 65536 } })

    expect(getFieldNumberValidationError(rangeField, '19')).toBe('Value must be between 20 and 65536.')
    expect(getFieldNumberValidationError(rangeField, '65537')).toBe('Value must be between 20 and 65536.')
    expect(getFieldNumberValidationError(rangeField, '20')).toBeUndefined()
    expect(getFieldNumberValidationError(rangeField, '65536')).toBeUndefined()
    expect(getFieldNumberValidationError(minField, '19')).toBe('Value must be at least 20.')
    expect(getFieldNumberValidationError(maxField, '65537')).toBe('Value must be at most 65536.')
    expect(getFieldNumberValidationError(rangeField, 'not-a-number')).toBe('Value must be a number.')
  })

  it('prioritizes length errors before pattern errors', () => {
    const field = createVariableField({ type: { type: 'string', min_length: 2, pattern: '^value$' } })

    expect(getFieldValidationError(field, 'a')).toBe('Value must be at least 2 characters.')
    expect(getFieldValidationError(field, 'other')).toBe('Value does not match the expected format.')
    expect(getFieldValidationError(field, 'value')).toBeUndefined()
  })

  it('returns numeric validation errors', () => {
    const field = createVariableField({ type: { type: 'number', min: 20, max: 65536 } })

    expect(getFieldValidationError(field, '19')).toBe('Value must be between 20 and 65536.')
  })

  it('requires a fulfilled value only for required fields', () => {
    const requiredField = createVariableField({ required: true })
    const optionalField = createVariableField({ required: false })

    expect(isFieldValid(requiredField, '   ')).toBe(false)
    expect(isFieldValid(requiredField, false)).toBe(true)
    expect(isFieldValid(optionalField, undefined)).toBe(true)
    expect(isFieldValid(createVariableField({ type: { type: 'string', pattern: '^value$' } }), 'other')).toBe(false)
  })
})

describe('field type guards', () => {
  it('identifies variable fields and their required state', () => {
    const requiredField = createVariableField({ required: true }) as BlueprintManifestResponseResultsInner
    const optionalField = createVariableField({ required: false }) as BlueprintManifestResponseResultsInner
    const contextField = createContextVariableField() as BlueprintManifestResponseResultsInner

    expect(isVariableField(requiredField)).toBe(true)
    expect(isVariableField(contextField)).toBe(false)
    expect(isRequiredVariableField(requiredField)).toBe(true)
    expect(isRequiredVariableField(optionalField)).toBe(false)
    expect(isOptionalVariableField(requiredField)).toBe(false)
    expect(isOptionalVariableField(optionalField)).toBe(true)
  })

  it('identifies explicitly overridable context fields', () => {
    const overridableField = {
      ...createContextVariableField(),
      overridable: true,
    } as BlueprintManifestResponseResultsInner
    const nonOverridableField = createContextVariableField() as BlueprintManifestResponseResultsInner

    expect(isOverridableContextVariableField(overridableField)).toBe(true)
    expect(isOverridableContextVariableField(nonOverridableField)).toBe(false)
  })
})

describe('getSummaryFieldValue', () => {
  it('formats boolean values, masks secrets, and preserves regular values', () => {
    const secretField = createVariableField({ is_secret: true })
    const regularField = createVariableField({ is_secret: false })
    const contextField = {
      ...createContextVariableField(),
      overridable: true,
    }

    expect(getSummaryFieldValue(regularField, true)).toBe('Enabled')
    expect(getSummaryFieldValue(regularField, false)).toBe('Disabled')
    expect(getSummaryFieldValue(secretField, 'secret')).toBe('••••••••')
    expect(getSummaryFieldValue(secretField, '')).toBe('')
    expect(getSummaryFieldValue(regularField, 'value')).toBe('value')
    expect(getSummaryFieldValue(contextField, 'context-value')).toBe('context-value')
    expect(getSummaryFieldValue(regularField, undefined)).toBeUndefined()
  })
})

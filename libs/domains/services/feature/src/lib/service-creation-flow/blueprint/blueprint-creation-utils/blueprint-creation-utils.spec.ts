import {
  type BlueprintMajorVersion,
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import {
  type OverridableBlueprintManifestContextVariableField,
  buildBlueprintVariables,
  formatFieldLabel,
  getBlueprintFieldPath,
  getBooleanFieldValue,
  getDefaultContextFieldValue,
  getDefaultFieldValue,
  getFieldLengthValidationError,
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
  sortBlueprintMajorVersions,
} from './blueprint-creation-utils'

function createVariableField(overrides: Partial<BlueprintManifestVariableField> = {}): BlueprintManifestVariableField {
  return {
    kind: 'variable',
    name: 'db_name',
    required: true,
    is_secret: false,
    description: 'Database name',
    type: { type: 'string' },
    ...overrides,
  } as BlueprintManifestVariableField
}

function createContextVariableField(
  overrides: Partial<BlueprintManifestContextVariableField> = {}
): BlueprintManifestContextVariableField {
  return {
    kind: 'contextVariable',
    name: 'environment_id',
    description: 'Environment id',
    source: 'environment',
    value: 'env-1',
    ...overrides,
  } as BlueprintManifestContextVariableField
}

describe('blueprint-creation-utils', () => {
  describe('getBlueprintFieldPath', () => {
    it('returns the react-hook-form field path for a blueprint field name', () => {
      expect(getBlueprintFieldPath('db_name')).toBe('fields.db_name')
    })
  })

  describe('formatFieldLabel', () => {
    it('formats a snake case field name into a readable label', () => {
      expect(formatFieldLabel('db_name')).toBe('Db name')
    })
  })

  describe('sortBlueprintMajorVersions', () => {
    it('sorts blueprint versions from latest to oldest', () => {
      const versions: BlueprintMajorVersion[] = [
        { serviceVersion: '9.6', latestTag: 'aws/postgres/9.6/1.0.0' },
        { serviceVersion: '17', latestTag: 'aws/postgres/17/1.0.0' },
        { serviceVersion: '14', latestTag: 'aws/postgres/14/1.0.0' },
      ]

      expect(sortBlueprintMajorVersions(versions)).toEqual([
        { serviceVersion: '17', latestTag: 'aws/postgres/17/1.0.0' },
        { serviceVersion: '14', latestTag: 'aws/postgres/14/1.0.0' },
        { serviceVersion: '9.6', latestTag: 'aws/postgres/9.6/1.0.0' },
      ])
    })
  })

  describe('getDefaultFieldValue', () => {
    it('returns the default value for string fields', () => {
      expect(getDefaultFieldValue(createVariableField({ default_value: 'production' }))).toBe('production')
    })

    it('returns an empty string when a string field has no default value', () => {
      expect(getDefaultFieldValue(createVariableField())).toBe('')
    })

    it('converts bool field default values to booleans', () => {
      expect(getDefaultFieldValue(createVariableField({ type: { type: 'bool' }, default_value: 'true' }))).toBe(true)
      expect(getDefaultFieldValue(createVariableField({ type: { type: 'bool' }, default_value: 'false' }))).toBe(false)
    })
  })

  describe('getDefaultContextFieldValue', () => {
    it('returns the context field value', () => {
      expect(getDefaultContextFieldValue(createContextVariableField({ value: 'project-1' }))).toBe('project-1')
    })

    it('returns an empty string when the context field has no value', () => {
      expect(getDefaultContextFieldValue(createContextVariableField({ value: undefined }))).toBe('')
    })
  })

  describe('getStringFieldValue', () => {
    it('returns string values unchanged', () => {
      expect(getStringFieldValue('postgres')).toBe('postgres')
    })

    it('returns an empty string for non-string values', () => {
      expect(getStringFieldValue(true)).toBe('')
      expect(getStringFieldValue(undefined)).toBe('')
    })
  })

  describe('getBooleanFieldValue', () => {
    it('returns boolean values unchanged', () => {
      expect(getBooleanFieldValue(true)).toBe(true)
    })

    it('returns false for non-boolean values', () => {
      expect(getBooleanFieldValue('true')).toBe(false)
      expect(getBooleanFieldValue(undefined)).toBe(false)
    })
  })

  describe('isFieldValueFulfilled', () => {
    it('returns true for non-empty strings', () => {
      expect(isFieldValueFulfilled('postgres')).toBe(true)
    })

    it('returns false for empty strings', () => {
      expect(isFieldValueFulfilled('   ')).toBe(false)
      expect(isFieldValueFulfilled('')).toBe(false)
    })

    it('returns true for boolean values', () => {
      expect(isFieldValueFulfilled(true)).toBe(true)
      expect(isFieldValueFulfilled(false)).toBe(true)
    })

    it('returns false for undefined values', () => {
      expect(isFieldValueFulfilled(undefined)).toBe(false)
    })
  })

  describe('isFieldValueMatchingPattern', () => {
    it('returns true when the string value matches the field pattern', () => {
      const field = createVariableField({ type: { type: 'string', pattern: '^[a-z]+$' } })
      expect(isFieldValueMatchingPattern(field, 'postgres')).toBe(true)
    })

    it('returns false when the string value does not match the field pattern', () => {
      const field = createVariableField({ type: { type: 'string', pattern: '^[a-z]+$' } })
      expect(isFieldValueMatchingPattern(field, 'Postgres')).toBe(false)
    })

    it('returns true for invalid patterns', () => {
      expect(
        isFieldValueMatchingPattern(createVariableField({ type: { type: 'string', pattern: '[' } }), 'value')
      ).toBe(true)
    })
  })

  describe('getFieldLengthValidationError', () => {
    it('returns an error when a value does not fit min and max length constraints', () => {
      const field = createVariableField({ type: { type: 'string', min_length: 3, max_length: 8 } })

      expect(getFieldLengthValidationError(field, 'pg')).toBe('Value must be between 3 and 8 characters.')
      expect(getFieldLengthValidationError(field, 'postgresql')).toBe('Value must be between 3 and 8 characters.')
    })

    it('returns an error when a value does not fit the min length constraint', () => {
      const field = createVariableField({ type: { type: 'string', min_length: 3 } })

      expect(getFieldLengthValidationError(field, 'pg')).toBe('Value must be at least 3 characters.')
    })

    it('returns an error when a value does not fit the max length constraint', () => {
      const field = createVariableField({ type: { type: 'string', max_length: 8 } })

      expect(getFieldLengthValidationError(field, 'postgresql')).toBe('Value must be at most 8 characters.')
    })

    it('returns undefined when a value fits length constraints', () => {
      const field = createVariableField({ type: { type: 'string', min_length: 3, max_length: 8 } })

      expect(getFieldLengthValidationError(field, 'postgres')).toBeUndefined()
    })
  })

  describe('getFieldValidationError', () => {
    it('returns a length validation error before pattern validation', () => {
      const field = createVariableField({
        type: {
          type: 'string',
          min_length: 3,
          pattern: '^[a-z]+$',
        },
      })

      expect(getFieldValidationError(field, 'P')).toBe('Value must be at least 3 characters.')
    })

    it('returns a pattern validation error when the value does not match the field pattern', () => {
      const field = createVariableField({ type: { type: 'string', pattern: '^[a-z]+$' } })

      expect(getFieldValidationError(field, 'Postgres')).toBe('Value does not match the expected format.')
    })

    it('returns undefined when the value is valid', () => {
      const field = createVariableField({ type: { type: 'string', min_length: 3, pattern: '^[a-z]+$' } })

      expect(getFieldValidationError(field, 'postgres')).toBeUndefined()
    })
  })

  describe('isFieldValid', () => {
    it('returns false when a required field is empty', () => {
      const requiredField = createVariableField({ required: true })

      expect(isFieldValid(requiredField, '')).toBe(false)
    })

    it('returns true when a required field is fulfilled and valid', () => {
      const requiredField = createVariableField({ required: true })

      expect(isFieldValid(requiredField, 'postgres')).toBe(true)
    })

    it('returns true when an optional field is empty', () => {
      const optionalField = createVariableField({ required: false })

      expect(isFieldValid(optionalField, '')).toBe(true)
    })

    it('returns false when field-level constraints fail', () => {
      const constrainedField = createVariableField({ type: { type: 'string', min_length: 3 } })

      expect(isFieldValid(constrainedField, 'pg')).toBe(false)
    })
  })

  describe('isVariableField', () => {
    it('returns true for variable manifest fields', () => {
      const requiredVariableField = createVariableField()
      expect(isVariableField(requiredVariableField)).toBe(true)
    })

    it('returns false for non-variable manifest fields', () => {
      const nonOverridableContextField = createContextVariableField() as BlueprintManifestResponseResultsInner

      expect(isVariableField(nonOverridableContextField)).toBe(false)
    })
  })

  describe('isRequiredVariableField', () => {
    it('returns true for required variable fields', () => {
      const requiredVariableField = createVariableField({ required: true })

      expect(isRequiredVariableField(requiredVariableField)).toBe(true)
    })

    it('returns false for optional variable fields', () => {
      const optionalVariableField = createVariableField({ required: false })

      expect(isRequiredVariableField(optionalVariableField)).toBe(false)
    })
  })

  describe('isOptionalVariableField', () => {
    it('returns true for optional variable fields', () => {
      const optionalVariableField = createVariableField({ required: false })

      expect(isOptionalVariableField(optionalVariableField)).toBe(true)
    })

    it('returns false for required variable fields', () => {
      const requiredVariableField = createVariableField({ required: true })

      expect(isOptionalVariableField(requiredVariableField)).toBe(false)
    })
  })

  describe('isOverridableContextVariableField', () => {
    it('returns true for overridable context variable fields', () => {
      const overridableContextField = {
        ...createContextVariableField({ name: 'environment_id' }),
        overridable: true,
      } as BlueprintManifestResponseResultsInner

      expect(isOverridableContextVariableField(overridableContextField)).toBe(true)
    })

    it('returns false for non-overridable context variable fields', () => {
      const nonOverridableContextField = createContextVariableField({
        name: 'organization_id',
      }) as BlueprintManifestResponseResultsInner

      expect(isOverridableContextVariableField(nonOverridableContextField)).toBe(false)
    })
  })

  describe('getSummaryFieldValue', () => {
    it('formats boolean values as enabled or disabled', () => {
      expect(getSummaryFieldValue(createVariableField(), true)).toBe('Enabled')
      expect(getSummaryFieldValue(createVariableField(), false)).toBe('Disabled')
    })

    it('masks secret variable values', () => {
      expect(getSummaryFieldValue(createVariableField({ is_secret: true }), 'super-secret')).toBe('••••••••')
    })

    it('returns non-secret variable values unchanged', () => {
      expect(getSummaryFieldValue(createVariableField({ is_secret: false }), 'postgres')).toBe('postgres')
    })

    it('returns context variable values unchanged', () => {
      expect(
        getSummaryFieldValue(
          {
            ...createContextVariableField(),
            overridable: true,
          } as OverridableBlueprintManifestContextVariableField,
          'env-1'
        )
      ).toBe('env-1')
    })
  })

  describe('buildBlueprintVariables', () => {
    it('builds blueprint variables from field values', () => {
      expect(
        buildBlueprintVariables(
          {
            db_name: 'production',
            db_password: 'super-secret',
            skip_final_snapshot: true,
            blank_value: '',
            blank_spaced_value: '   ',
            unknown_value: 'external',
          },
          [
            createVariableField({ name: 'db_name', is_secret: false }),
            createVariableField({ name: 'db_password', is_secret: true }),
            createVariableField({ name: 'skip_final_snapshot', type: { type: 'bool' } }),
          ]
        )
      ).toEqual([
        {
          name: 'db_name',
          value: 'production',
          is_secret: false,
        },
        {
          name: 'db_password',
          value: 'super-secret',
          is_secret: true,
        },
        {
          name: 'skip_final_snapshot',
          value: 'true',
          is_secret: false,
        },
        {
          name: 'unknown_value',
          value: 'external',
          is_secret: false,
        },
      ])
    })
  })
})

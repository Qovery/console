export type SchemaFieldValue = string | boolean

export type SchemaFieldType = 'string' | 'number' | 'bool'

export interface SchemaField {
  key: string
  label: string
  type: SchemaFieldType
  description?: string
  required?: boolean
  sensitive?: boolean
  defaultValue?: string
  allowedValues?: string[]
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

export function formatSchemaFieldKey(key: string) {
  const label = key.replace(/[-_]/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

export function getSchemaFieldStringValue(value: SchemaFieldValue | undefined) {
  return typeof value === 'string' ? value : ''
}

export function getSchemaFieldBooleanValue(value: SchemaFieldValue | undefined) {
  return typeof value === 'boolean' ? value : false
}

export function getSchemaFieldValue(
  field: Pick<SchemaField, 'type'> & { defaultValue?: string | null },
  value: unknown
): SchemaFieldValue | undefined {
  const resolvedValue = value ?? field.defaultValue
  if (field.type === 'bool') {
    if (typeof resolvedValue === 'boolean') return resolvedValue
    if (typeof resolvedValue === 'string') return resolvedValue === 'true'
    return undefined
  }

  if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') return String(resolvedValue)
  return undefined
}

export function isSchemaFieldValueFulfilled(value: SchemaFieldValue | undefined) {
  if (typeof value === 'boolean') return true
  return Boolean(value?.trim())
}

export function isSchemaFieldValueMatchingPattern(
  field: Pick<SchemaField, 'pattern'>,
  value: SchemaFieldValue | undefined
) {
  if (typeof value !== 'string' || !value || !field.pattern) return true

  try {
    return new RegExp(field.pattern).test(value)
  } catch {
    return true
  }
}

export function getSchemaFieldLengthValidationError(
  field: Pick<SchemaField, 'minLength' | 'maxLength'>,
  value: SchemaFieldValue | undefined
) {
  if (typeof value !== 'string' || !value) return undefined

  const { minLength, maxLength } = field
  const hasMinLength = typeof minLength === 'number'
  const hasMaxLength = typeof maxLength === 'number'

  if (hasMinLength && hasMaxLength && (value.length < minLength || value.length > maxLength)) {
    return `Value must be between ${minLength} and ${maxLength} characters.`
  }

  if (hasMinLength && value.length < minLength) return `Value must be at least ${minLength} characters.`
  if (hasMaxLength && value.length > maxLength) return `Value must be at most ${maxLength} characters.`

  return undefined
}

export function getSchemaFieldNumberValidationError(
  field: Pick<SchemaField, 'type' | 'min' | 'max'>,
  value: SchemaFieldValue | undefined
) {
  if (field.type !== 'number' || typeof value !== 'string' || !value.trim()) return undefined

  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 'Value must be a number.'

  const { min, max } = field
  const hasMin = typeof min === 'number'
  const hasMax = typeof max === 'number'

  if (hasMin && hasMax && (numberValue < min || numberValue > max)) {
    return `Value must be between ${min} and ${max}.`
  }

  if (hasMin && numberValue < min) return `Value must be at least ${min}.`
  if (hasMax && numberValue > max) return `Value must be at most ${max}.`

  return undefined
}

export function getSchemaFieldValidationError(
  field: Pick<SchemaField, 'type' | 'allowedValues' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max'>,
  value: SchemaFieldValue | undefined
) {
  if (
    field.type !== 'bool' &&
    field.allowedValues?.length &&
    typeof value === 'string' &&
    value !== '' &&
    !field.allowedValues.includes(value)
  ) {
    return 'Please select one of the allowed values.'
  }

  const numberValidationError = getSchemaFieldNumberValidationError(field, value)
  if (numberValidationError) return numberValidationError

  const lengthValidationError = getSchemaFieldLengthValidationError(field, value)
  if (lengthValidationError) return lengthValidationError

  if (!isSchemaFieldValueMatchingPattern(field, value)) return 'Value does not match the expected format.'
  return undefined
}

export function isSchemaFieldValid(
  field: Pick<
    SchemaField,
    'required' | 'type' | 'allowedValues' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max'
  >,
  value: SchemaFieldValue | undefined
) {
  if (field.required && !isSchemaFieldValueFulfilled(value)) return false
  return !getSchemaFieldValidationError(field, value)
}

export function getSchemaFieldSummaryValue(field: Pick<SchemaField, 'sensitive'>, value: SchemaFieldValue | undefined) {
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
  if (field.sensitive && value) return '••••••••'
  return value
}

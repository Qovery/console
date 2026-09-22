export type CatalogVariableValue = string | boolean

export type CatalogVariableFieldType = 'string' | 'number' | 'bool'

export interface CatalogVariableField {
  key: string
  label: string
  type: CatalogVariableFieldType
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

export function formatCatalogKey(key: string) {
  const label = key.replace(/[-_]/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

export function getCatalogStringValue(value: CatalogVariableValue | undefined) {
  return typeof value === 'string' ? value : ''
}

export function getCatalogBooleanValue(value: CatalogVariableValue | undefined) {
  return typeof value === 'boolean' ? value : false
}

export function getCatalogVariableValue(
  field: Pick<CatalogVariableField, 'type'> & { defaultValue?: string | null },
  value: unknown
): CatalogVariableValue | undefined {
  const resolvedValue = value ?? field.defaultValue
  if (field.type === 'bool') {
    if (typeof resolvedValue === 'boolean') return resolvedValue
    if (typeof resolvedValue === 'string') return resolvedValue === 'true'
    return undefined
  }

  if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') return String(resolvedValue)
  return undefined
}

export function isCatalogFieldValueFulfilled(value: CatalogVariableValue | undefined) {
  if (typeof value === 'boolean') return true
  return Boolean(value?.trim())
}

export function isCatalogFieldValueMatchingPattern(
  field: Pick<CatalogVariableField, 'pattern'>,
  value: CatalogVariableValue | undefined
) {
  if (typeof value !== 'string' || !value || !field.pattern) return true

  try {
    return new RegExp(field.pattern).test(value)
  } catch {
    return true
  }
}

export function getCatalogFieldLengthValidationError(
  field: Pick<CatalogVariableField, 'minLength' | 'maxLength'>,
  value: CatalogVariableValue | undefined
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

export function getCatalogFieldNumberValidationError(
  field: Pick<CatalogVariableField, 'type' | 'min' | 'max'>,
  value: CatalogVariableValue | undefined
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

export function getCatalogFieldValidationError(
  field: Pick<CatalogVariableField, 'type' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max'>,
  value: CatalogVariableValue | undefined
) {
  const numberValidationError = getCatalogFieldNumberValidationError(field, value)
  if (numberValidationError) return numberValidationError

  const lengthValidationError = getCatalogFieldLengthValidationError(field, value)
  if (lengthValidationError) return lengthValidationError

  if (!isCatalogFieldValueMatchingPattern(field, value)) return 'Value does not match the expected format.'
  return undefined
}

export function isCatalogFieldValid(
  field: Pick<CatalogVariableField, 'required' | 'type' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max'>,
  value: CatalogVariableValue | undefined
) {
  if (field.required && !isCatalogFieldValueFulfilled(value)) return false
  return !getCatalogFieldValidationError(field, value)
}

export function getCatalogSummaryFieldValue(
  field: Pick<CatalogVariableField, 'sensitive'>,
  value: CatalogVariableValue | undefined
) {
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
  if (field.sensitive && value) return '••••••••'
  return value
}

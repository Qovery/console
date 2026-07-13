import {
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'

export type BlueprintFieldValue = string | boolean
export type BlueprintFieldValues = Record<string, BlueprintFieldValue>
export type BlueprintFieldPath = `fields.${string}`

export type OverridableBlueprintManifestContextVariableField = BlueprintManifestContextVariableField & {
  overridable?: boolean
}

export function getBlueprintFieldPath(name: string): BlueprintFieldPath {
  return `fields.${name}`
}

export function formatFieldLabel(name: string) {
  const label = name.replace(/_/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

export function getDefaultFieldValue(field: BlueprintManifestVariableField): BlueprintFieldValue {
  if (field.type.type === 'bool') return field.default_value === 'true'
  return field.default_value ?? ''
}

export function getDefaultContextFieldValue(field: BlueprintManifestContextVariableField): BlueprintFieldValue {
  return field.value ?? ''
}

export function getDefaultBlueprintFieldValues(blueprintManifestFields: BlueprintManifestResponseResultsInner[]) {
  const requiredBlueprintFields = blueprintManifestFields.filter(isRequiredVariableField)
  const optionalBlueprintFields = blueprintManifestFields.filter(isOptionalVariableField)
  const overridableContextBlueprintFields = blueprintManifestFields.filter(isOverridableContextVariableField)
  const fieldsWithDefaultValue = [...requiredBlueprintFields, ...optionalBlueprintFields]

  return {
    ...Object.fromEntries(fieldsWithDefaultValue.map((field) => [field.name, getDefaultFieldValue(field)])),
    ...Object.fromEntries(
      overridableContextBlueprintFields.map((field) => [field.name, getDefaultContextFieldValue(field)])
    ),
  }
}

export function getStringFieldValue(value: BlueprintFieldValue | undefined) {
  return typeof value === 'string' ? value : ''
}

export function getBooleanFieldValue(value: BlueprintFieldValue | undefined) {
  return typeof value === 'boolean' ? value : false
}

export function isFieldValueFulfilled(value: BlueprintFieldValue | undefined) {
  if (typeof value === 'boolean') return true
  return Boolean(value?.trim())
}

export function isFieldValueMatchingPattern(
  field: BlueprintManifestVariableField,
  value: BlueprintFieldValue | undefined
) {
  if (typeof value !== 'string' || !value || !field.type.pattern) return true

  try {
    return new RegExp(field.type.pattern).test(value)
  } catch {
    return true
  }
}

export function getFieldLengthValidationError(
  field: BlueprintManifestVariableField,
  value: BlueprintFieldValue | undefined
) {
  if (typeof value !== 'string' || !value) return undefined

  const { min_length: minLength, max_length: maxLength } = field.type
  const hasMinLength = typeof minLength === 'number'
  const hasMaxLength = typeof maxLength === 'number'

  if (hasMinLength && hasMaxLength && (value.length < minLength || value.length > maxLength)) {
    return `Value must be between ${minLength} and ${maxLength} characters.`
  }

  if (hasMinLength && value.length < minLength) return `Value must be at least ${minLength} characters.`
  if (hasMaxLength && value.length > maxLength) return `Value must be at most ${maxLength} characters.`

  return undefined
}

export function getFieldValidationError(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  const lengthValidationError = getFieldLengthValidationError(field, value)
  if (lengthValidationError) return lengthValidationError

  if (!isFieldValueMatchingPattern(field, value)) return 'Value does not match the expected format.'
  return undefined
}

export function isFieldValid(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  if (field.required && !isFieldValueFulfilled(value)) return false
  return !getFieldValidationError(field, value)
}

export function isVariableField(field: BlueprintManifestResponseResultsInner): field is BlueprintManifestVariableField {
  return field.kind === 'variable'
}

export function isRequiredVariableField(
  field: BlueprintManifestResponseResultsInner
): field is BlueprintManifestVariableField {
  return isVariableField(field) && field.required
}

export function isOptionalVariableField(
  field: BlueprintManifestResponseResultsInner
): field is BlueprintManifestVariableField {
  return isVariableField(field) && !field.required
}

export function isOverridableContextVariableField(
  field: BlueprintManifestResponseResultsInner
): field is OverridableBlueprintManifestContextVariableField {
  return field.kind === 'contextVariable' && 'overridable' in field && field.overridable === true
}

export function getSummaryFieldValue(
  field: BlueprintManifestVariableField | OverridableBlueprintManifestContextVariableField,
  value: BlueprintFieldValue | undefined
) {
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
  if (field.kind === 'variable' && field.is_secret && value) return '••••••••'
  return value
}

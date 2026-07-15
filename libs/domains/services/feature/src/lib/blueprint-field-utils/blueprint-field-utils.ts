import {
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import {
  type CatalogVariableField,
  type CatalogVariableValue,
  formatCatalogKey,
  getCatalogBooleanValue,
  getCatalogFieldLengthValidationError,
  getCatalogFieldValidationError,
  getCatalogStringValue,
  getCatalogSummaryFieldValue,
  getCatalogVariableValue,
  isCatalogFieldValid,
  isCatalogFieldValueFulfilled,
  isCatalogFieldValueMatchingPattern,
} from '@qovery/shared/util-js'

export type BlueprintFieldValue = CatalogVariableValue
export type BlueprintFieldValues = Record<string, BlueprintFieldValue>
export type BlueprintFieldPath = `fields.${string}`

export type OverridableBlueprintManifestContextVariableField = BlueprintManifestContextVariableField & {
  overridable?: boolean
}

export function getBlueprintFieldPath(name: string): BlueprintFieldPath {
  return `fields.${name}`
}

export function formatFieldLabel(name: string) {
  return formatCatalogKey(name)
}

export function toCatalogVariableField(field: BlueprintManifestVariableField, label?: string): CatalogVariableField {
  return {
    key: field.name,
    label: label ?? formatFieldLabel(field.name),
    type: field.type.type,
    description: field.description ?? undefined,
    required: field.required,
    sensitive: field.is_secret,
    defaultValue: field.default_value ?? undefined,
    allowedValues: field.allowed_values ?? undefined,
    pattern: field.type.pattern ?? undefined,
    minLength: field.type.min_length ?? undefined,
    maxLength: field.type.max_length ?? undefined,
    min: field.type.min ?? undefined,
    max: field.type.max ?? undefined,
  }
}

export function getDefaultFieldValue(field: BlueprintManifestVariableField): BlueprintFieldValue {
  const defaultValue = getCatalogVariableValue({ type: field.type.type, defaultValue: field.default_value }, undefined)
  return defaultValue ?? (field.type.type === 'bool' ? false : '')
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
  return getCatalogStringValue(value)
}

export function getBooleanFieldValue(value: BlueprintFieldValue | undefined) {
  return getCatalogBooleanValue(value)
}

export function isFieldValueFulfilled(value: BlueprintFieldValue | undefined) {
  return isCatalogFieldValueFulfilled(value)
}

export function isFieldValueMatchingPattern(
  field: BlueprintManifestVariableField,
  value: BlueprintFieldValue | undefined
) {
  return isCatalogFieldValueMatchingPattern(toCatalogVariableField(field), value)
}

export function getFieldLengthValidationError(
  field: BlueprintManifestVariableField,
  value: BlueprintFieldValue | undefined
) {
  return getCatalogFieldLengthValidationError(toCatalogVariableField(field), value)
}

export function getFieldValidationError(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  return getCatalogFieldValidationError(toCatalogVariableField(field), value)
}

export function isFieldValid(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  return isCatalogFieldValid(toCatalogVariableField(field), value)
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
  return getCatalogSummaryFieldValue({ sensitive: field.kind === 'variable' && field.is_secret }, value)
}

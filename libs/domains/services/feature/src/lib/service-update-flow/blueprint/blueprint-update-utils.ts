import { type IconName } from '@fortawesome/fontawesome-common-types'
import {
  type BlueprintManifestVariableField,
  type BlueprintUpdateEngineFieldChange,
  type BlueprintUpdateNewOptionalValue,
  type BlueprintUpdateNewRequiredValue,
  type BlueprintUpdateResponse,
  type BlueprintUpdateUpdatedValue,
} from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type BlueprintFieldValue, type BlueprintFieldValues } from '../../blueprint-field-utils/blueprint-field-utils'

export type BlueprintUpdateSection = 'required' | 'optional' | 'modified' | 'removed'
export type BlueprintUpdateVariablePatch = Record<string, { value: string; is_secret?: boolean }>
export type BlueprintUpdateField =
  | BlueprintUpdateNewRequiredValue
  | BlueprintUpdateNewOptionalValue
  | BlueprintUpdateUpdatedValue
export type BlueprintUpdateEditableValue = BlueprintUpdateUpdatedValue | BlueprintUpdateEngineFieldChange

export const updateSections: Array<{
  id: BlueprintUpdateSection
  title: string
  iconName: IconName
  description?: string
}> = [
  {
    id: 'required',
    title: 'New required values',
    iconName: 'circle-plus',
    description:
      "These are new fields we have added that don't have a default value and require you to enter a specific value for the update.",
  },
  {
    id: 'optional',
    title: 'New optional values',
    iconName: 'chart-bullet',
    description: 'These new fields have a default value, but you can override them if needed.',
  },
  {
    id: 'modified',
    title: 'Modified values',
    iconName: 'arrows-rotate',
    description:
      'Existing values for which the default value has been updated. Your overrides has priority over the default value.',
  },
  {
    id: 'removed',
    title: 'Removed values',
    iconName: 'circle-minus',
  },
]
export type BlueprintUpdateReviewSection = (typeof updateSections)[number]

export const blueprintUpdateSteps: { title: string }[] = [{ title: 'Review update' }, { title: 'Preview changes' }]
export const BLUEPRINT_RELEASE_NOTES_URL = 'https://github.com/Qovery/service-catalog/releases'

export function hasBlueprintUpdateReviewSections(blueprintUpdate: BlueprintUpdateResponse) {
  return (
    blueprintUpdate.new_required_values.length > 0 ||
    blueprintUpdate.now_required_values.length > 0 ||
    blueprintUpdate.new_optional_values.length > 0 ||
    blueprintUpdate.updated_values.length > 0 ||
    blueprintUpdate.engine_diff.updated_values.length > 0 ||
    blueprintUpdate.removed_values.length > 0
  )
}

export function getBlueprintUpdateVersion(tag: string) {
  return tag.split('/').filter(Boolean).at(-1)
}

export function getBlueprintUpdateTitle({
  currentTag,
  latestTag,
  serviceName,
}: {
  currentTag: string
  latestTag: string
  serviceName: string
}) {
  const currentVersion = getBlueprintUpdateVersion(currentTag) ?? currentTag
  const latestVersion = getBlueprintUpdateVersion(latestTag) ?? latestTag

  return `${serviceName} blueprint update from ${currentVersion} to ${latestVersion}`
}

export function getInitialUpdateValues(blueprintUpdate: BlueprintUpdateResponse) {
  return Object.fromEntries(
    blueprintUpdate.new_optional_values.map((value) => [
      value.name,
      getBlueprintUpdateFieldValue(value, value.default_value),
    ])
  )
}

export function getFirstAvailableUpdateSection(blueprintUpdate: BlueprintUpdateResponse): BlueprintUpdateSection {
  if (blueprintUpdate.new_required_values.length > 0 || blueprintUpdate.now_required_values.length > 0) {
    return 'required'
  }
  if (blueprintUpdate.new_optional_values.length > 0) return 'optional'
  if (blueprintUpdate.updated_values.length > 0 || blueprintUpdate.engine_diff.updated_values.length > 0) {
    return 'modified'
  }
  if (blueprintUpdate.removed_values.length > 0) return 'removed'
  return 'required'
}

export function buildBlueprintUpdatePayload({
  icon,
  name,
  optionalValues,
  requiredValues,
  tag,
  updatedValues,
  values,
}: {
  icon: string
  name: string
  optionalValues: BlueprintUpdateNewOptionalValue[]
  requiredValues: BlueprintUpdateNewRequiredValue[]
  tag: string
  updatedValues: BlueprintUpdateEditableValue[]
  values: BlueprintFieldValues
}) {
  const variables: BlueprintUpdateVariablePatch = {}

  requiredValues.forEach((field) => {
    const value = getBlueprintUpdatePayloadValue(values[field.name])
    if (value) variables[field.name] = { value, is_secret: field.is_secret }
  })
  optionalValues.forEach((field) => {
    const value = getBlueprintUpdatePayloadValue(values[field.name])
    if (value && value !== field.default_value) variables[field.name] = { value, is_secret: field.is_secret }
  })
  updatedValues.forEach((field) => {
    const value = getBlueprintUpdatePayloadValue(values[field.name])
    if (!value || value === field.new_default_value) return

    variables[field.name] = {
      value,
      ...(isBlueprintUpdateVariableField(field) ? { is_secret: field.is_secret } : {}),
    }
  })

  return { name, tag, icon, variables }
}

export function getBlueprintUpdateVariableField(
  field: BlueprintUpdateField,
  required: boolean,
  defaultValue?: string | null
): BlueprintManifestVariableField {
  return {
    kind: 'variable',
    name: field.name,
    type: field.type,
    required,
    is_secret: field.is_secret,
    allowed_values: field.allowed_values,
    default_value: defaultValue,
  }
}

export function isBlueprintUpdateVariableField(
  field: BlueprintUpdateEditableValue | BlueprintUpdateNewOptionalValue
): field is BlueprintUpdateUpdatedValue | BlueprintUpdateNewOptionalValue {
  return 'type' in field && 'is_secret' in field
}

export function getBlueprintUpdateFieldValue(
  field: BlueprintUpdateEditableValue | BlueprintUpdateNewOptionalValue,
  value?: string | null
): BlueprintFieldValue {
  if (isBlueprintUpdateVariableField(field) && field.type.type === 'bool' && !field.allowed_values?.length) {
    return value === 'true'
  }

  return value ?? ''
}

export function getBlueprintUpdatePayloadValue(value: BlueprintFieldValue | undefined) {
  if (typeof value === 'boolean') return String(value)

  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}

export function formatUpdateFieldLabel(name: string) {
  const label = name.replace(/_/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

export function formatUpdateValue(value?: BlueprintFieldValue | string | null) {
  if (typeof value === 'boolean') return String(value)
  return value && value.length > 0 ? value : '-'
}

export function getFallbackServiceIcon(serviceType: AnyService['service_type']) {
  if (serviceType === 'HELM') return 'app://qovery-console/helm'
  if (serviceType === 'TERRAFORM') return 'app://qovery-console/terraform'
  return 'app://qovery-console/application'
}

export function getRawOutputLineClassName(line: string) {
  const prefix = line.trimStart().charAt(0)

  if (prefix === '+') return 'text-positive'
  if (prefix === '-') return 'text-negative'
  if (prefix === '~') return 'text-info'

  return undefined
}

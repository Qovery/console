import {
  type CloudProviderEnum,
  type CloudVendorEnum,
  type ClusterPlatformBindingResponse,
  type FieldSchemaConstraintsResponse,
  type FieldSchemaResponse,
  type KubernetesEnum,
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformComponentConfigurationViolationResponse,
  type PlatformComponentInputRequirementResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type CatalogVariableField, type CatalogVariableValue, getCatalogVariableValue } from '@qovery/shared/util-js'

export interface PlatformConfigurationDraft {
  templateKey: string
  templateVersion: string
  layerSelections: Record<string, boolean>
  managedConfig: Record<string, Record<string, unknown>>
  customerProvidedInputs: Record<string, Record<string, string>>
}

export function toPlatformCloudVendor(
  cloudProvider: CloudProviderEnum | CloudVendorEnum | undefined
): PlatformCloudVendor | undefined {
  return match(cloudProvider)
    .with(undefined, () => undefined)
    .with('ON_PREMISE', () => 'UNKNOWN' as const)
    .otherwise((provider) => provider)
}

export function toPlatformClusterMode(kubernetes: KubernetesEnum | undefined): PlatformClusterMode | undefined {
  return match(kubernetes)
    .with('MANAGED', () => 'QOVERY_MANAGED' as const)
    .with('SELF_MANAGED', () => 'CUSTOMER_MANAGED' as const)
    .otherwise(() => undefined)
}

export type PlatformScalarField = Extract<FieldSchemaResponse, { type: 'string' | 'number' | 'bool' }>

export type PlatformFieldDescriptor = {
  key: string
  label: string
  type: 'string' | 'number' | 'bool'
  description?: string | null
  sensitive: boolean
  required: boolean
  constraints: FieldSchemaConstraintsResponse
  defaultValue?: string | null
}

export type PlatformArrayField = Extract<FieldSchemaResponse, { type: 'array' }>

export type PlatformObjectField = Extract<FieldSchemaResponse, { type: 'object' }>

export function isPlatformScalarField(field: FieldSchemaResponse): field is PlatformScalarField {
  return field.type === 'string' || field.type === 'number' || field.type === 'bool'
}

export function isPlatformArrayField(field: FieldSchemaResponse): field is PlatformArrayField {
  return field.type === 'array'
}

export function isPlatformObjectField(field: FieldSchemaResponse): field is PlatformObjectField {
  return field.type === 'object'
}

export function isSupportedPlatformField(field: FieldSchemaResponse) {
  return isPlatformScalarField(field) || isPlatformArrayField(field) || isPlatformObjectField(field)
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getPlatformFieldPath(parentPath: string | undefined, fieldKey: string) {
  return parentPath ? `${parentPath}.${fieldKey}` : fieldKey
}

export function getPlatformArrayItemPath(arrayPath: string, index: number) {
  return `${arrayPath}[${index}]`
}

// Prefer the row-specific descriptors evaluated by the resolver; items.fields
// covers rows added locally that have not been resolved yet.
export function getPlatformArrayItemFields(field: PlatformArrayField, index: number): FieldSchemaResponse[] {
  if (field.items.type !== 'object') return []
  return field.itemFields?.[index] ?? field.items.fields
}

export function toPlatformArrayItemDescriptor(field: PlatformArrayField): PlatformFieldDescriptor {
  return {
    key: 'value',
    label: field.label,
    type: field.items.type === 'object' ? 'string' : field.items.type,
    sensitive: field.sensitive,
    required: true,
    constraints: field.items.type === 'object' ? {} : field.items.constraints,
  }
}

export function getPlatformFieldPaths(
  fields: FieldSchemaResponse[],
  values: Record<string, unknown>,
  parentPath?: string
): string[] {
  return fields.flatMap((field) => {
    const path = getPlatformFieldPath(parentPath, field.key)
    const value = values[field.key]

    if (isPlatformObjectField(field)) {
      return [path, ...getPlatformFieldPaths(field.fields, isPlainObject(value) ? value : {}, path)]
    }

    if (isPlatformArrayField(field)) {
      const items = Array.isArray(value) ? value : []
      return [
        path,
        ...items.flatMap((item, index) => {
          const itemPath = getPlatformArrayItemPath(path, index)
          return [
            itemPath,
            ...getPlatformFieldPaths(
              getPlatformArrayItemFields(field, index),
              isPlainObject(item) ? item : {},
              itemPath
            ),
          ]
        }),
      ]
    }

    return isPlatformScalarField(field) ? [path] : []
  })
}

export function getTemplateId(template: Pick<PlatformTemplateSummaryResponse, 'key' | 'version'>) {
  return `${template.key}@${template.version}`
}

export function createPlatformConfigurationDraft(
  template: PlatformTemplateSummaryResponse,
  binding: ClusterPlatformBindingResponse | null | undefined
): PlatformConfigurationDraft {
  const defaultLayerSelections = Object.fromEntries(
    template.layers.flatMap((layer) => (layer.mandatory ? [] : [[layer.key, layer.enabledByDefault]]))
  )
  const resolvedLayerSelections = Object.fromEntries(
    template.layers.flatMap((layer) => {
      if (layer.mandatory) return []

      const status = binding?.layers.find((candidate) => candidate.key === layer.key)?.status
      if (status === 'ENABLED') return [[layer.key, true]]
      if (status === 'DISABLED') return [[layer.key, false]]
      return []
    })
  )

  if (binding && binding.templateKey === template.key && binding.templateVersion === template.version) {
    return {
      templateKey: binding.templateKey,
      templateVersion: binding.templateVersion,
      layerSelections: { ...defaultLayerSelections, ...binding.layerSelections, ...resolvedLayerSelections },
      managedConfig: binding.managedConfig,
      customerProvidedInputs: binding.customerProvidedInputs,
    }
  }

  return {
    templateKey: template.key,
    templateVersion: template.version,
    layerSelections: { ...defaultLayerSelections, ...resolvedLayerSelections },
    managedConfig: {},
    customerProvidedInputs: {},
  }
}

export function findPlatformComponent(template: PlatformTemplateSummaryResponse, componentKey?: string) {
  return template.layers.flatMap((layer) => layer.components).find((component) => component.key === componentKey)
}

export function getCurrentPlatformConfigurationPreview(
  preview: PlatformComponentConfigurationResolutionResponse | undefined,
  componentKey: string | undefined,
  isPreviewPending: boolean
) {
  if (isPreviewPending || preview?.componentKey !== componentKey) return undefined
  return preview
}

export function toCatalogVariableField(field: PlatformFieldDescriptor): CatalogVariableField {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    description: field.description ?? undefined,
    required: field.required,
    sensitive: field.sensitive,
    defaultValue: field.defaultValue ?? undefined,
    allowedValues: field.constraints.allowedValues ?? undefined,
    pattern: field.constraints.pattern ?? undefined,
    minLength: field.constraints.minLength ?? undefined,
    maxLength: field.constraints.maxLength ?? undefined,
    min: field.constraints.min ?? undefined,
    max: field.constraints.max ?? undefined,
  }
}

export function applyPlatformConfigurationDefaults(
  fields: FieldSchemaResponse[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const defaultValues = Object.fromEntries(
    fields.filter(isPlatformScalarField).flatMap((field) => {
      const defaultValue = getCatalogVariableValue(field, undefined)
      if (defaultValue === undefined) return []

      return [[field.key, toPlatformConfigurationValue(field, defaultValue)]]
    })
  )

  return { ...defaultValues, ...values }
}

export function toPlatformConfigurationValue(
  field: Pick<PlatformFieldDescriptor, 'type'>,
  value: CatalogVariableValue
) {
  if (field.type !== 'number') return value
  if (typeof value !== 'string') return undefined
  // Keep the empty string: it marks a field the user explicitly cleared, so
  // applyPlatformConfigurationDefaults must not resurrect the schema default.
  if (value.trim() === '') return ''

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value
}

function omitEmptyNestedValues(value: unknown): unknown {
  // Array rows are kept in place so their indexes keep matching violation paths.
  if (Array.isArray(value)) return value.map(omitEmptyNestedValues)
  if (isPlainObject(value)) return omitEmptyValues(value)
  return value
}

export function omitEmptyValues(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) =>
      value === '' || value === undefined ? [] : [[key, omitEmptyNestedValues(value)]]
    )
  )
}

export function updateComponentValue<T>(
  valuesByComponent: Record<string, Record<string, T>>,
  componentKey: string,
  fieldKey: string,
  value: T | undefined
) {
  const componentValues = { ...valuesByComponent[componentKey] }

  if (value === undefined) {
    delete componentValues[fieldKey]
  } else {
    componentValues[fieldKey] = value
  }

  return {
    ...valuesByComponent,
    [componentKey]: componentValues,
  }
}

export function getFieldViolation(
  violations: PlatformComponentConfigurationViolationResponse[],
  fieldPath: string,
  source?: 'clusterInputs'
) {
  const expectedPath = source ? `${source}.${fieldPath}` : fieldPath
  return violations.find((violation) => violation.fieldPath === expectedPath)?.message
}

export function getUnmappedViolations(
  violations: PlatformComponentConfigurationViolationResponse[],
  fields: FieldSchemaResponse[],
  values: Record<string, unknown>,
  requirements: PlatformComponentInputRequirementResponse[]
) {
  const mappedPaths = new Set([
    ...getPlatformFieldPaths(fields, values),
    ...requirements.map((requirement) => `clusterInputs.${requirement.key}`),
  ])
  return violations.filter((violation) => !mappedPaths.has(violation.fieldPath))
}

export function isPlatformConfigurationReady(
  violations: PlatformComponentConfigurationViolationResponse[],
  requirements: PlatformComponentInputRequirementResponse[]
) {
  return violations.length === 0 && requirements.every((requirement) => requirement.status === 'READY')
}

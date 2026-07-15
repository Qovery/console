import {
  type CloudProviderEnum,
  type CloudVendorEnum,
  type ClusterPlatformBindingResponse,
  type FieldSchemaResponse,
  type KubernetesEnum,
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformComponentConfigurationViolationResponse,
  type PlatformComponentInputRequirementResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
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
  if (!cloudProvider) return undefined
  if (cloudProvider === 'ON_PREMISE') return 'UNKNOWN'
  return cloudProvider
}

export function toPlatformClusterMode(kubernetes: KubernetesEnum | undefined): PlatformClusterMode | undefined {
  if (kubernetes === 'MANAGED') return 'QOVERY_MANAGED'
  if (kubernetes === 'SELF_MANAGED') return 'CUSTOMER_MANAGED'
  return undefined
}

type PlatformFieldDescriptor = Pick<
  FieldSchemaResponse,
  'key' | 'label' | 'type' | 'description' | 'sensitive' | 'required' | 'constraints'
> &
  Partial<Pick<FieldSchemaResponse, 'defaultValue'>>

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
    fields.flatMap((field) => {
      const defaultValue = getCatalogVariableValue(field, undefined)
      if (defaultValue === undefined) return []

      return [[field.key, toPlatformConfigurationValue(field, defaultValue)]]
    })
  )

  return { ...defaultValues, ...values }
}

export function toPlatformConfigurationValue(field: Pick<FieldSchemaResponse, 'type'>, value: CatalogVariableValue) {
  if (field.type !== 'number') return value
  if (typeof value !== 'string' || value.trim() === '') return undefined

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value
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
  fieldKey: string,
  source?: 'clusterInputs'
) {
  const expectedPath = source ? `${source}.${fieldKey}` : fieldKey
  return violations.find((violation) => violation.fieldPath === expectedPath)?.message
}

export function getUnmappedViolations(
  violations: PlatformComponentConfigurationViolationResponse[],
  fields: FieldSchemaResponse[],
  requirements: PlatformComponentInputRequirementResponse[]
) {
  const mappedPaths = new Set([
    ...fields.map((field) => field.key),
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

export function hasConfigurableFields(component: PlatformTemplateComponentResponse | undefined) {
  return Boolean(component?.fields.length)
}

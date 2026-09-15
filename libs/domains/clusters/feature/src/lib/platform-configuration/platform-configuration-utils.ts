import {
  type CloudProviderEnum,
  type CloudVendorEnum,
  type ClusterPlatformBindingRequest,
  type ClusterPlatformBindingResponse,
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
import {
  applyCatalogConfigurationDefaults,
  formatCatalogKey,
  isCatalogObject,
  omitEmptyCatalogValues,
  toCatalogConfigurationValue,
  toCatalogScalarField,
} from '@qovery/shared/util-js'

export type PlatformConfigurationDraft = Required<ClusterPlatformBindingRequest>

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

// A republished template may remove a layer while its stored selection remains in the binding.
// Filter only layer keys at save time; component drafts and customer inputs must stay untouched.
export function filterPlatformLayerSelections(
  layers: ReadonlyArray<Pick<PlatformTemplateSummaryResponse['layers'][number], 'key'>>,
  selections: Record<string, boolean>
): Record<string, boolean> {
  const keys = new Set(layers.map((layer) => layer.key))
  return Object.fromEntries(Object.entries(selections).filter(([key]) => keys.has(key)))
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

export const toCatalogVariableField = toCatalogScalarField

export function applyPlatformConfigurationDefaults(
  fields: FieldSchemaResponse[],
  values: Record<string, unknown>
): Record<string, unknown> {
  return applyCatalogConfigurationDefaults(fields, values)
}

export function toPlatformConfigurationValue(field: Pick<FieldSchemaResponse, 'type'>, value: unknown) {
  return toCatalogConfigurationValue(field, value)
}

export function omitEmptyValues(values: Record<string, unknown>): Record<string, unknown> {
  return omitEmptyCatalogValues(values)
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
  requirements: PlatformComponentInputRequirementResponse[],
  values: Record<string, unknown> = {}
) {
  const mappedPaths = new Set([
    ...fields.map((field) => field.key),
    ...requirements.map((requirement) => `clusterInputs.${requirement.key}`),
  ])
  const collect = (fields: FieldSchemaResponse[], values: Record<string, unknown>, prefix = '') => {
    fields.forEach((field) => {
      const path = prefix ? `${prefix}.${field.key}` : field.key
      mappedPaths.add(path)
      const value = values[field.key]
      if (field.type === 'object') collect(field.fields, isCatalogObject(value) ? value : {}, path)
      if (field.type === 'array' && Array.isArray(value)) {
        const item = field.items
        value.forEach((row, index) => {
          const rowPath = `${path}[${index}]`
          mappedPaths.add(rowPath)
          if (item.type === 'object')
            collect(
              field.itemFields?.length === value.length ? field.itemFields[index] : item.fields,
              isCatalogObject(row) ? row : {},
              rowPath
            )
        })
      }
    })
  }
  collect(fields, values)
  return violations.filter((violation) => !mappedPaths.has(violation.fieldPath))
}

export function isPlatformConfigurationReady(
  violations: PlatformComponentConfigurationViolationResponse[],
  requirements: PlatformComponentInputRequirementResponse[]
) {
  return violations.length === 0 && requirements.every((requirement) => requirement.status === 'READY')
}

// Presentation selects a subset of fields; every read, resolve and write still targets its source.
export function getPlatformComponentEditor(
  template: PlatformTemplateSummaryResponse | undefined,
  componentKey?: string,
  sourceComponentKey?: string
) {
  const component = template ? findPlatformComponent(template, componentKey) : undefined
  const layer = template?.layers.find((layer) => layer.components.some((candidate) => candidate.key === componentKey))
  const sections = (component?.configurationSections ?? []).flatMap((section) => {
    const source = layer?.components.find((candidate) => candidate.key === section.sourceComponentKey)
    if (!source || source.key === componentKey) return []
    const fieldKeys = new Set(section.fieldKeys)
    return [
      {
        configurationComponent: source,
        isFieldVisible: (field: FieldSchemaResponse) => fieldKeys.has(field.key),
        label:
          source.fields
            .filter((field) => fieldKeys.has(field.key))
            .map((field) => field.label)
            .join(', ') || formatCatalogKey(source.key),
      },
    ]
  })
  // Only hide a source field when its destination exists in this layer.
  const movedFields = new Set(
    layer?.components.flatMap(
      (destination) =>
        destination.configurationSections
          ?.filter((section) => section.sourceComponentKey === componentKey)
          .flatMap((section) => section.fieldKeys) ?? []
    )
  )
  const nativeSection = component
    ? {
        configurationComponent: component,
        isFieldVisible: (field: FieldSchemaResponse) => !movedFields.has(field.key),
        label: 'General configuration',
      }
    : undefined
  const editors = nativeSection ? [nativeSection, ...sections] : sections
  // With no native fields, open the declared section first. General configuration
  // remains accessible for native cluster inputs even when there are no static fields.
  const defaultEditor = component?.fields.some((field) => !movedFields.has(field.key))
    ? nativeSection
    : sections[0] ?? nativeSection
  const editor = editors.find((section) => section.configurationComponent.key === sourceComponentKey) ?? defaultEditor
  return { component, ...editor, sections: editors }
}

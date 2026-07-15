import {
  type ClusterPlatformBindingResponse,
  type FieldSchemaResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import {
  applyPlatformConfigurationDefaults,
  createPlatformConfigurationDraft,
  getCurrentPlatformConfigurationPreview,
  isPlatformConfigurationReady,
  toCatalogVariableField,
  toPlatformCloudVendor,
  toPlatformClusterMode,
  toPlatformConfigurationValue,
  updateComponentValue,
} from './platform-configuration-utils'

const field: FieldSchemaResponse = {
  key: 'retention',
  type: 'number',
  required: true,
  defaultValue: '12',
  label: 'Retention',
  sensitive: false,
  constraints: {},
}

describe('platform configuration utils', () => {
  it('maps cluster API context to the platform catalog context', () => {
    expect(toPlatformClusterMode('MANAGED')).toBe('QOVERY_MANAGED')
    expect(toPlatformClusterMode('SELF_MANAGED')).toBe('CUSTOMER_MANAGED')
    expect(toPlatformClusterMode('PARTIALLY_MANAGED')).toBeUndefined()
    expect(toPlatformCloudVendor('GCP')).toBe('GCP')
    expect(toPlatformCloudVendor('ON_PREMISE')).toBe('UNKNOWN')
  })

  it('converts number inputs at the API boundary without losing their type', () => {
    expect(toPlatformConfigurationValue(field, '24')).toBe(24)
    expect(toPlatformConfigurationValue(field, '')).toBeUndefined()
  })

  it('maps the full field vocabulary to the catalog variable contract', () => {
    expect(
      toCatalogVariableField({
        ...field,
        description: 'Retention period in weeks.',
        constraints: { allowedValues: ['12', '24'], pattern: '^\\d+$', minLength: 1, maxLength: 3, min: 1, max: 104 },
      })
    ).toEqual({
      key: 'retention',
      label: 'Retention',
      type: 'number',
      description: 'Retention period in weeks.',
      required: true,
      sensitive: false,
      defaultValue: '12',
      allowedValues: ['12', '24'],
      pattern: '^\\d+$',
      minLength: 1,
      maxLength: 3,
      min: 1,
      max: 104,
    })
  })

  it('applies catalog defaults before resolving a component configuration', () => {
    expect(
      applyPlatformConfigurationDefaults(
        [
          field,
          { ...field, key: 'highAvailability', type: 'bool', defaultValue: 'false' },
          { ...field, key: 'storage', type: 'string', defaultValue: 'pvc' },
        ],
        { retention: 24 }
      )
    ).toEqual({
      retention: 24,
      highAvailability: false,
      storage: 'pvc',
    })
  })

  it('keeps values from inactive fields and other components when one value changes', () => {
    const values = {
      logs: { storage: 'object', inactiveEndpoint: 'https://example.com' },
      metrics: { retention: '7d' },
    }

    expect(updateComponentValue(values, 'logs', 'storage', 'persistent-volume')).toEqual({
      logs: { storage: 'persistent-volume', inactiveEndpoint: 'https://example.com' },
      metrics: { retention: '7d' },
    })
  })

  it('copies an existing binding into a new draft', () => {
    const template = {
      key: 'default',
      version: '1.0.0',
      status: 'PUBLISHED',
      layers: [],
    } satisfies PlatformTemplateSummaryResponse
    const binding = {
      clusterId: 'cluster-id',
      organizationId: 'organization-id',
      templateKey: 'default',
      templateVersion: '1.0.0',
      layerSelections: { observability: true },
      managedConfig: { logs: { storage: 'object' } },
      customerProvidedInputs: { logs: { endpoint: 'https://example.com' } },
      layers: [],
    } satisfies ClusterPlatformBindingResponse

    expect(createPlatformConfigurationDraft(template, binding)).toEqual({
      templateKey: 'default',
      templateVersion: '1.0.0',
      layerSelections: { observability: true },
      managedConfig: { logs: { storage: 'object' } },
      customerProvidedInputs: { logs: { endpoint: 'https://example.com' } },
    })
  })

  it('hydrates optional selections from the resolved binding status', () => {
    const template = {
      key: 'default',
      version: '1.0.0',
      status: 'PUBLISHED',
      layers: [
        {
          key: 'logs',
          mandatory: false,
          enabledByDefault: false,
          modes: ['CUSTOMER_MANAGED'],
          componentKeys: [],
          components: [],
        },
      ],
    } satisfies PlatformTemplateSummaryResponse
    const binding = {
      clusterId: 'cluster-id',
      organizationId: 'organization-id',
      templateKey: 'previous-template',
      templateVersion: '0.1.0',
      layerSelections: {},
      managedConfig: {},
      customerProvidedInputs: {},
      layers: [
        {
          key: 'logs',
          status: 'ENABLED',
          reason: 'optional layer enabled',
          componentKeys: [],
        },
      ],
    } satisfies ClusterPlatformBindingResponse

    expect(createPlatformConfigurationDraft(template, binding).layerSelections).toEqual({ logs: true })
  })

  it('seeds optional layer defaults when creating a binding draft', () => {
    const template = {
      key: 'default',
      version: '1.0.0',
      status: 'PUBLISHED',
      layers: [
        {
          key: 'logs',
          mandatory: false,
          enabledByDefault: true,
          modes: ['CUSTOMER_MANAGED'],
          componentKeys: [],
          components: [],
        },
      ],
    } satisfies PlatformTemplateSummaryResponse

    expect(createPlatformConfigurationDraft(template, null).layerSelections).toEqual({ logs: true })
  })

  it('only accepts a preview for the current settled component request', () => {
    const preview = {
      clusterId: 'cluster-id',
      componentKey: 'loki',
      fields: [],
      requirements: [],
      componentBindings: [],
      violations: [],
    }

    expect(getCurrentPlatformConfigurationPreview(preview, 'loki', false)).toBe(preview)
    expect(getCurrentPlatformConfigurationPreview(preview, 'loki', true)).toBeUndefined()
    expect(getCurrentPlatformConfigurationPreview(preview, 'prometheus', false)).toBeUndefined()
  })

  it('is ready only when requirements are ready and there are no violations', () => {
    expect(
      isPlatformConfigurationReady(
        [],
        [
          {
            key: 'endpoint',
            type: 'string',
            scope: 'CLUSTER',
            label: 'Endpoint',
            required: true,
            sensitive: false,
            constraints: {},
            status: 'READY',
          },
        ]
      )
    ).toBe(true)

    expect(
      isPlatformConfigurationReady(
        [],
        [
          {
            key: 'endpoint',
            type: 'string',
            scope: 'CLUSTER',
            label: 'Endpoint',
            required: true,
            sensitive: false,
            constraints: {},
            status: 'MISSING',
          },
        ]
      )
    ).toBe(false)
  })
})

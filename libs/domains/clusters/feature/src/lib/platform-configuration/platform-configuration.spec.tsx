import {
  type FieldSchemaResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformConfiguration } from './platform-configuration'

const mockUpdateBinding = jest.fn()
const mockResolve = jest.fn()
const initialManifest = 'apiVersion: karpenter.sh/v1\nkind: NodePool\nmetadata:\n  name: custom'
const editedManifest = initialManifest + '-edited'

const yamlComponent: PlatformTemplateComponentResponse = {
  key: 'karpenter-configuration',
  kind: 'HELM',
  fields: [
    {
      key: 'nodePools',
      type: 'array',
      constraints: {},
      label: 'NodePools',
      required: false,
      sensitive: false,
      items: {
        type: 'object',
        fields: [
          { key: 'name', type: 'string', label: 'Name', required: true, sensitive: false, constraints: {} },
          { key: 'spotEnabled', type: 'bool', label: 'Spot', required: false, sensitive: false, constraints: {} },
        ],
      },
    },
    {
      key: 'resources',
      type: 'array',
      constraints: {},
      label: 'YAML resources',
      required: false,
      sensitive: false,
      items: {
        type: 'object',
        fields: [
          {
            key: 'manifest',
            type: 'string',
            label: 'YAML manifest',
            required: true,
            sensitive: false,
            constraints: {},
            format: 'kubernetes-resource-yaml',
          },
        ],
      },
    },
  ],
}
const template: PlatformTemplateSummaryResponse = {
  key: 'qovery-cluster-v0',
  version: '0.1.0',
  status: 'PUBLISHED',
  layers: [
    {
      key: 'karpenter',
      mandatory: false,
      enabledByDefault: false,
      components: [
        {
          key: 'karpenter-qovery-configuration',
          kind: 'HELM',
          fields: [
            {
              key: 'diskSizeGiB',
              type: 'number',
              label: 'Disk',
              required: true,
              sensitive: false,
              defaultValue: '50',
              constraints: {},
            },
            {
              key: 'stable',
              type: 'object',
              label: 'Stable',
              required: false,
              sensitive: false,
              fields: [
                {
                  key: 'spotEnabled',
                  type: 'bool',
                  label: 'Spot',
                  required: true,
                  sensitive: false,
                  defaultValue: 'false',
                  constraints: {},
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

jest.mock('./hooks/use-platform-templates', () => ({
  usePlatformTemplates: () => ({ data: [template] }),
}))
jest.mock('./hooks/use-platform-binding', () => ({
  usePlatformBinding: () => ({
    data: {
      clusterId: 'cluster',
      organizationId: 'organization',
      templateKey: 'qovery-cluster-v0',
      templateVersion: '0.1.0',
      layerSelections: { karpenter: true },
      layers: [],
      managedConfig: {
        'karpenter-configuration': {
          nodePools: [{ name: 'demo', spotEnabled: true }],
          resources: [{ manifest: initialManifest }],
        },
      },
      customerProvidedInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
    },
  }),
}))
jest.mock('./hooks/use-update-platform-binding', () => ({
  useUpdatePlatformBinding: () => ({ mutate: mockUpdateBinding, isLoading: false }),
}))
jest.mock('./hooks/use-platform-component-configuration', () => ({
  usePlatformComponentConfiguration: (args: unknown) => {
    mockResolve(args)
    return { data: undefined, isError: false, isFetching: false }
  },
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDebounce: (value: unknown) => value,
}))
jest.mock('./platform-configuration-catalog', () => ({
  PlatformConfigurationCatalog: ({
    onComponentSelect,
    onSave,
  }: {
    onComponentSelect: (key: string) => void
    onSave: () => void
  }) => (
    <>
      <button onClick={() => onComponentSelect('karpenter-qovery-configuration')}>Configure pools</button>
      <button onClick={() => onComponentSelect('karpenter-crd')}>Configure CRDs</button>
      <button onClick={() => onComponentSelect('karpenter-configuration')}>Configure custom pools</button>
      <button onClick={onSave}>Save layers</button>
    </>
  ),
}))
jest.mock('./platform-component-configuration', () => ({
  PlatformComponentConfiguration: ({
    onSave,
    component,
    isFieldVisible,
    profileConfig,
    onProfileConfigChange,
  }: {
    onSave: () => void
    component: PlatformTemplateComponentResponse
    isFieldVisible?: (field: FieldSchemaResponse) => boolean
    profileConfig: Record<string, unknown>
    onProfileConfigChange: (key: string, value: unknown) => void
  }) => (
    <>
      <div data-testid="destination">{component.key}</div>
      {component.fields
        .filter((field) => !isFieldVisible || isFieldVisible(field))
        .map((field) => (
          <div key={field.key}>
            <label>
              {field.label}
              <textarea readOnly value={JSON.stringify(profileConfig[field.key]) ?? ''} />
            </label>
            <button
              onClick={() =>
                onProfileConfigChange(
                  field.key,
                  field.key === 'resources'
                    ? [{ manifest: editedManifest }]
                    : [{ name: 'demo-edited', spotEnabled: true }]
                )
              }
            >
              Edit {field.label}
            </button>
            <button onClick={() => onProfileConfigChange(field.key, [])}>Clear {field.label}</button>
          </div>
        ))}
      <button onClick={onSave}>Save component</button>
    </>
  ),
}))

describe('PlatformConfiguration save', () => {
  beforeEach(() => mockUpdateBinding.mockClear())

  it.each(['component', 'layers'])(
    'persists displayed defaults when saving from %s without changing existing pools',
    async (from) => {
      const { userEvent } = renderWithProviders(
        <PlatformConfiguration
          clusterId="cluster"
          organizationId="organization"
          clusterMode="CUSTOMER_MANAGED"
          cloudProvider="AWS"
        />
      )
      await userEvent.click(screen.getByRole('button', { name: 'Configure pools' }))
      if (from === 'layers') {
        await userEvent.click(screen.getByRole('button', { name: 'Platform layers' }))
      }
      await userEvent.click(screen.getByRole('button', { name: from === 'layers' ? 'Save layers' : 'Save component' }))
      expect(mockUpdateBinding).toHaveBeenCalledWith({
        clusterId: 'cluster',
        organizationId: 'organization',
        request: {
          templateKey: 'qovery-cluster-v0',
          templateVersion: '0.1.0',
          layerSelections: { karpenter: true },
          managedConfig: {
            'karpenter-configuration': {
              nodePools: [{ name: 'demo', spotEnabled: true }],
              resources: [{ manifest: initialManifest }],
            },
            'karpenter-qovery-configuration': { diskSizeGiB: 50, stable: { spotEnabled: false } },
          },
          customerProvidedInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
        },
      })
    }
  )
})

describe('Karpenter YAML under CRDs', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockUpdateBinding.mockClear()
    mockResolve.mockClear()
  })
  afterEach(() => jest.useRealTimers())
  const originalComponents = [...template.layers[0].components]
  afterEach(() => {
    template.layers[0].components = [...originalComponents]
  })

  async function openConfiguration(crd = true, yaml = true) {
    template.layers[0].components = [
      ...originalComponents,
      ...(crd
        ? [
            {
              key: 'karpenter-crd',
              kind: 'HELM' as const,
              fields: [],
              configurationSections: [{ sourceComponentKey: 'karpenter-configuration', fieldKeys: ['resources'] }],
            },
          ]
        : []),
      ...(yaml ? [yamlComponent] : []),
    ]
    const { userEvent } = renderWithProviders(
      <PlatformConfiguration
        clusterId="cluster"
        organizationId="organization"
        clusterMode="CUSTOMER_MANAGED"
        cloudProvider="AWS"
      />
    )
    await userEvent.click(screen.getByRole('button', { name: crd ? 'Configure CRDs' : 'Configure custom pools' }))
    return userEvent
  }

  it('keeps the original CRD editor when no YAML schema exists', async () => {
    await openConfiguration(true, false)
    expect(screen.queryByLabelText('YAML resources')).not.toBeInTheDocument()
    expect(mockResolve).toHaveBeenLastCalledWith(
      expect.objectContaining({ componentKey: 'karpenter-crd', enabled: true })
    )
  })

  it('keeps YAML accessible in configuration when there is no CRD component', async () => {
    await openConfiguration(false)
    expect(screen.getByLabelText('YAML resources')).toBeInTheDocument()
    expect(screen.getByLabelText('NodePools')).toBeInTheDocument()
  })

  it('preserves edits and changes resolver owner when switching configuration sections', async () => {
    const userEvent = await openConfiguration()
    await userEvent.click(screen.getByRole('button', { name: 'Edit YAML resources' }))
    await userEvent.click(screen.getByRole('button', { name: 'General configuration' }))
    expect(mockResolve).toHaveBeenLastCalledWith(
      expect.objectContaining({ componentKey: 'karpenter-crd', enabled: true })
    )
    await userEvent.click(screen.getByRole('button', { name: 'YAML resources' }))
    expect(mockResolve).toHaveBeenLastCalledWith(
      expect.objectContaining({ componentKey: 'karpenter-configuration', enabled: true })
    )
    expect(screen.getByLabelText('YAML resources')).toHaveValue(JSON.stringify([{ manifest: editedManifest }]))
  })

  it('resolves and saves YAML through its owner, preserving pools, AWS inputs and edits across navigation', async () => {
    const userEvent = await openConfiguration()
    expect(screen.getByTestId('destination')).toHaveTextContent('karpenter-crd')
    expect(screen.getByLabelText('YAML resources')).toHaveValue(JSON.stringify([{ manifest: initialManifest }]))
    expect(screen.queryByLabelText('NodePools')).not.toBeInTheDocument()
    expect(mockResolve).toHaveBeenLastCalledWith(
      expect.objectContaining({
        componentKey: 'karpenter-configuration',
        enabled: true,
        request: {
          profileConfig: {
            nodePools: [{ name: 'demo', spotEnabled: true }],
            resources: [{ manifest: initialManifest }],
          },
          clusterInputs: { 'aws.eksClusterName': 'existing-cluster' },
          componentOutputs: {},
        },
      })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Edit YAML resources' }))
    await userEvent.click(screen.getByRole('button', { name: 'Platform layers' }))
    await userEvent.click(screen.getByRole('button', { name: 'Configure custom pools' }))
    expect(screen.queryByLabelText('YAML resources')).not.toBeInTheDocument()
    expect(screen.getByLabelText('NodePools')).toHaveValue(JSON.stringify([{ name: 'demo', spotEnabled: true }]))
    await userEvent.click(screen.getByRole('button', { name: 'Edit NodePools' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save component' }))
    expect(mockUpdateBinding.mock.calls[0][0].request.managedConfig).toEqual({
      'karpenter-configuration': {
        nodePools: [{ name: 'demo-edited', spotEnabled: true }],
        resources: [{ manifest: editedManifest }],
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Platform layers' }))
    await userEvent.click(screen.getByRole('button', { name: 'Configure CRDs' }))
    expect(screen.getByLabelText('YAML resources')).toHaveValue(JSON.stringify([{ manifest: editedManifest }]))
    await userEvent.click(screen.getByRole('button', { name: 'Clear YAML resources' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save component' }))
    expect(mockUpdateBinding.mock.calls[1][0].request).toMatchObject({
      managedConfig: {
        'karpenter-configuration': { nodePools: [{ name: 'demo-edited', spotEnabled: true }], resources: [] },
      },
      customerProvidedInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
    })
    expect(mockUpdateBinding.mock.calls[1][0].request.managedConfig).not.toHaveProperty('karpenter-crd')
  })
})

import { type PlatformTemplateComponentResponse, type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformConfiguration } from './platform-configuration'

const mockUpdateBinding = jest.fn()
const yamlComponent: PlatformTemplateComponentResponse = {
  key: 'karpenter-configuration',
  kind: 'HELM',
  fields: [
    {
      key: 'resources',
      type: 'array',
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
      managedConfig: { 'karpenter-configuration': { nodePools: [{ name: 'demo', spotEnabled: true }] } },
      customerProvidedInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
    },
  }),
}))
jest.mock('./hooks/use-update-platform-binding', () => ({
  useUpdatePlatformBinding: () => ({ mutate: mockUpdateBinding, isLoading: false }),
}))
jest.mock('./hooks/use-platform-component-configuration', () => ({
  usePlatformComponentConfiguration: () => ({ data: undefined, isError: false, isFetching: false }),
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
      <button onClick={onSave}>Save layers</button>
    </>
  ),
}))
jest.mock('./platform-component-configuration', () => ({
  PlatformComponentConfiguration: ({
    onSave,
    onManageYamlResources,
    component,
    focusField,
  }: {
    onSave: () => void
    onManageYamlResources?: () => void
    component: PlatformTemplateComponentResponse
    focusField?: string
  }) => (
    <>
      <div data-testid="destination">
        {component.key}:{focusField}
      </div>
      {onManageYamlResources && <button onClick={onManageYamlResources}>Manage YAML resources</button>}
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
            'karpenter-configuration': { nodePools: [{ name: 'demo', spotEnabled: true }] },
            'karpenter-qovery-configuration': { diskSizeGiB: 50, stable: { spotEnabled: false } },
          },
          customerProvidedInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
        },
      })
    }
  )
})

describe('Karpenter YAML shortcut', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
  const originalComponents = [...template.layers[0].components]
  afterEach(() => {
    template.layers[0].components = [...originalComponents]
  })

  async function openCrdConfiguration(available: boolean) {
    mockUpdateBinding.mockClear()
    template.layers[0].components = [
      ...originalComponents,
      { key: 'karpenter-crd', kind: 'HELM', fields: [] },
      ...(available ? [yamlComponent] : []),
    ]
    const { userEvent } = renderWithProviders(
      <PlatformConfiguration
        clusterId="cluster"
        organizationId="organization"
        clusterMode="CUSTOMER_MANAGED"
        cloudProvider="AWS"
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Configure CRDs' }))
    return userEvent
  }

  it('does not offer a shortcut when the YAML destination is absent', async () => {
    await openCrdConfiguration(false)
    expect(screen.queryByRole('button', { name: 'Manage YAML resources' })).not.toBeInTheDocument()
  })

  it('navigates to YAML resources while preserving pools and cluster inputs', async () => {
    const userEvent = await openCrdConfiguration(true)
    await userEvent.click(screen.getByRole('button', { name: 'Manage YAML resources' }))
    expect(screen.getByTestId('destination')).toHaveTextContent('karpenter-configuration:resources')
    expect(screen.queryByRole('button', { name: 'Manage YAML resources' })).not.toBeInTheDocument()
    expect(mockUpdateBinding).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Save component' }))
    expect(mockUpdateBinding.mock.calls[0][0].request).toMatchObject({
      managedConfig: { 'karpenter-configuration': { nodePools: [{ name: 'demo', spotEnabled: true }] } },
      customerProvidedInputs: { 'karpenter-configuration': { 'aws.eksClusterName': 'existing-cluster' } },
    })
  })
})

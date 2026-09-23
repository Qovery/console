import { useParams } from '@tanstack/react-router'
import {
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformBinding } from '../platform-configuration/hooks/use-platform-binding'
import { usePlatformComponentConfigurations } from '../platform-configuration/hooks/use-platform-component-configurations'
import { ClusterProfileFeature } from './cluster-profile'

jest.mock('@tanstack/react-router', () => ({ useParams: jest.fn() }))
jest.mock('../hooks/use-cluster/use-cluster')
jest.mock('../hooks/use-platform-templates/use-platform-templates')
jest.mock('../platform-configuration/hooks/use-platform-binding')
jest.mock('../platform-configuration/hooks/use-platform-component-configurations')

const mockUseParams = useParams as jest.Mock
const mockUseCluster = useCluster as jest.MockedFunction<typeof useCluster>
const mockUsePlatformTemplates = usePlatformTemplates as jest.MockedFunction<typeof usePlatformTemplates>
const mockUsePlatformBinding = usePlatformBinding as jest.MockedFunction<typeof usePlatformBinding>
const mockUsePlatformComponentConfigurations = usePlatformComponentConfigurations as jest.MockedFunction<
  typeof usePlatformComponentConfigurations
>

function createComponent(key: string, fields: unknown[] = [], configurationSections: unknown[] = []) {
  return {
    key,
    kind: 'HELM',
    fields,
    configurationSections,
  } as unknown as PlatformTemplateComponentResponse
}

const mockTemplates = [
  {
    key: 'qovery-cluster-v0',
    version: '1.0.0',
    status: 'PUBLISHED',
    layers: [
      {
        key: 'infrastructure',
        mandatory: false,
        enabledByDefault: false,
        description: 'Infrastructure components',
        components: [],
      },
      {
        key: 'qovery-stack',
        mandatory: true,
        enabledByDefault: true,
        components: [
          createComponent('cluster-agent'),
          createComponent('shell-agent'),
          createComponent('qovery-priority-class'),
        ],
      },
      {
        key: 'log-infra',
        mandatory: true,
        enabledByDefault: true,
        description: 'Collects logs from everything running on this cluster and makes them searchable in Qovery',
        components: [
          createComponent('loki', [
            {
              key: 'retention-period',
              label: 'Retention period',
              type: 'number',
              required: true,
              sensitive: false,
              defaultValue: '12',
              constraints: { min: 1 },
            },
            {
              key: 'high-availability',
              label: 'High availability',
              type: 'bool',
              required: false,
              sensitive: false,
              constraints: {},
            },
            {
              key: 'resource-profile',
              label: 'Resource profile',
              type: 'string',
              required: false,
              sensitive: false,
              constraints: { allowedValues: ['CHART_DEFAULT', 'SMALL', 'MEDIUM', 'LARGE'] },
            },
            {
              key: 'storage',
              label: 'Storage',
              type: 'string',
              required: false,
              sensitive: false,
              constraints: { allowedValues: ['PVC', 's3', 'gcs', 'azure'] },
            },
          ]),
          createComponent(
            'alloy',
            [
              {
                key: 'endpoint',
                label: 'Endpoint',
                type: 'string',
                required: false,
                sensitive: false,
                constraints: {},
              },
            ],
            [{ sourceComponentKey: 'loki', fieldKeys: ['resource-profile'] }]
          ),
        ],
      },
      {
        key: 'network',
        mandatory: false,
        enabledByDefault: true,
        components: [createComponent('envoy')],
      },
    ],
  },
] as unknown as PlatformTemplateSummaryResponse[]

function createResolution(componentKey: string): PlatformComponentConfigurationResolutionResponse {
  const component = mockTemplates[0].layers.flatMap((layer) => layer.components).find(({ key }) => key === componentKey)

  return {
    componentKey,
    fields: component?.fields ?? [],
    requirements: [],
    componentBindings: [],
    violations: [],
  }
}

function createComponentQueries(componentKeys: string[], isFetching = false) {
  return componentKeys.map((componentKey) => ({
    data: createResolution(componentKey),
    isError: false,
    isFetching,
  })) as ReturnType<typeof usePlatformComponentConfigurations>
}

describe('ClusterProfileFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ clusterId: 'cluster-id' })
    mockUseCluster.mockReturnValue({
      data: { cloud_provider: 'AWS', kubernetes: 'SELF_MANAGED' },
      isError: false,
      isLoading: false,
    } as ReturnType<typeof useCluster>)
    mockUsePlatformTemplates.mockReturnValue({
      data: mockTemplates,
      isError: false,
      isLoading: false,
    } as ReturnType<typeof usePlatformTemplates>)
    mockUsePlatformBinding.mockReturnValue({
      data: null,
      isError: false,
      isLoading: false,
    } as ReturnType<typeof usePlatformBinding>)
    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki', 'alloy']))
  })

  it('renders API-defined configuration fields', () => {
    const { container } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(mockUsePlatformTemplates).toHaveBeenCalledWith({
      organizationId: 'organization-id',
      clusterMode: 'CUSTOMER_MANAGED',
      cloudProvider: 'AWS',
      enabled: true,
    })
    expect(screen.getByRole('banner')).not.toHaveClass('border-b')
    expect(container.querySelectorAll('.fa-circle-check')).toHaveLength(1)
    expect(container.querySelectorAll('.fa-circle-minus')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Log infra' })).toBeInTheDocument()
    expect(
      screen.getByText('Collects logs from everything running on this cluster and makes them searchable in Qovery')
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Loki' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(12)
    expect(screen.getByRole('combobox', { name: 'Resource profile' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Storage' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restore all' })).toBeDisabled()
    expect(screen.getAllByText('Loki').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alloy').length).toBeGreaterThan(0)
  })

  it('allows the UI controls to be previewed locally', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(screen.getByRole('tab', { name: 'Loki' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(12)

    const highAvailability = screen.getByRole('switch', { name: 'High availability' })
    expect(highAvailability).not.toBeChecked()
    await userEvent.click(highAvailability)
    expect(highAvailability).toBeChecked()

    expect(screen.getByRole('switch', { name: 'Enable log infrastructure' })).toBeDisabled()
  })

  it('renders configuration sections from their source component', () => {
    renderWithProviders(<ClusterProfileFeature organizationId="organization-id" activeComponentKey="alloy" />)

    expect(screen.getByRole('textbox', { name: 'Endpoint' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Resource profile' })).toBeInTheDocument()
  })

  it('shows a skeleton instead of stale fields while switching components', () => {
    const { rerender } = renderWithProviders(
      <ClusterProfileFeature organizationId="organization-id" activeComponentKey="loki" />
    )

    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()

    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki'], true))
    rerender(<ClusterProfileFeature organizationId="organization-id" activeComponentKey="alloy" />)

    expect(screen.getByRole('status', { name: 'Loading configuration' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Retention period' })).not.toBeInTheDocument()
  })

  it('uses the URL-selected component as the active sidebar item', async () => {
    const onActiveComponentChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <ClusterProfileFeature
        organizationId="organization-id"
        activeComponentKey="alloy"
        onActiveComponentChange={onActiveComponentChange}
      />
    )

    expect(screen.getByRole('button', { name: 'Log infra' }).closest('li')).toHaveClass('bg-surface-neutral-component')
    expect(screen.getByRole('button', { name: 'Alloy' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('tab', { name: 'Alloy' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Loki' })).not.toHaveAttribute('aria-current', 'page')

    await userEvent.click(screen.getByRole('tab', { name: 'Loki' }))

    expect(onActiveComponentChange).toHaveBeenCalledWith('loki')
  })

  it('filters the layer tree from the search input', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)
    const search = screen.getByRole('textbox', { name: 'Search layers' })

    await userEvent.type(search, 'network')

    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.queryByText('Qovery stack')).not.toBeInTheDocument()
  })
})

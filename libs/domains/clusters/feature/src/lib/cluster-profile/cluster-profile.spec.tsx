import { useParams } from '@tanstack/react-router'
import {
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformBinding } from '../platform-configuration/hooks/use-platform-binding'
import { usePlatformComponentConfigurations } from '../platform-configuration/hooks/use-platform-component-configurations'
import { ClusterProfileFeature } from './cluster-profile'

jest.mock('@tanstack/react-router', () => ({ useParams: jest.fn() }))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDebounce: <T,>(value: T) => value,
}))
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
        components: [
          createComponent('envoy', [
            {
              key: 'envoy.client_validation.ca_certificates',
              label: 'Client-validation CA certificates',
              description: 'Trust anchors required for mutual TLS client validation.',
              type: 'array',
              required: false,
              sensitive: false,
              constraints: { minItems: null, maxItems: 2, uniqueItems: false },
              items: {
                type: 'object',
                fields: [
                  {
                    key: 'name',
                    label: 'Certificate name',
                    type: 'string',
                    required: true,
                    sensitive: false,
                    defaultValue: null,
                    constraints: {},
                  },
                  {
                    key: 'ca_crt',
                    label: 'CA certificate PEM',
                    type: 'string',
                    required: true,
                    sensitive: false,
                    defaultValue: null,
                    constraints: {},
                  },
                ],
              },
              itemFields: [],
            },
            {
              key: 'envoy.trusted_cidrs',
              label: 'Trusted CIDRs',
              type: 'array',
              required: false,
              sensitive: false,
              constraints: { uniqueItems: true },
              items: { type: 'string', constraints: {} },
            },
          ]),
        ],
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

function createComponentQueries(componentKeys: string[], isFetching = false, isError = false) {
  return componentKeys.map((componentKey) => ({
    data: createResolution(componentKey),
    isError,
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
    expect(container.querySelectorAll('.fa-circle-check')).toHaveLength(0)
    expect(container.querySelectorAll('.fa-circle-minus')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Log infra' })).toBeInTheDocument()
    expect(
      screen.getByText('Collects logs from everything running on this cluster and makes them searchable in Qovery')
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Loki' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Loki' }).querySelector('svg')?.outerHTML).toBe(
      screen.getByRole('button', { name: 'Loki' }).querySelector('svg')?.outerHTML
    )
    expect(screen.getByRole('tab', { name: 'Alloy' }).querySelector('svg')?.outerHTML).toBe(
      screen.getByRole('button', { name: 'Alloy' }).querySelector('svg')?.outerHTML
    )
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

  it('shows the skeleton until the selected component has a resolved configuration', () => {
    mockUsePlatformComponentConfigurations.mockReturnValue([
      { data: undefined, isError: false, isFetching: true },
    ] as ReturnType<typeof usePlatformComponentConfigurations>)

    renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(screen.getByRole('status', { name: 'Loading configuration' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Retention period' })).not.toBeInTheDocument()
  })

  it('keeps the form visible while a field edit triggers a resolver refetch', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)
    const highAvailability = screen.getByRole('switch', { name: 'High availability' })

    await userEvent.click(highAvailability)

    expect(highAvailability).toBeChecked()
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading configuration' })).not.toBeInTheDocument()
  })

  it('keeps the last resolved form visible when a background resolver refresh fails', () => {
    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki'], false, true))

    renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(screen.getByRole('alert')).toHaveTextContent('The last resolved fields are still shown.')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()
  })

  it('does not replace the active form with an error from an undisplayed component', () => {
    mockUsePlatformComponentConfigurations.mockReturnValue([
      ...createComponentQueries(['loki']),
      ...createComponentQueries(['alloy'], false, true),
    ])

    renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()
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

  describe('array fields', () => {
    beforeEach(() => {
      mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['envoy']))
    })

    it('adds, edits and removes object array items through a modal', async () => {
      const { userEvent } = renderWithProviders(
        <ClusterProfileFeature organizationId="organization-id" activeComponentKey="envoy" />
      )

      expect(screen.getByText('Client-validation CA certificates')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Add item to Client-validation CA certificates' }))

      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByText('Client-validation CA certificates')).toBeInTheDocument()
      expect(within(dialog).getByRole('button', { name: 'Add' })).toBeDisabled()

      await userEvent.type(within(dialog).getByLabelText('Certificate name'), 'client-ca')
      await userEvent.type(within(dialog).getByLabelText('CA certificate PEM'), 'pem')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Add' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByText('client-ca')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Edit client-ca' }))
      const editDialog = await screen.findByRole('dialog')
      const nameInput = within(editDialog).getByLabelText('Certificate name')
      expect(nameInput).toHaveValue('client-ca')
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'renamed-ca')
      await userEvent.click(within(editDialog).getByRole('button', { name: 'Save' }))

      expect(screen.getByText('renamed-ca')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Remove renamed-ca' }))
      expect(screen.queryByText('renamed-ca')).not.toBeInTheDocument()
    })

    it('disables the add button once the item limit is reached', () => {
      mockUsePlatformBinding.mockReturnValue({
        data: {
          managedConfig: {
            envoy: {
              'envoy.client_validation.ca_certificates': [
                { name: 'first', ca_crt: 'pem' },
                { name: 'second', ca_crt: 'pem' },
              ],
            },
          },
        },
        isError: false,
        isLoading: false,
      } as unknown as ReturnType<typeof usePlatformBinding>)

      renderWithProviders(<ClusterProfileFeature organizationId="organization-id" activeComponentKey="envoy" />)

      expect(screen.getByRole('button', { name: 'Add item to Client-validation CA certificates' })).toBeDisabled()
      expect(screen.getByText('Limit of 2 reached.')).toBeInTheDocument()
    })

    it('adds scalar array items through a modal', async () => {
      const { userEvent } = renderWithProviders(
        <ClusterProfileFeature organizationId="organization-id" activeComponentKey="envoy" />
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add item to Trusted CIDRs' }))
      const dialog = await screen.findByRole('dialog')
      await userEvent.type(within(dialog).getByLabelText('Trusted CIDRs'), '10.0.0.0/8')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Add' }))

      expect(screen.getByText('10.0.0.0/8')).toBeInTheDocument()
      const calls = mockUsePlatformComponentConfigurations.mock.calls
      expect(calls[calls.length - 1][0].requests['envoy'].profileConfig).toEqual({
        'envoy.trusted_cidrs': ['10.0.0.0/8'],
      })
    })

    it('shows violations on array items and unmapped violations', () => {
      mockUsePlatformBinding.mockReturnValue({
        data: {
          managedConfig: {
            envoy: { 'envoy.client_validation.ca_certificates': [{ name: 'INVALID', ca_crt: 'pem' }] },
          },
        },
        isError: false,
        isLoading: false,
      } as unknown as ReturnType<typeof usePlatformBinding>)
      mockUsePlatformComponentConfigurations.mockReturnValue([
        {
          data: {
            ...createResolution('envoy'),
            violations: [
              {
                code: 'PATTERN',
                fieldPath: 'envoy.client_validation.ca_certificates[0].name',
                message: 'Name must be lowercase.',
              },
              { code: 'UNKNOWN', fieldPath: 'envoy.unknown', message: 'Something else is wrong.' },
            ],
          },
          isError: false,
          isFetching: false,
        },
      ] as ReturnType<typeof usePlatformComponentConfigurations>)

      renderWithProviders(<ClusterProfileFeature organizationId="organization-id" activeComponentKey="envoy" />)

      expect(screen.getByText('INVALID')).toBeInTheDocument()
      expect(screen.getByText('Name must be lowercase.')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Something else is wrong.')
    })
  })

  it('filters the layer tree from the search input', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature organizationId="organization-id" />)
    const search = screen.getByRole('textbox', { name: 'Search layers' })

    await userEvent.type(search, 'network')

    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.queryByText('Qovery stack')).not.toBeInTheDocument()
  })
})

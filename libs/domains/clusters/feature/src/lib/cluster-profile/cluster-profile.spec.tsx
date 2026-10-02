import { useParams } from '@tanstack/react-router'
import {
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { useModal } from '@qovery/shared/ui'
import { act, renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformComponentConfigurations } from '../platform-configuration/hooks/use-platform-component-configurations'
import { usePlatformConfiguration } from '../platform-configuration/hooks/use-platform-configuration'
import { useUpdatePlatformConfiguration } from '../platform-configuration/hooks/use-update-platform-configuration'
import { ClusterProfileFeature } from './cluster-profile'

jest.mock('@tanstack/react-router', () => ({ useParams: jest.fn() }))
const mockUseDebounce = jest.fn(<T,>(value: T) => value)
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDebounce: <T,>(value: T) => mockUseDebounce(value),
}))
jest.mock('@qovery/shared/ui', () => {
  const React = jest.requireActual('react')
  const ui = jest.requireActual('@qovery/shared/ui')
  return {
    ...ui,
    Icon: (props: { name?: string }) =>
      React.createElement('span', { 'data-icon-name': props.name }, React.createElement(ui.Icon, props)),
  }
})
jest.mock('../hooks/use-cluster/use-cluster')
jest.mock('../hooks/use-cluster-operator-status/use-cluster-operator-status', () => ({
  useClusterOperatorStatus: () => ({ data: null, isLoading: false }),
}))
jest.mock('../hooks/use-deploy-cluster/use-deploy-cluster')
jest.mock('../platform-configuration/hooks/use-update-platform-configuration')
jest.mock('../hooks/use-platform-templates/use-platform-templates')
jest.mock('../platform-configuration/hooks/use-platform-configuration')
jest.mock('../platform-configuration/hooks/use-platform-component-configurations')

const mockUseParams = useParams as jest.Mock
const mockUseCluster = useCluster as jest.MockedFunction<typeof useCluster>
const mockUsePlatformTemplates = usePlatformTemplates as jest.MockedFunction<typeof usePlatformTemplates>
const mockUsePlatformConfiguration = usePlatformConfiguration as jest.MockedFunction<typeof usePlatformConfiguration>
const mockUseDeployCluster = useDeployCluster as jest.Mock
const mockUseUpdatePlatformBinding = useUpdatePlatformConfiguration as jest.Mock
const mockDeployCluster = jest.fn()
const mockUpdatePlatformConfiguration = jest.fn()
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
      {
        key: 'karpenter',
        mandatory: false,
        enabledByDefault: true,
        components: [
          createComponent('karpenter-crd'),
          createComponent('karpenter-configuration', [
            {
              key: 'node-pool',
              label: 'Node pool',
              type: 'string',
              required: false,
              sensitive: false,
              constraints: {},
            },
          ]),
        ],
      },
      {
        key: 'crds',
        mandatory: false,
        enabledByDefault: true,
        components: [createComponent('gateway-crd')],
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
    mockUseDebounce.mockImplementation(<T,>(value: T) => value)
    mockUseParams.mockReturnValue({ organizationId: 'organization-id', clusterId: 'cluster-id' })
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
    mockUsePlatformConfiguration.mockReturnValue({
      data: null,
      isError: false,
      isLoading: false,
    } as ReturnType<typeof usePlatformConfiguration>)
    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki', 'alloy']))
    mockUpdatePlatformConfiguration.mockResolvedValue({})
    mockDeployCluster.mockResolvedValue({})
    mockUseUpdatePlatformBinding.mockReturnValue({ mutateAsync: mockUpdatePlatformConfiguration, isLoading: false })
    mockUseDeployCluster.mockReturnValue({ mutateAsync: mockDeployCluster, isLoading: false })
  })

  it.each([
    ['AWS', 'AWS'],
    ['GCP', 'GCP'],
    ['OVH', 'OVH_CLOUD'],
    ['ORACLE', 'ORACLE_CLOUD'],
    ['IBM', 'IBM_CLOUD'],
  ])('shows the %s provider icon in the header', (cloudProvider, iconName) => {
    mockUseCluster.mockReturnValue({
      data: { name: 'my-cluster', cloud_provider: cloudProvider, kubernetes: 'SELF_MANAGED' },
      isError: false,
      isLoading: false,
    } as ReturnType<typeof useCluster>)
    renderWithProviders(<ClusterProfileFeature />)

    expect(screen.getByRole('banner').querySelector(`[data-icon-name="${iconName}"]`)).toBeInTheDocument()
  })

  it('renders API-defined configuration fields', () => {
    const { container } = renderWithProviders(<ClusterProfileFeature />)

    expect(mockUsePlatformTemplates).toHaveBeenCalledWith({
      organizationId: 'organization-id',
      clusterMode: 'CUSTOMER_MANAGED',
      cloudProvider: 'AWS',
      enabled: true,
    })
    expect(screen.getByRole('banner')).not.toHaveClass('border-b')
    expect(container.querySelectorAll('.fa-circle-check')).toHaveLength(0)
    // No layer status without a cluster configuration: no layer is skipped or managed by Qovery.
    expect(container.querySelectorAll('.fa-circle-minus')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: 'Log infra' })).toBeInTheDocument()
    expect(
      screen.getByText('Collects logs from everything running on this cluster and makes them searchable in Qovery')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Loki' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Loki' }).querySelector('svg')?.outerHTML).toBe(
      screen.getByRole('button', { name: 'Loki' }).querySelector('svg')?.outerHTML
    )
    expect(screen.getByRole('link', { name: 'Alloy' }).querySelector('svg')?.outerHTML).toBe(
      screen.getByRole('button', { name: 'Alloy' }).querySelector('svg')?.outerHTML
    )
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(12)
    expect(screen.getByRole('combobox', { name: 'Resource profile' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Storage' })).toBeInTheDocument()
    expect(screen.getAllByText('Loki').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alloy').length).toBeGreaterThan(0)
  })

  it('allows the UI controls to be previewed locally', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

    expect(screen.getByRole('link', { name: 'Loki' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(12)

    const highAvailability = screen.getByRole('switch', { name: 'High availability' })
    expect(highAvailability).not.toBeChecked()
    await userEvent.click(highAvailability)
    expect(highAvailability).toBeChecked()
  })

  it('renders configuration sections from their source component', () => {
    renderWithProviders(<ClusterProfileFeature activeComponentKey="alloy" />)

    expect(screen.getByRole('textbox', { name: 'Endpoint' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Resource profile' })).toBeInTheDocument()
  })

  it('shows a skeleton instead of stale fields while switching components', () => {
    const { rerender } = renderWithProviders(<ClusterProfileFeature activeComponentKey="loki" />)

    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()

    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki'], true))
    rerender(<ClusterProfileFeature activeComponentKey="alloy" />)

    expect(screen.getByRole('status', { name: 'Loading configuration' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Retention period' })).not.toBeInTheDocument()
  })

  it('shows the skeleton until the selected component has a resolved configuration', () => {
    mockUsePlatformComponentConfigurations.mockReturnValue([
      { data: undefined, isError: false, isFetching: true },
    ] as ReturnType<typeof usePlatformComponentConfigurations>)

    renderWithProviders(<ClusterProfileFeature />)

    expect(screen.getByRole('status', { name: 'Loading configuration' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Retention period' })).not.toBeInTheDocument()
  })

  it('keeps the form visible while a field edit triggers a resolver refetch', async () => {
    const { userEvent } = renderWithProviders(<ClusterProfileFeature />)
    const highAvailability = screen.getByRole('switch', { name: 'High availability' })
    // Queries keep their previous data while refetching.
    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki', 'alloy'], true))

    await userEvent.click(highAvailability)

    expect(highAvailability).toBeChecked()
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Loading configuration' })).not.toBeInTheDocument()
  })

  it('keeps the last resolved form visible when a background resolver refresh fails', () => {
    mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki'], false, true))

    renderWithProviders(<ClusterProfileFeature />)

    expect(screen.getByRole('alert')).toHaveTextContent('The last resolved fields are still shown.')
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()
  })

  it('does not replace the active form with an error from an undisplayed component', () => {
    mockUsePlatformComponentConfigurations.mockReturnValue([
      ...createComponentQueries(['loki']),
      ...createComponentQueries(['alloy'], false, true),
    ])

    renderWithProviders(<ClusterProfileFeature />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toBeInTheDocument()
  })

  it('uses the URL-selected component as the active sidebar item', async () => {
    const onActiveComponentChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <ClusterProfileFeature activeComponentKey="alloy" onActiveComponentChange={onActiveComponentChange} />
    )

    expect(screen.getByRole('button', { name: 'Log infra' }).closest('li')).toHaveClass('bg-surface-neutral-component')
    expect(screen.getByRole('button', { name: 'Alloy' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Alloy' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Loki' })).not.toHaveAttribute('aria-current', 'page')
    expect(
      within(screen.getByRole('navigation', { name: 'Log infra configuration' })).getByRole('link', { name: 'Alloy' })
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Loki' }))

    expect(onActiveComponentChange).toHaveBeenCalledWith('loki')
  })

  it('resolves another component without waiting for the edit debounce', async () => {
    // A debounce that never settles: only edits may wait for it.
    mockUseDebounce.mockImplementation(<T,>(value: T) => jest.requireActual('react').useRef(value).current)
    mockUsePlatformComponentConfigurations.mockImplementation(({ requests }) =>
      createComponentQueries(Object.keys(requests))
    )
    function ClusterProfileWithNavigation() {
      const [componentKey, setComponentKey] = useState<string>()
      return <ClusterProfileFeature activeComponentKey={componentKey} onActiveComponentChange={setComponentKey} />
    }
    const { userEvent } = renderWithProviders(<ClusterProfileWithNavigation />)

    await userEvent.click(screen.getByRole('button', { name: 'Envoy' }))

    expect(mockUsePlatformComponentConfigurations).toHaveBeenLastCalledWith(
      expect.objectContaining({ requests: { envoy: expect.anything() } })
    )
    expect(screen.queryByRole('status', { name: 'Loading configuration' })).not.toBeInTheDocument()
  })

  it('moves between the component tabs with the arrow keys', async () => {
    const onActiveComponentChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <ClusterProfileFeature activeComponentKey="loki" onActiveComponentChange={onActiveComponentChange} />
    )
    screen.getByRole('link', { name: 'Loki' }).focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(screen.getByRole('link', { name: 'Alloy' })).toHaveFocus()
    expect(onActiveComponentChange).not.toHaveBeenCalled()

    await userEvent.keyboard('{Enter}')

    expect(onActiveComponentChange).toHaveBeenCalledWith('alloy')
  })

  describe('array fields', () => {
    beforeEach(() => {
      mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['envoy']))
    })

    it('adds, edits and removes object array items through a modal', async () => {
      const { userEvent } = renderWithProviders(<ClusterProfileFeature activeComponentKey="envoy" />)

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

    it('closes the item modal when the profile unmounts', async () => {
      let hideProfile: () => void = () => undefined
      function ClusterProfileUntilHidden() {
        const [isShown, setIsShown] = useState(true)
        hideProfile = () => setIsShown(false)
        return isShown ? <ClusterProfileFeature activeComponentKey="envoy" /> : null
      }
      const { userEvent } = renderWithProviders(<ClusterProfileUntilHidden />)

      await userEvent.click(screen.getByRole('button', { name: 'Add item to Client-validation CA certificates' }))
      expect(await screen.findByRole('dialog')).toBeInTheDocument()

      act(() => hideProfile())

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('does not close another modal after the item modal was dismissed', async () => {
      let hideProfile: () => void = () => undefined
      function ClusterProfileWithOtherModal() {
        const [isShown, setIsShown] = useState(true)
        const { openModal } = useModal()
        hideProfile = () => setIsShown(false)
        return (
          <>
            <button type="button" onClick={() => openModal({ content: <p>Other modal</p> })}>
              Open other modal
            </button>
            {isShown ? <ClusterProfileFeature activeComponentKey="envoy" /> : null}
          </>
        )
      }
      const { userEvent } = renderWithProviders(<ClusterProfileWithOtherModal />)

      await userEvent.click(screen.getByRole('button', { name: 'Add item to Client-validation CA certificates' }))
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

      await userEvent.click(screen.getByRole('button', { name: 'Open other modal' }))
      expect(await screen.findByText('Other modal')).toBeInTheDocument()
      act(() => hideProfile())

      expect(screen.getByText('Other modal')).toBeInTheDocument()
    })

    it('disables the add button once the item limit is reached', () => {
      mockUsePlatformConfiguration.mockReturnValue({
        data: {
          clusterInputs: {},
          platform: {
            templateKey: 'qovery-cluster-v0',
            templateVersion: '1.0.0',
            managedConfig: {
              envoy: {
                'envoy.client_validation.ca_certificates': [
                  { name: 'first', ca_crt: 'pem' },
                  { name: 'second', ca_crt: 'pem' },
                ],
              },
            },
          },
        },
        isError: false,
        isLoading: false,
      } as unknown as ReturnType<typeof usePlatformConfiguration>)

      renderWithProviders(<ClusterProfileFeature activeComponentKey="envoy" />)

      expect(screen.getByRole('button', { name: 'Add item to Client-validation CA certificates' })).toBeDisabled()
      expect(screen.getByText('Limit of 2 reached.')).toBeInTheDocument()
    })

    it('adds scalar array items through a modal', async () => {
      const { userEvent } = renderWithProviders(<ClusterProfileFeature activeComponentKey="envoy" />)

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
      mockUsePlatformConfiguration.mockReturnValue({
        data: {
          clusterInputs: {},
          platform: {
            templateKey: 'qovery-cluster-v0',
            templateVersion: '1.0.0',
            managedConfig: {
              envoy: { 'envoy.client_validation.ca_certificates': [{ name: 'INVALID', ca_crt: 'pem' }] },
            },
          },
        },
        isError: false,
        isLoading: false,
      } as unknown as ReturnType<typeof usePlatformConfiguration>)
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

      renderWithProviders(<ClusterProfileFeature activeComponentKey="envoy" />)

      expect(screen.getByText('INVALID')).toBeInTheDocument()
      expect(screen.getByText('Name must be lowercase.')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Something else is wrong.')
    })
  })

  describe('search', () => {
    it('reports search input changes', async () => {
      const onSearchChange = jest.fn()
      const { userEvent } = renderWithProviders(<ClusterProfileFeature onSearchChange={onSearchChange} />)

      await userEvent.type(screen.getByRole('textbox', { name: 'Search layers' }), 'n')

      expect(onSearchChange).toHaveBeenCalledWith('n')
    })

    it('keeps the whole layer when its label matches', () => {
      renderWithProviders(<ClusterProfileFeature search="network" />)

      expect(screen.getByRole('textbox', { name: 'Search layers' })).toHaveValue('network')
      expect(screen.getByRole('button', { name: 'Network' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Envoy' })).toHaveAttribute('aria-current', 'page')
      expect(screen.queryByRole('button', { name: 'Qovery stack' })).not.toBeInTheDocument()
    })

    it('filters components and fields matching the search', () => {
      renderWithProviders(<ClusterProfileFeature search="Resource" />)

      expect(screen.getByRole('button', { name: 'Loki' })).toHaveAttribute('aria-current', 'page')
      // Alloy renders the Loki resource profile through a configuration section.
      expect(screen.getByRole('button', { name: 'Alloy' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Network' })).not.toBeInTheDocument()
      expect(screen.getByText('Resource', { selector: 'mark' })).toBeInTheDocument()
      expect(screen.queryByRole('spinbutton', { name: 'Retention period' })).not.toBeInTheDocument()
    })

    it('selects the first matching component when the URL one does not match', () => {
      const onActiveComponentChange = jest.fn()
      renderWithProviders(
        <ClusterProfileFeature
          activeComponentKey="loki"
          search="certificate name"
          onActiveComponentChange={onActiveComponentChange}
        />
      )

      expect(screen.getByRole('button', { name: 'Envoy' })).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('link', { name: 'Envoy' })).toHaveAttribute('aria-current', 'page')
      expect(screen.queryByRole('link', { name: 'Loki' })).not.toBeInTheDocument()
      expect(onActiveComponentChange).not.toHaveBeenCalled()
    })

    it('shows empty states when nothing matches', () => {
      renderWithProviders(<ClusterProfileFeature search="CPUza" />)

      expect(screen.getByText('No layers match your search')).toBeInTheDocument()
      expect(screen.getByText('No settings match your search')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Log infra' })).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('changes bar', () => {
    async function editProfile(userEvent: ReturnType<typeof renderWithProviders>['userEvent']) {
      await userEvent.click(screen.getByRole('switch', { name: 'High availability' }))
      return screen.getByRole('region', { name: 'Unsaved profile changes' })
    }

    it('blocks saving while the edits have violations', async () => {
      const [loki, alloy] = createComponentQueries(['loki', 'alloy'])
      mockUsePlatformComponentConfigurations.mockReturnValue([
        {
          ...loki,
          data: {
            ...createResolution('loki'),
            violations: [{ fieldPath: 'storage', code: 'REQUIRED', message: 'Storage is required.' }],
          },
        },
        alloy,
      ] as ReturnType<typeof usePlatformComponentConfigurations>)
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      const bar = await editProfile(userEvent)

      expect(within(bar).getByRole('button', { name: 'Save' })).toBeDisabled()
      expect(within(bar).getByRole('button', { name: 'Save and deploy' })).toBeDisabled()
    })

    it('keeps blocking saving once the invalid component is out of view', async () => {
      mockUsePlatformComponentConfigurations.mockImplementation(
        ({ requests }) =>
          Object.keys(requests).map((componentKey) => ({
            data: {
              ...createResolution(componentKey),
              violations:
                componentKey === 'loki'
                  ? [{ fieldPath: 'storage', code: 'REQUIRED', message: 'Storage is required.' }]
                  : [],
            },
            isError: false,
            isFetching: false,
          })) as ReturnType<typeof usePlatformComponentConfigurations>
      )
      function ClusterProfileWithNavigation() {
        const [componentKey, setComponentKey] = useState<string>()
        return <ClusterProfileFeature activeComponentKey={componentKey} onActiveComponentChange={setComponentKey} />
      }
      const { userEvent } = renderWithProviders(<ClusterProfileWithNavigation />)

      const bar = await editProfile(userEvent)
      await userEvent.click(screen.getByRole('button', { name: 'Envoy' }))

      expect(screen.getByRole('link', { name: 'Envoy' })).toHaveAttribute('aria-current', 'page')
      expect(within(bar).getByRole('button', { name: 'Save' })).toBeDisabled()
      expect(within(bar).getByRole('button', { name: 'Save and deploy' })).toBeDisabled()
    })

    it('blocks saving while a required input is missing', async () => {
      const [loki, alloy] = createComponentQueries(['loki', 'alloy'])
      mockUsePlatformComponentConfigurations.mockReturnValue([
        {
          ...loki,
          data: {
            ...createResolution('loki'),
            requirements: [
              {
                key: 'infra.s3BucketName',
                label: 'S3 bucket name',
                type: 'string',
                required: true,
                sensitive: false,
                constraints: {},
                status: 'MISSING',
              },
            ],
          },
        },
        alloy,
      ] as ReturnType<typeof usePlatformComponentConfigurations>)
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      const bar = await editProfile(userEvent)

      expect(within(bar).getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('blocks saving while the edits are being checked', async () => {
      mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki', 'alloy'], true))
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      const bar = await editProfile(userEvent)

      expect(within(bar).getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('blocks saving when the edits could not be checked', async () => {
      mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['loki', 'alloy'], false, true))
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      const bar = await editProfile(userEvent)

      expect(within(bar).getByRole('button', { name: 'Save' })).toBeDisabled()
    })

    it('appears once a value differs from the saved one', async () => {
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      expect(screen.queryByRole('button', { name: 'Deploy' })).not.toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Unsaved profile changes' })).not.toBeInTheDocument()

      const highAvailability = screen.getByRole('switch', { name: 'High availability' })
      await userEvent.click(highAvailability)

      expect(screen.getByRole('region', { name: 'Unsaved profile changes' })).toHaveTextContent('1 change ongoing')

      await userEvent.click(highAvailability)

      await waitFor(() =>
        expect(screen.queryByRole('region', { name: 'Unsaved profile changes' })).not.toBeInTheDocument()
      )
    })

    it('resets the local changes', async () => {
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      await userEvent.click(screen.getByRole('switch', { name: 'High availability' }))
      await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

      expect(screen.getByRole('switch', { name: 'High availability' })).not.toBeChecked()
      await waitFor(() =>
        expect(screen.queryByRole('region', { name: 'Unsaved profile changes' })).not.toBeInTheDocument()
      )
    })

    it('saves the changes into the cluster platform configuration', async () => {
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      await userEvent.click(screen.getByRole('switch', { name: 'High availability' }))
      await userEvent.click(screen.getByRole('button', { name: 'Save' }))

      expect(mockUpdatePlatformConfiguration).toHaveBeenCalledWith({
        clusterId: 'cluster-id',
        configurationRequest: {
          platform: expect.objectContaining({
            templateKey: 'qovery-cluster-v0',
            templateVersion: '1.0.0',
            managedConfig: { loki: { 'high-availability': true } },
          }),
          clusterInputs: {},
        },
      })
      expect(mockDeployCluster).not.toHaveBeenCalled()
    })

    it('keeps the edits made while saving', async () => {
      let resolveSave = () => undefined as unknown
      mockUpdatePlatformConfiguration.mockReturnValue(new Promise((resolve) => (resolveSave = resolve)))
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      await userEvent.click(screen.getByRole('switch', { name: 'High availability' }))
      await userEvent.click(screen.getByRole('button', { name: 'Save' }))
      await userEvent.clear(screen.getByRole('spinbutton', { name: 'Retention period' }))
      await userEvent.type(screen.getByRole('spinbutton', { name: 'Retention period' }), '24')
      await act(async () => {
        resolveSave()
      })

      expect(screen.getByRole('spinbutton', { name: 'Retention period' })).toHaveValue(24)
      expect(screen.getByRole('switch', { name: 'High availability' })).not.toBeChecked()
      expect(
        within(screen.getByRole('region', { name: 'Unsaved profile changes' })).getByText(/1 change/)
      ).toBeInTheDocument()
    })

    it('deploys the cluster once the changes are saved', async () => {
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      await userEvent.click(screen.getByRole('switch', { name: 'High availability' }))
      await userEvent.click(screen.getByRole('button', { name: 'Save and deploy' }))

      expect(mockUpdatePlatformConfiguration).toHaveBeenCalled()
      expect(mockDeployCluster).toHaveBeenCalledWith({ organizationId: 'organization-id', clusterId: 'cluster-id' })
    })

    it('does not deploy when saving fails', async () => {
      mockUpdatePlatformConfiguration.mockRejectedValue(new Error('Invalid profile'))
      const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

      await userEvent.click(screen.getByRole('switch', { name: 'High availability' }))
      await userEvent.click(screen.getByRole('button', { name: 'Save and deploy' }))

      expect(mockDeployCluster).not.toHaveBeenCalled()
      expect(screen.getByRole('region', { name: 'Unsaved profile changes' })).toBeInTheDocument()
    })
  })

  it('greys out the layers skipped or disabled in the cluster configuration', async () => {
    mockUsePlatformConfiguration.mockReturnValue({
      data: {
        clusterId: 'cluster-id',
        organizationId: 'organization-id',
        clusterInputs: {},
        platform: { templateKey: 'qovery-cluster-v0', templateVersion: '1.0.0' },
        layers: [
          {
            key: 'network',
            status: 'SKIPPED',
            reason: 'not applicable to CUSTOMER_MANAGED/AWS cluster',
            componentKeys: [],
          },
          { key: 'qovery-stack', status: 'DISABLED', reason: 'optional layer disabled', componentKeys: [] },
          { key: 'log-infra', status: 'ENABLED', reason: 'mandatory layer', componentKeys: ['loki', 'alloy'] },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof usePlatformConfiguration>)
    const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

    const network = screen.getByRole('button', { name: 'Network' })
    expect(network).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Envoy' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Log infra' })).toBeEnabled()

    await userEvent.hover(network.closest('li') as HTMLElement)

    expect((await screen.findAllByText('This layer does not apply to this cluster'))[0]).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Qovery stack' })).toBeDisabled()
  })

  it.each(['envoy', 'network'])('does not open a disabled layer from the URL (%s)', (requestedKey) => {
    mockUsePlatformConfiguration.mockReturnValue({
      data: {
        clusterId: 'cluster-id',
        organizationId: 'organization-id',
        clusterInputs: {},
        platform: { templateKey: 'qovery-cluster-v0', templateVersion: '1.0.0' },
        layers: [
          {
            key: 'network',
            status: 'SKIPPED',
            reason: 'not applicable to CUSTOMER_MANAGED/AWS cluster',
            componentKeys: [],
          },
        ],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof usePlatformConfiguration>)
    renderWithProviders(<ClusterProfileFeature activeComponentKey={requestedKey} />)

    expect(screen.getByRole('heading', { name: 'Log infra' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Loki' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Envoy' })).not.toBeInTheDocument()
  })

  it('explains that a disabled layer is managed by Qovery', async () => {
    mockUsePlatformConfiguration.mockReturnValue({
      data: {
        clusterId: 'cluster-id',
        organizationId: 'organization-id',
        clusterInputs: {},
        platform: { templateKey: 'qovery-cluster-v0', templateVersion: '1.0.0' },
        layers: [{ key: 'network', status: 'DISABLED', reason: 'optional layer disabled', componentKeys: [] }],
      },
      isError: false,
      isLoading: false,
    } as unknown as ReturnType<typeof usePlatformConfiguration>)
    const { userEvent } = renderWithProviders(<ClusterProfileFeature />)

    const network = screen.getByRole('button', { name: 'Network' })
    expect(network).toBeDisabled()
    await userEvent.hover(network.closest('li') as HTMLElement)

    expect((await screen.findAllByText('These values are currently managed by Qovery'))[0]).toBeInTheDocument()
  })

  describe('components without configuration', () => {
    it('greys out components and layers that have no field to configure', () => {
      renderWithProviders(<ClusterProfileFeature />)

      expect(screen.getByRole('button', { name: 'Karpenter crd' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Karpenter configuration' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Crds' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Gateway crd' })).toBeDisabled()
    })

    it('opens a layer on its first configurable component', async () => {
      const onActiveComponentChange = jest.fn()
      const { userEvent } = renderWithProviders(
        <ClusterProfileFeature onActiveComponentChange={onActiveComponentChange} />
      )

      await userEvent.click(screen.getByRole('button', { name: 'Karpenter' }))

      expect(onActiveComponentChange).toHaveBeenCalledWith('karpenter-configuration')
    })

    it('does not open a component without configuration from the URL', () => {
      mockUsePlatformComponentConfigurations.mockReturnValue(createComponentQueries(['karpenter-configuration']))
      renderWithProviders(<ClusterProfileFeature activeComponentKey="karpenter-crd" />)

      expect(screen.getByRole('link', { name: 'Karpenter configuration' })).toHaveAttribute('aria-current', 'page')
      expect(screen.queryByRole('link', { name: 'Karpenter crd' })).not.toBeInTheDocument()
      expect(screen.getByLabelText('Node pool')).toBeInTheDocument()
    })
  })
})

import { type ClusterPlatformBindingResponse, type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformConfigurationCatalog } from './platform-configuration-catalog'

const template = {
  key: 'qovery-cluster-v0',
  version: '0.1.0',
  status: 'PUBLISHED',
  layers: [
    {
      key: 'log-infrastructure',
      mandatory: false,
      enabledByDefault: false,
      modes: ['CUSTOMER_MANAGED'],
      providers: ['AWS'],
      componentKeys: ['loki'],
      components: [
        {
          key: 'loki',
          kind: 'HELM',
          fields: [
            {
              key: 'storage',
              type: 'string',
              required: false,
              defaultValue: 'pvc',
              label: 'Storage',
              sensitive: false,
              constraints: { allowedValues: ['pvc', 's3'] },
            },
          ],
        },
      ],
    },
  ],
} satisfies PlatformTemplateSummaryResponse

const binding = {
  clusterId: 'cluster-id',
  organizationId: 'organization-id',
  templateKey: template.key,
  templateVersion: template.version,
  layerSelections: { 'log-infrastructure': true },
  managedConfig: {},
  customerProvidedInputs: {},
  layers: [
    {
      key: 'log-infrastructure',
      status: 'ENABLED',
      reason: 'optional layer enabled',
      componentKeys: ['loki'],
    },
  ],
} satisfies ClusterPlatformBindingResponse

const defaultProps = {
  binding,
  layerSelections: binding.layerSelections,
  isSaving: false,
  onComponentSelect: jest.fn(),
  onLayerSelectionChange: jest.fn(),
  onSave: jest.fn(),
  template,
}

describe('PlatformConfigurationCatalog', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows complete layer names and opens a component on a second depth', async () => {
    const { userEvent } = renderWithProviders(<PlatformConfigurationCatalog {...defaultProps} />)

    expect(screen.getByText('Log infrastructure')).not.toHaveClass('truncate')
    await userEvent.click(screen.getByRole('button', { name: 'Loki HELM' }))

    expect(defaultProps.onComponentSelect).toHaveBeenCalledWith('loki')
  })

  it('keeps the displayed status and checkbox aligned with the editable draft', () => {
    renderWithProviders(
      <PlatformConfigurationCatalog {...defaultProps} layerSelections={{ 'log-infrastructure': false }} />
    )

    expect(screen.getByText('DISABLED')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Enable this layer' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Loki HELM' })).toBeDisabled()
  })

  it('uses the resolved binding status when no explicit selection exists', () => {
    renderWithProviders(
      <PlatformConfigurationCatalog
        {...defaultProps}
        binding={{ ...binding, templateVersion: 'previous-version', layerSelections: {} }}
        layerSelections={{}}
      />
    )

    expect(screen.getByText('ENABLED')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Enable this layer' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Loki HELM' })).toBeEnabled()
  })

  it('keeps non-applicable mandatory layers skipped', () => {
    const infrastructureTemplate = {
      ...template,
      layers: [{ ...template.layers[0], key: 'infrastructure', mandatory: true }],
    } satisfies PlatformTemplateSummaryResponse
    const infrastructureBinding = {
      ...binding,
      layers: [
        {
          key: 'infrastructure',
          status: 'SKIPPED',
          reason: 'not applicable to CUSTOMER_MANAGED/AWS cluster',
          componentKeys: [],
        },
      ],
    } satisfies ClusterPlatformBindingResponse

    renderWithProviders(
      <PlatformConfigurationCatalog
        {...defaultProps}
        binding={infrastructureBinding}
        layerSelections={{}}
        template={infrastructureTemplate}
      />
    )

    expect(screen.getByText('SKIPPED')).toBeInTheDocument()
    expect(screen.getByText('not applicable to CUSTOMER_MANAGED/AWS cluster')).toBeInTheDocument()
  })

  it('uses catalog applicability before a cluster binding exists', () => {
    renderWithProviders(
      <PlatformConfigurationCatalog {...defaultProps} binding={null} clusterMode="QOVERY_MANAGED" cloudProvider="AWS" />
    )

    expect(screen.getByText('SKIPPED')).toBeInTheDocument()
    expect(screen.getByText('Not applicable to this cluster.')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Enable this layer' })).toBeDisabled()
  })

  it('saves layer changes independently from component configuration', async () => {
    const { userEvent } = renderWithProviders(<PlatformConfigurationCatalog {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save layers' }))

    expect(defaultProps.onSave).toHaveBeenCalledTimes(1)
  })

  it('reuses the catalog for creation with its own labels and back navigation', async () => {
    const onPrevious = jest.fn()
    const { userEvent } = renderWithProviders(
      <PlatformConfigurationCatalog {...defaultProps} saveLabel="Continue" onPrevious={onPrevious} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('hides the template and management modes and keeps components without catalog fields selectable', async () => {
    const agentTemplate = {
      ...template,
      layers: [
        {
          ...template.layers[0],
          key: 'qovery-stack',
          mandatory: true,
          modes: ['CUSTOMER_MANAGED', 'QOVERY_MANAGED'],
          providers: undefined,
          componentKeys: ['cluster-agent', 'shell-agent'],
          components: [
            { key: 'cluster-agent', kind: 'HELM', fields: [] },
            { key: 'shell-agent', kind: 'HELM', fields: [] },
          ],
        },
      ],
    } satisfies PlatformTemplateSummaryResponse
    const { userEvent } = renderWithProviders(
      <PlatformConfigurationCatalog {...defaultProps} binding={null} template={agentTemplate} layerSelections={{}} />
    )

    expect(screen.queryByText('Platform template')).not.toBeInTheDocument()
    expect(screen.queryByText('CUSTOMER MANAGED')).not.toBeInTheDocument()
    expect(screen.queryByText('QOVERY MANAGED')).not.toBeInTheDocument()

    // Components without catalog fields stay selectable: their configuration may
    // consist solely of resolver-provided cluster-input requirements.
    await userEvent.click(screen.getByRole('button', { name: 'Cluster agent HELM' }))
    expect(defaultProps.onComponentSelect).toHaveBeenCalledWith('cluster-agent')
  })
})

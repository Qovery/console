import {
  type ClusterPlatformConfigurationResponse,
  type FieldSchemaResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformConfiguration } from './platform-configuration'

const mockUpdateConfiguration = jest.fn()
const mockResolve = jest.fn()
const mockLokiFields: FieldSchemaResponse[] = [
  { key: 'retention', type: 'number', label: 'Retention', required: true, sensitive: false, constraints: {} },
  { key: 'accessKey', type: 'string', label: 'Access key', required: true, sensitive: true, constraints: {} },
]
const mockGrafanaFields: FieldSchemaResponse[] = [
  { key: 'adminPassword', type: 'string', label: 'Admin password', required: true, sensitive: true, constraints: {} },
]
const mockTemplate: PlatformTemplateSummaryResponse = {
  key: 'qovery-cluster-v0',
  version: '0.1.0',
  status: 'PUBLISHED',
  layers: [
    {
      key: 'observability',
      mandatory: true,
      enabledByDefault: true,
      modes: ['CUSTOMER_MANAGED'],
      componentKeys: ['loki', 'grafana'],
      components: [
        { key: 'loki', kind: 'HELM', fields: mockLokiFields },
        { key: 'grafana', kind: 'HELM', fields: mockGrafanaFields },
      ],
    },
  ],
}
const mockConfiguration: ClusterPlatformConfigurationResponse = {
  clusterId: 'cluster',
  organizationId: 'organization',
  platform: {
    templateKey: 'qovery-cluster-v0',
    templateVersion: '0.1.0',
    layerSelections: {},
    managedConfig: {
      loki: { retention: 4, accessKey: '<redacted>' },
      grafana: { adminPassword: '<redacted>' },
    },
  },
  clusterInputs: {},
  layers: [],
}

jest.mock('./hooks/use-platform-templates', () => ({ usePlatformTemplates: () => ({ data: [mockTemplate] }) }))
jest.mock('./hooks/use-cluster-platform-configuration', () => ({
  useClusterPlatformConfiguration: () => ({ data: mockConfiguration }),
}))
jest.mock('./hooks/use-update-cluster-platform-configuration', () => ({
  useUpdateClusterPlatformConfiguration: () => ({ mutate: mockUpdateConfiguration, isLoading: false }),
}))
jest.mock('./hooks/use-platform-component-configuration', () => ({
  usePlatformComponentConfiguration: (args: { componentKey?: string }) => {
    mockResolve(args)
    return {
      data: args.componentKey
        ? {
            componentKey: args.componentKey,
            fields: args.componentKey === 'grafana' ? mockGrafanaFields : mockLokiFields,
            requirements: [],
            componentBindings: [],
            violations: [],
          }
        : undefined,
      isError: false,
      isFetching: false,
    }
  },
}))
jest.mock('./cluster-operator-status', () => ({ ClusterOperatorStatus: () => null }))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDebounce: (value: unknown) => value,
}))

function renderConfiguration() {
  return renderWithProviders(
    <PlatformConfiguration
      clusterId="cluster"
      organizationId="organization"
      clusterMode="CUSTOMER_MANAGED"
      cloudProvider="AWS"
    />
  )
}

describe('PlatformConfiguration with redacted values', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('blocks saving the layers while a component has hidden values', () => {
    renderConfiguration()

    expect(screen.getByText('Re-enter them in Loki, Grafana to save, or reload later.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save layers' })).toBeDisabled()
  })

  it('shows hidden values as empty fields and never resolves the marker', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: 'Loki HELM' }))

    expect(screen.getByText('Some values are hidden')).toBeInTheDocument()
    expect(screen.getByLabelText('Access key')).toHaveValue('')
    expect(screen.getByLabelText('Access key')).toHaveAttribute('placeholder', 'Hidden value')
    expect(screen.getByLabelText('Retention')).not.toHaveAttribute('placeholder')
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
    expect(mockResolve).toHaveBeenCalledWith(expect.objectContaining({ componentKey: 'loki' }))
    expect(JSON.stringify(mockResolve.mock.calls)).not.toContain('<redacted>')
  })

  it('saves only once every hidden value has been re-entered', async () => {
    const { userEvent } = renderConfiguration()

    await userEvent.click(screen.getByRole('button', { name: 'Loki HELM' }))
    await userEvent.type(screen.getByLabelText('Access key'), 'new-access-key')
    expect(screen.getByText('Re-enter them in Grafana to save, or reload later.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Platform layers' }))
    await userEvent.click(screen.getByRole('button', { name: 'Grafana HELM' }))
    await userEvent.type(screen.getByLabelText('Admin password'), 'new-password')
    expect(screen.queryByText('Some values are hidden')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save configuration' }))

    expect(mockUpdateConfiguration).toHaveBeenCalledTimes(1)
    expect(mockUpdateConfiguration.mock.calls[0][0].request.platform.managedConfig).toEqual({
      loki: { retention: 4, accessKey: 'new-access-key' },
      grafana: { adminPassword: 'new-password' },
    })
    expect(JSON.stringify([mockUpdateConfiguration.mock.calls, mockResolve.mock.calls])).not.toContain('<redacted>')
  })
})

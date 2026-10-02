import {
  type ClusterPlatformConfigurationResponse,
  type FieldSchemaResponse,
  type PlatformComponentConfigurationViolationResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PlatformConfiguration } from './platform-configuration'

const mockUpdateConfiguration = jest.fn()
const mockUpdateOperator = jest.fn()
const mockPreview = jest.fn()
let mockViolations: PlatformComponentConfigurationViolationResponse[] = []
const mockFields: FieldSchemaResponse[] = [
  {
    key: 'nodeSelectorKey',
    type: 'string',
    label: 'Node label key',
    required: false,
    sensitive: false,
    defaultValue: 'eks.amazonaws.com/nodegroup',
    constraints: { minLength: 1 },
  },
  {
    key: 'nodeSelectorValue',
    type: 'string',
    label: 'Node label value',
    required: false,
    sensitive: false,
    constraints: { minLength: 1 },
  },
  {
    key: 'tolerations',
    type: 'array',
    label: 'Tolerations',
    required: false,
    sensitive: false,
    constraints: { uniqueItems: false },
    items: {
      type: 'object',
      fields: [
        {
          key: 'key',
          type: 'string',
          label: 'Taint key',
          required: true,
          sensitive: false,
          constraints: { minLength: 1 },
        },
        {
          key: 'value',
          type: 'string',
          label: 'Taint value',
          required: true,
          sensitive: false,
          constraints: { pattern: '[a-z]*' },
        },
        {
          key: 'effect',
          type: 'string',
          label: 'Effect',
          required: true,
          sensitive: false,
          constraints: { allowedValues: ['NoSchedule'] },
        },
      ],
    },
  },
]
const mockTemplate: PlatformTemplateSummaryResponse = {
  key: 'test',
  version: '1',
  status: 'PUBLISHED',
  bootstrapComponent: { key: 'bootstrap-controller', kind: 'HELM', fields: mockFields },
  layers: [
    {
      key: 'logs',
      mandatory: true,
      enabledByDefault: true,
      modes: ['CUSTOMER_MANAGED'],
      componentKeys: ['loki'],
      components: [{ key: 'loki', kind: 'HELM', fields: [] }],
    },
  ],
}
const initialManagedConfig = {
  'bootstrap-controller': {
    nodeSelectorKey: 'karpenter.sh/nodepool',
    nodeSelectorValue: 'old',
    tolerations: [{ key: 'nodepool/stable', value: '', effect: 'NoSchedule' }],
  },
  loki: { retentionWeeks: 4 },
}
const initialConfiguration: ClusterPlatformConfigurationResponse = {
  clusterId: 'cluster',
  organizationId: 'organization',
  platform: {
    templateKey: 'test',
    templateVersion: '1',
    layerSelections: {},
    managedConfig: initialManagedConfig,
  },
  clusterInputs: { loki: { bucket: 'logs' } },
  layers: [],
}
let mockConfiguration = initialConfiguration
jest.mock('./hooks/use-platform-templates', () => ({ usePlatformTemplates: () => ({ data: [mockTemplate] }) }))
jest.mock('./hooks/use-cluster-platform-configuration', () => ({
  useClusterPlatformConfiguration: () => ({ data: mockConfiguration }),
}))
jest.mock('./hooks/use-update-cluster-platform-configuration', () => ({
  useUpdateClusterPlatformConfiguration: () => ({ mutate: mockUpdateConfiguration, isLoading: false }),
}))
jest.mock('./hooks/use-cluster-operator', () => ({
  useClusterOperatorStatus: () => ({ data: null, isLoading: false, isError: false }),
  useUpdateClusterOperator: () => ({ mutate: mockUpdateOperator, isLoading: false }),
}))
jest.mock('./hooks/use-platform-component-configuration', () => ({
  usePlatformComponentConfiguration: (args: { componentKey?: string }) => {
    mockPreview(args)
    return {
      data: args.componentKey
        ? {
            componentKey: args.componentKey,
            fields: mockFields,
            requirements: [],
            componentBindings: [],
            violations: mockViolations,
          }
        : undefined,
      isError: false,
      isFetching: false,
    }
  },
}))
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

describe('Operator configuration', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockConfiguration = initialConfiguration
    mockViolations = []
  })
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers())
    jest.useRealTimers()
  })

  it('opens the first card while disconnected and saves/reloads placement without changing layers', async () => {
    const { userEvent, unmount } = renderConfiguration()
    expect(screen.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'Qovery Operator',
      'Platform layers',
    ])
    await userEvent.click(screen.getByRole('button', { name: 'Configure Operator' }))
    expect(screen.getByLabelText('Node label value')).toHaveValue('old')
    await userEvent.clear(screen.getByLabelText('Node label value'))
    await userEvent.type(screen.getByLabelText('Node label value'), 'stable')
    expect(mockPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        componentKey: 'bootstrap-controller',
        request: expect.objectContaining({
          replaceProfileConfig: true,
          profileConfig: { ...initialManagedConfig['bootstrap-controller'], nodeSelectorValue: 'stable' },
        }),
      })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save configuration' }))
    expect(mockUpdateConfiguration).toHaveBeenCalledWith({
      clusterId: 'cluster',
      request: {
        platform: {
          templateKey: 'test',
          templateVersion: '1',
          layerSelections: {},
          managedConfig: {
            ...initialManagedConfig,
            'bootstrap-controller': {
              ...initialManagedConfig['bootstrap-controller'],
              nodeSelectorValue: 'stable',
            },
          },
        },
        clusterInputs: initialConfiguration.clusterInputs,
      },
    })
    expect(mockUpdateOperator).not.toHaveBeenCalled()
    mockConfiguration = { ...initialConfiguration, ...mockUpdateConfiguration.mock.calls[0][0].request }
    unmount()
    const reopened = renderConfiguration()
    await reopened.userEvent.click(screen.getByRole('button', { name: 'Configure Operator' }))
    expect(screen.getByLabelText('Node label value')).toHaveValue('stable')
  })

  it('previews and saves removal of placement as a complete draft', async () => {
    const { userEvent } = renderConfiguration()
    await userEvent.click(screen.getByRole('button', { name: 'Configure Operator' }))
    await userEvent.clear(screen.getByLabelText('Node label value'))
    await userEvent.click(screen.getByRole('button', { name: 'Remove Tolerations 1' }))
    expect(mockPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          replaceProfileConfig: true,
          profileConfig: { nodeSelectorKey: 'karpenter.sh/nodepool', tolerations: [] },
        }),
      })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save configuration' }))
    expect(mockUpdateConfiguration.mock.calls[0][0].request.platform.managedConfig['bootstrap-controller']).toEqual({
      nodeSelectorKey: 'karpenter.sh/nodepool',
      tolerations: [],
    })
  })

  it('shows indexed validation errors and prevents saving an invalid toleration', async () => {
    mockViolations = [{ code: 'INPUT_PATTERN_MISMATCH', fieldPath: 'tolerations[0].key', message: 'Invalid taint key' }]
    const { userEvent } = renderConfiguration()
    await userEvent.click(screen.getByRole('button', { name: 'Configure Operator' }))
    expect(screen.getByText('Invalid taint key')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save configuration' })).toBeDisabled()
    expect(mockUpdateConfiguration).not.toHaveBeenCalled()
  })
})

import {
  type ClusterPlatformConfigurationResponse,
  type FieldSchemaResponse,
  type PlatformComponentConfigurationPreviewRequest,
  type PlatformComponentConfigurationPreviewResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { act, renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { PlatformConfiguration } from './platform-configuration'

type PreviewMode = 'resolved' | 'pending' | 'failed'

const CPU_REQUEST = 'resources.singleBinary.requests.cpuMilli'
const CPU_LIMIT = 'resources.singleBinary.limits.cpuMilli'
const profile = {
  key: 'resources.profile',
  type: 'string',
  label: 'Resource profile',
  required: false,
  sensitive: false,
  defaultValue: 'CHART_DEFAULT',
  constraints: { allowedValues: ['CHART_DEFAULT', 'SMALL', 'LARGE', 'CUSTOM'] },
} satisfies FieldSchemaResponse
const retention = {
  key: 'retentionWeeks',
  type: 'number',
  label: 'Retention',
  required: true,
  sensitive: false,
  defaultValue: '4',
  constraints: {},
} satisfies FieldSchemaResponse
// Catalog descriptors list every CUSTOM field as editable, pre-filled with the MEDIUM budget.
const cpuRequest = {
  key: CPU_REQUEST,
  type: 'number',
  label: 'CPU request',
  required: false,
  sensitive: false,
  defaultValue: '300',
  constraints: { min: 1 },
} satisfies FieldSchemaResponse
const cpuLimit = {
  key: CPU_LIMIT,
  type: 'number',
  label: 'CPU limit',
  required: false,
  sensitive: false,
  constraints: { min: 1 },
} satisfies FieldSchemaResponse
const presetCpuRequests: Record<string, string> = { SMALL: '100', LARGE: '1000' }

function mockLokiPreview(
  request: PlatformComponentConfigurationPreviewRequest
): PlatformComponentConfigurationPreviewResponse {
  const selectedProfile = String(request.profileConfig?.['resources.profile'])
  const presetCpuRequest = presetCpuRequests[selectedProfile]
  const resources: FieldSchemaResponse[] = presetCpuRequest
    ? [
        { ...cpuRequest, readOnly: true, defaultValue: undefined },
        { ...cpuLimit, readOnly: true },
      ]
    : selectedProfile === 'CUSTOM'
      ? [{ ...cpuRequest, required: true }, cpuLimit]
      : []
  return {
    clusterId: 'cluster',
    componentKey: 'loki',
    fields: [profile, retention, ...resources],
    requirements: [],
    componentBindings: [],
    violations: [],
    resolvedValues: presetCpuRequest ? { [CPU_REQUEST]: presetCpuRequest, [CPU_LIMIT]: null } : {},
  }
}

// Mirrors the query hook: a resolved request is served from the cache, a new request keeps the
// previous data while it is fetched (keepPreviousData), and a failed one has no data.
const mockPreviews = {
  mode: 'resolved' as PreviewMode,
  listeners: new Set<() => void>(),
  responses: new Map<string, PlatformComponentConfigurationPreviewResponse>(),
  previous: undefined as PlatformComponentConfigurationPreviewResponse | undefined,
}
const mockResolve = jest.fn()
const mockUpdateConfiguration = jest.fn()
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
      componentKeys: ['loki'],
      components: [{ key: 'loki', kind: 'HELM', fields: [profile, retention, cpuRequest, cpuLimit] }],
    },
  ],
}
let mockConfiguration: ClusterPlatformConfigurationResponse

jest.mock('./hooks/use-platform-templates', () => ({ usePlatformTemplates: () => ({ data: [mockTemplate] }) }))
jest.mock('./hooks/use-cluster-platform-configuration', () => ({
  useClusterPlatformConfiguration: () => ({ data: mockConfiguration }),
}))
jest.mock('./hooks/use-update-cluster-platform-configuration', () => ({
  useUpdateClusterPlatformConfiguration: () => ({ mutate: mockUpdateConfiguration, isLoading: false }),
}))
jest.mock('./hooks/use-platform-component-configuration', () => {
  const React = jest.requireActual('react')
  return {
    usePlatformComponentConfiguration: (args: {
      componentKey?: string
      request: PlatformComponentConfigurationPreviewRequest
      enabled: boolean
    }) => {
      const mode: PreviewMode = React.useSyncExternalStore(
        (listener: () => void) => {
          mockPreviews.listeners.add(listener)
          return () => mockPreviews.listeners.delete(listener)
        },
        () => mockPreviews.mode
      )
      mockResolve(args)
      if (!args.componentKey || !args.enabled) return { data: undefined, isError: false, isFetching: false }
      const key = JSON.stringify(args.request)
      const cached = mockPreviews.responses.get(key)
      if (cached || mode === 'resolved') {
        const data = cached ?? mockLokiPreview(args.request)
        mockPreviews.responses.set(key, data)
        mockPreviews.previous = data
        return { data, isError: false, isFetching: false }
      }
      return mode === 'pending'
        ? { data: mockPreviews.previous, isError: false, isFetching: true }
        : { data: undefined, isError: true, isFetching: false }
    },
  }
})
jest.mock('./cluster-operator-status', () => ({ ClusterOperatorStatus: () => null }))
// The test setup stubs @uidotdev/usehooks, whose ESM build Jest does not load: mirror its debounce.
jest.mock('@qovery/shared/util-hooks', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@qovery/shared/util-hooks'),
    useDebounce: (value: unknown, delay: number) => {
      const [debounced, setDebounced] = React.useState(value)
      React.useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timeout)
      }, [value, delay])
      return debounced
    },
  }
})

function setPreviewMode(mode: PreviewMode) {
  act(() => {
    mockPreviews.mode = mode
    mockPreviews.listeners.forEach((listener) => listener())
  })
}

function settleDebounce() {
  act(() => jest.advanceTimersByTime(300))
}

async function openLoki(loki: Record<string, unknown>) {
  mockConfiguration = {
    clusterId: 'cluster',
    organizationId: 'organization',
    platform: {
      templateKey: 'qovery-cluster-v0',
      templateVersion: '0.1.0',
      layerSelections: {},
      managedConfig: { loki },
    },
    clusterInputs: {},
    layers: [],
  }
  const { userEvent } = renderWithProviders(
    <PlatformConfiguration
      clusterId="cluster"
      organizationId="organization"
      clusterMode="CUSTOMER_MANAGED"
      cloudProvider="AWS"
    />
  )
  await userEvent.click(screen.getByRole('button', { name: 'Loki HELM' }))
  settleDebounce()
  return userEvent
}

async function selectProfile(userEvent: Awaited<ReturnType<typeof openLoki>>, name: string) {
  await userEvent.click(screen.getByRole('combobox', { name: 'Resource profile' }))
  await userEvent.click(within(screen.getByRole('option', { name })).getByText(name))
}

const saveButton = () => screen.getByRole('button', { name: 'Save configuration' })

describe('PlatformConfiguration read-only fields', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockPreviews.mode = 'resolved'
    mockPreviews.listeners.clear()
    mockPreviews.responses.clear()
    mockPreviews.previous = undefined
  })
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers())
    jest.useRealTimers()
  })

  it('renders nothing editable under a preset until its first preview arrives', async () => {
    mockPreviews.mode = 'pending'
    await openLoki({ 'resources.profile': 'SMALL' })

    expect(screen.getByRole('status', { name: 'Checking configuration' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(saveButton()).toBeDisabled()

    setPreviewMode('resolved')
    expect(screen.queryByRole('status', { name: 'Checking configuration' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toHaveValue('100')
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'CPU limit' })).toHaveValue('No limit')
    expect(saveButton()).toBeEnabled()
  })

  it('renders nothing editable under a preset when its first preview fails', async () => {
    mockPreviews.mode = 'failed'
    await openLoki({ 'resources.profile': 'SMALL' })

    expect(screen.getByText('Configuration could not be checked')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })

  it('keeps the fields and values of one response together while the next one is checked, and resolves the saved body', async () => {
    const userEvent = await openLoki({ 'resources.profile': 'SMALL', retentionWeeks: 6 })
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toHaveValue('100')

    setPreviewMode('pending')
    await selectProfile(userEvent, 'LARGE')
    expect(screen.getByText('Checking…')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toHaveValue('100')
    expect(screen.getByRole('textbox', { name: 'CPU limit' })).toHaveValue('No limit')
    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Resource profile' })).toBeEnabled()

    settleDebounce()
    expect(mockResolve).toHaveBeenLastCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ profileConfig: expect.objectContaining({ 'resources.profile': 'LARGE' }) }),
      })
    )
    expect(screen.getByText('Checking…')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toHaveValue('100')
    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Resource profile' })).toBeEnabled()

    setPreviewMode('resolved')
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toHaveValue('1000')
    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toBeEnabled()

    await userEvent.click(saveButton())
    const { request } = mockUpdateConfiguration.mock.calls[0][0]
    expect(request.platform.managedConfig.loki).toEqual({
      'resources.profile': 'LARGE',
      retentionWeeks: 6,
      [CPU_REQUEST]: 300,
    })
    expect(mockResolve).toHaveBeenLastCalledWith({
      clusterId: 'cluster',
      componentKey: 'loki',
      enabled: true,
      request: {
        profileConfig: request.platform.managedConfig.loki,
        replaceProfileConfig: true,
        clusterInputs: {},
        componentOutputs: {},
      },
    })
  })

  it('restores the CUSTOM values after a preset and never writes resolved values into the draft', async () => {
    const userEvent = await openLoki({
      'resources.profile': 'CUSTOM',
      retentionWeeks: 6,
      [CPU_REQUEST]: 250,
      [CPU_LIMIT]: 500,
    })
    await userEvent.clear(screen.getByRole('spinbutton', { name: 'CPU request' }))
    await userEvent.type(screen.getByRole('spinbutton', { name: 'CPU request' }), '260')
    settleDebounce()

    await selectProfile(userEvent, 'SMALL')
    settleDebounce()
    expect(screen.getByRole('textbox', { name: 'CPU request' })).toHaveValue('100')
    expect(screen.getByRole('textbox', { name: 'CPU limit' })).toHaveValue('No limit')

    await selectProfile(userEvent, 'CUSTOM')
    settleDebounce()
    expect(screen.getByRole('spinbutton', { name: 'CPU request' })).toHaveValue(260)
    expect(screen.getByRole('spinbutton', { name: 'CPU limit' })).toHaveValue(500)

    await userEvent.click(saveButton())
    expect(mockUpdateConfiguration.mock.calls[0][0].request.platform.managedConfig.loki).toEqual({
      'resources.profile': 'CUSTOM',
      retentionWeeks: 6,
      [CPU_REQUEST]: 260,
      [CPU_LIMIT]: 500,
    })
  })

  it('blocks saving during the debounce, during the request and after a failed preview', async () => {
    const userEvent = await openLoki({ 'resources.profile': 'CUSTOM', retentionWeeks: 6, [CPU_REQUEST]: 250 })
    expect(saveButton()).toBeEnabled()

    setPreviewMode('pending')
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Retention' }), '1')
    expect(saveButton()).toBeDisabled()
    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toHaveFocus()
    expect(screen.getByRole('spinbutton', { name: 'CPU request' })).toBeDisabled()

    settleDebounce()
    expect(saveButton()).toBeDisabled()

    setPreviewMode('failed')
    expect(screen.getByText('Configuration could not be checked')).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
    expect(screen.getByRole('spinbutton', { name: 'CPU request' })).toBeDisabled()
    expect(screen.getByRole('spinbutton', { name: 'Retention' })).toBeEnabled()

    setPreviewMode('resolved')
    expect(saveButton()).toBeEnabled()
    expect(screen.getByRole('spinbutton', { name: 'CPU request' })).toBeEnabled()
  })
})

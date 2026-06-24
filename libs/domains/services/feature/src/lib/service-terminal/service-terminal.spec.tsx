import { type QueryClient } from '@tanstack/react-query'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ServiceTerminal, type ServiceTerminalProps } from './service-terminal'

const mockUseRunningStatus = jest.fn()
const mockUseService = jest.fn()

jest.mock('color', () => ({
  __esModule: true,
  default: () => ({
    hex: () => '#000000',
  }),
}))

jest.mock('@xterm/addon-attach', () => ({
  __esModule: true,
  AttachAddon: jest.fn().mockImplementation(() => ({
    activate: jest.fn(),
    dispose: jest.fn(),
  })),
}))

jest.mock('@xterm/addon-fit', () => ({
  __esModule: true,
  FitAddon: jest.fn().mockImplementation(() => ({
    activate: jest.fn(),
    dispose: jest.fn(),
    fit: jest.fn(),
  })),
}))

jest.mock('react-xtermjs', () => ({
  XTerm: () => <div data-testid="xterm" />,
}))

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

jest.mock('../..', () => ({
  useRunningStatus: (...args: unknown[]) => mockUseRunningStatus(...args),
  useService: (...args: unknown[]) => mockUseService(...args),
}))

const props: ServiceTerminalProps = {
  organizationId: '0',
  clusterId: '0',
  projectId: '0',
  environmentId: '0',
  serviceId: '0',
  serviceType: 'APPLICATION',
}

const useReactQueryWsSubscriptionMock = jest.mocked(useReactQueryWsSubscription)

const getLatestWsSubscriptionConfig = (): Parameters<typeof useReactQueryWsSubscription>[0] => {
  const latestCall = useReactQueryWsSubscriptionMock.mock.calls.at(-1)

  if (!latestCall) {
    throw new Error('Expected useReactQueryWsSubscription to be called at least once.')
  }

  return latestCall[0]
}

const getLatestWsSubscriptionSearchParams = (): Record<string, string | undefined> => {
  const { urlSearchParams } = getLatestWsSubscriptionConfig()

  if (!urlSearchParams || typeof urlSearchParams !== 'object' || urlSearchParams instanceof URLSearchParams) {
    throw new Error('Expected websocket search params to be an object.')
  }

  return urlSearchParams as Record<string, string | undefined>
}

const createWebSocketEvent = (type: string, websocket: WebSocket): Event => {
  const event = new Event(type)
  Object.defineProperty(event, 'target', { value: websocket })
  return event
}

const createWebSocketCloseEvent = (websocket: WebSocket, eventInit: CloseEventInit): CloseEvent => {
  const event = new CloseEvent('close', eventInit)
  Object.defineProperty(event, 'target', { value: websocket })
  return event
}

const createMockWebSocket = (): WebSocket =>
  ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    readyState: WebSocket.OPEN,
  }) as unknown as WebSocket

describe('ServiceTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRunningStatus.mockReturnValue({
      data: {
        pods: [
          { name: 'pod-1', containers: [{ name: 'container-1' }] },
          { name: 'pod-2', containers: [{ name: 'container-2' }] },
        ],
        state: 'STOPPED',
      },
      isLoading: false,
    })
    mockUseService.mockReturnValue({
      data: { cpu: 1000, memory: 512, serviceType: 'APPLICATION' },
    })
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceTerminal {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should show a retry empty state and disable subscription on terminal launch error', () => {
    renderWithProviders(<ServiceTerminal {...props} />)
    const websocket = createMockWebSocket()

    act(() => {
      getLatestWsSubscriptionConfig().onOpen?.({} as QueryClient, createWebSocketEvent('open', websocket))
    })

    act(() => {
      getLatestWsSubscriptionConfig().onClose?.(
        {} as QueryClient,
        createWebSocketCloseEvent(websocket, { code: 1000, reason: 'No pod exists for this application.' })
      )
    })

    expect(screen.getByText('Unable to launch CLI')).toBeInTheDocument()
    expect(screen.getByText("We could not launch the CLI for this service because it's stopped.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Relaunch' })).toBeInTheDocument()
    expect(useReactQueryWsSubscriptionMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('should show a generic unavailable message when service state is not stopped or in error', () => {
    mockUseRunningStatus.mockReturnValue({
      data: {
        pods: [
          { name: 'pod-1', containers: [{ name: 'container-1' }] },
          { name: 'pod-2', containers: [{ name: 'container-2' }] },
        ],
        state: 'RUNNING',
      },
      isLoading: false,
    })

    renderWithProviders(<ServiceTerminal {...props} />)
    const websocket = createMockWebSocket()

    act(() => {
      getLatestWsSubscriptionConfig().onOpen?.({} as QueryClient, createWebSocketEvent('open', websocket))
    })

    act(() => {
      getLatestWsSubscriptionConfig().onClose?.(
        {} as QueryClient,
        createWebSocketCloseEvent(websocket, { code: 1000, reason: 'No pod exists for this application.' })
      )
    })

    expect(screen.getByText('The CLI is currently unavailable for this service.')).toBeInTheDocument()
  })

  it('should restart terminal launch flow when retrying from empty state', async () => {
    const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)
    const websocket = createMockWebSocket()

    act(() => {
      getLatestWsSubscriptionConfig().onOpen?.({} as QueryClient, createWebSocketEvent('open', websocket))
    })

    act(() => {
      getLatestWsSubscriptionConfig().onClose?.(
        {} as QueryClient,
        createWebSocketCloseEvent(websocket, { code: 1000, reason: 'No pod exists for this application.' })
      )
    })

    await userEvent.click(screen.getByRole('button', { name: 'Relaunch' }))

    await waitFor(() => {
      expect(screen.queryByText('Unable to launch CLI')).not.toBeInTheDocument()
      expect(useReactQueryWsSubscriptionMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }))
    })
  })

  it('should pre-select the first pod on load', () => {
    renderWithProviders(<ServiceTerminal {...props} />)
    expect(screen.getByRole('button', { name: /pod-1/ })).toBeInTheDocument()
  })

  it('should use /shell/exec endpoint by default', () => {
    renderWithProviders(<ServiceTerminal {...props} />)
    expect(getLatestWsSubscriptionConfig().url).toContain('/shell/exec')
  })

  it('should start a fresh terminal session and update pod when selecting a different pod', async () => {
    const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)
    const initialRequestId = getLatestWsSubscriptionSearchParams()['external_request_id']

    await userEvent.click(screen.getByRole('button', { name: /pod-1/ }))
    await userEvent.click(screen.getByRole('option', { name: /pod-2/ }))

    await waitFor(() => {
      expect(getLatestWsSubscriptionSearchParams()).toEqual(expect.objectContaining({ pod_name: 'pod-2' }))
      expect(getLatestWsSubscriptionSearchParams()['external_request_id']).not.toBe(initialRequestId)
    })
  })

  it('should ignore a stale websocket close after selecting a pod', async () => {
    const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)
    const initialWebsocket = createMockWebSocket()

    act(() => {
      getLatestWsSubscriptionConfig().onOpen?.({} as QueryClient, createWebSocketEvent('open', initialWebsocket))
    })

    await userEvent.click(screen.getByRole('button', { name: /pod-1/ }))
    await userEvent.click(screen.getByRole('option', { name: /pod-2/ }))

    act(() => {
      getLatestWsSubscriptionConfig().onClose?.(
        {} as QueryClient,
        createWebSocketCloseEvent(initialWebsocket, { code: 1000, reason: 'Stale close from previous websocket.' })
      )
    })

    expect(screen.queryByText('Unable to launch CLI')).not.toBeInTheDocument()
    expect(useReactQueryWsSubscriptionMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }))
  })

  describe('ephemeral pod', () => {
    it('should show the Launch ephemeral pod button for APPLICATION', () => {
      renderWithProviders(<ServiceTerminal {...props} serviceType="APPLICATION" />)
      expect(screen.getByRole('button', { name: /launch ephemeral pod/i })).toBeInTheDocument()
    })

    it('should show the Launch ephemeral pod button for CONTAINER', () => {
      renderWithProviders(<ServiceTerminal {...props} serviceType="CONTAINER" />)
      expect(screen.getByRole('button', { name: /launch ephemeral pod/i })).toBeInTheDocument()
    })

    it('should not show the Launch ephemeral pod button for unsupported service types', () => {
      renderWithProviders(<ServiceTerminal {...props} serviceType="JOB" />)
      expect(screen.queryByRole('button', { name: /launch ephemeral pod/i })).not.toBeInTheDocument()
    })

    it('should open the ephemeral modal pre-filled with service resources', async () => {
      const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)
      await userEvent.click(screen.getByRole('button', { name: /launch ephemeral pod/i }))
      expect(screen.getByLabelText(/vCPU/i)).toHaveValue('1000')
      expect(screen.getByLabelText(/Memory/i)).toHaveValue('512')
    })

    it('should switch to /shell/ephemeral with correct params after launch', async () => {
      const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)

      await userEvent.click(screen.getByRole('button', { name: /launch ephemeral pod/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Launch' }))

      await waitFor(() => {
        expect(getLatestWsSubscriptionConfig().url).toContain('/shell/ephemeral')
        expect(getLatestWsSubscriptionSearchParams()).toEqual(
          expect.objectContaining({ mode: 'clone', cpu_override: '1000m', memory_override: '512Mi' })
        )
      })
    })

    it('should show ephemeral active badge and back button after launch', async () => {
      const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)

      await userEvent.click(screen.getByRole('button', { name: /launch ephemeral pod/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Launch' }))

      expect(screen.getByText(/Ephemeral pod/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /back to live pod/i })).toBeInTheDocument()
    })

    it('should return to /shell/exec after clicking Back to live pod', async () => {
      const { userEvent } = renderWithProviders(<ServiceTerminal {...props} />)

      await userEvent.click(screen.getByRole('button', { name: /launch ephemeral pod/i }))
      await userEvent.click(screen.getByRole('button', { name: 'Launch' }))
      await userEvent.click(screen.getByRole('button', { name: /back to live pod/i }))

      await waitFor(() => {
        expect(getLatestWsSubscriptionConfig().url).toContain('/shell/exec')
        expect(screen.queryByRole('button', { name: /back to live pod/i })).not.toBeInTheDocument()
      })
    })
  })
})

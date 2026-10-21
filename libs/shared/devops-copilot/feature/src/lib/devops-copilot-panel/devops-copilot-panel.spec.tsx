import { type PropsWithChildren, useReducer, useState } from 'react'
import { useQoveryContext } from '@qovery/shared/devops-copilot/context'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { useAICopilotConfig } from '../hooks/use-ai-copilot-config/use-ai-copilot-config'
import { DevopsCopilotPanel } from './devops-copilot-panel'

jest.mock('mermaid', () => ({ initialize: jest.fn() }))
jest.mock('@auth0/auth0-react', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  Auth0Provider: ({ children }: PropsWithChildren) => children,
  useAuth0: () => ({ user: { sub: 'user-id' } }),
}))
jest.mock('@qovery/shared/assistant/feature', () => ({ useContextualDocLinks: () => [] }))
jest.mock('@qovery/shared/devops-copilot/context', () => ({
  ...jest.requireActual('@qovery/shared/devops-copilot/context'),
  useQoveryContext: jest.fn(),
}))
jest.mock('../hooks/use-ai-copilot-config/use-ai-copilot-config', () => ({ useAICopilotConfig: jest.fn() }))
jest.mock('../hooks/use-qovery-status/use-qovery-status', () => ({ useQoveryStatus: () => ({ data: [] }) }))
jest.mock('../hooks/use-threads/use-threads', () => ({ useThreads: () => ({ threads: [] }) }))
jest.mock('../hooks/use-thread-state/use-thread-state', () => ({
  useThreadState: () => ({ thread: [], setThread: jest.fn() }),
}))
const mockSendMessage = jest.fn()
jest.mock('./hooks/use-message-submission/use-message-submission', () => ({
  useMessageSubmission: () => ({ handleSendMessage: mockSendMessage }),
}))
jest.mock('./hooks/use-panel-resize/use-panel-resize', () => ({ usePanelResize: () => ({}) }))
jest.mock('./hooks/use-streaming-animation/use-streaming-animation', () => ({ useStreamingAnimation: jest.fn() }))
jest.mock('./header/header', () => ({ Header: () => <h2>Copilot</h2> }))
jest.mock('./message-list/message-list', () => ({ MessageList: () => <div>Conversation</div> }))
jest.mock('./input/input', () => ({ Input: () => <textarea aria-label="Message Copilot" /> }))
jest.mock('./status-footer/status-footer', () => ({ StatusFooter: () => null }))
jest.mock('./enable-copilot-screen/enable-copilot-screen', () => ({
  EnableCopilotScreen: () => <button>Enable Copilot</button>,
}))

const refetch = jest.fn()
function config(data?: { org_config: { enabled: boolean } }, isError = false) {
  jest.mocked(useAICopilotConfig).mockReturnValue({ data, isError, refetch } as ReturnType<typeof useAICopilotConfig>)
}
type SendMessageRef = { current: ((message: string) => void) | null }

function panel(sendMessageRef: SendMessageRef = { current: null }, open = true) {
  return (
    <DevopsCopilotContext.Provider value={{ devopsCopilotOpen: open, setDevopsCopilotOpen: jest.fn(), sendMessageRef }}>
      <DevopsCopilotPanel onClose={jest.fn()} />
    </DevopsCopilotContext.Provider>
  )
}
// Update inside the provider tree so queued state survives configuration changes.
function ExternalHelpPanel({ sendMessageRef }: { sendMessageRef: SendMessageRef }) {
  const [, refresh] = useReducer((value: number) => value + 1, 0)
  const [open, setOpen] = useState(true)
  return (
    <>
      <button onClick={refresh}>Refresh configuration</button>
      <button onClick={() => setOpen((value) => !value)}>Toggle panel</button>
      {panel(sendMessageRef, open)}
    </>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  jest
    .mocked(useQoveryContext)
    .mockReturnValue({ context: { organization: { id: 'org-id' } } } as ReturnType<typeof useQoveryContext>)
  config()
})
afterEach(() => jest.useRealTimers())

it.each(['loading', 'disabled', 'error'])('queues external help while configuration is %s', async (state) => {
  jest.useFakeTimers()
  config(state === 'disabled' ? { org_config: { enabled: false } } : undefined, state === 'error')
  const sendMessageRef = { current: null as ((message: string) => void) | null }
  const { userEvent } = renderWithProviders(<ExternalHelpPanel sendMessageRef={sendMessageRef} />)

  act(() => sendMessageRef.current?.('Help me install the demo cluster'))
  act(() => jest.runOnlyPendingTimers())
  expect(mockSendMessage).not.toHaveBeenCalled()

  config({ org_config: { enabled: true } })
  await userEvent.click(screen.getByRole('button', { name: 'Refresh configuration' }))
  act(() => jest.runOnlyPendingTimers())
  expect(mockSendMessage).toHaveBeenCalledWith('Help me install the demo cluster', true)
  expect(mockSendMessage).toHaveBeenCalledTimes(1)
})

it('waits for organization context before sending external help', async () => {
  jest.useFakeTimers()
  config({ org_config: { enabled: true } })
  jest.mocked(useQoveryContext).mockReturnValue({ context: {} } as ReturnType<typeof useQoveryContext>)
  const sendMessageRef = { current: null as ((message: string) => void) | null }
  const { userEvent } = renderWithProviders(<ExternalHelpPanel sendMessageRef={sendMessageRef} />)

  act(() => sendMessageRef.current?.('Help me install the demo cluster'))
  act(() => jest.runOnlyPendingTimers())
  expect(mockSendMessage).not.toHaveBeenCalled()

  jest.mocked(useQoveryContext).mockReturnValue({
    context: { organization: { id: 'org-id' } },
  } as ReturnType<typeof useQoveryContext>)
  await userEvent.click(screen.getByRole('button', { name: 'Refresh configuration' }))
  act(() => jest.runOnlyPendingTimers())
  expect(mockSendMessage).toHaveBeenCalledTimes(1)
})

it('discards queued help when closed instead of sending it on reopening', async () => {
  jest.useFakeTimers()
  const sendMessageRef: SendMessageRef = { current: null }
  const { userEvent } = renderWithProviders(<ExternalHelpPanel sendMessageRef={sendMessageRef} />)

  act(() => sendMessageRef.current?.('Help me install the demo cluster'))
  await userEvent.click(screen.getByRole('button', { name: 'Toggle panel' }))
  config({ org_config: { enabled: true } })
  await userEvent.click(screen.getByRole('button', { name: 'Toggle panel' }))
  act(() => jest.runOnlyPendingTimers())
  expect(mockSendMessage).not.toHaveBeenCalled()

  act(() => sendMessageRef.current?.('A new request'))
  act(() => jest.runOnlyPendingTimers())
  expect(mockSendMessage).toHaveBeenCalledWith('A new request', true)
  expect(mockSendMessage).toHaveBeenCalledTimes(1)
})

it.each([true, false])('waits for configuration before showing the enabled state (%s)', (enabled) => {
  const { rerender } = renderWithProviders(panel())
  expect(screen.getByRole('status', { name: 'Loading Copilot' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Enable Copilot' })).not.toBeInTheDocument()
  expect(screen.queryByRole('textbox', { name: 'Message Copilot' })).not.toBeInTheDocument()

  config({ org_config: { enabled } })
  rerender(panel())
  expect(screen.queryByRole('status', { name: 'Loading Copilot' })).not.toBeInTheDocument()
  expect(Boolean(screen.queryByRole('textbox', { name: 'Message Copilot' }))).toBe(enabled)
  expect(Boolean(screen.queryByRole('button', { name: 'Enable Copilot' }))).toBe(!enabled)
})

it('waits for the organization before interpreting configuration', () => {
  jest.mocked(useQoveryContext).mockReturnValue({ context: {} } as ReturnType<typeof useQoveryContext>)
  renderWithProviders(panel())
  expect(screen.getByRole('status', { name: 'Loading Copilot' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Enable Copilot' })).not.toBeInTheDocument()
})

it('shows a retry action instead of activation when configuration fails', async () => {
  config(undefined, true)
  const { userEvent } = renderWithProviders(panel())
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load Copilot')
  expect(screen.queryByRole('button', { name: 'Enable Copilot' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(refetch).toHaveBeenCalledTimes(1)
})

it('keeps the available configuration if a background refresh fails', () => {
  config({ org_config: { enabled: true } }, true)
  renderWithProviders(panel())
  expect(screen.getByRole('textbox', { name: 'Message Copilot' })).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Enable Copilot' })).not.toBeInTheDocument()
})

it('offers to retry loading the organization instead of showing an endless loader', async () => {
  const refetchOrganization = jest.fn()
  jest.mocked(useQoveryContext).mockReturnValue({
    context: {},
    organizationError: new Error('Organization unavailable'),
    refetchOrganization,
  } as unknown as ReturnType<typeof useQoveryContext>)
  const { userEvent } = renderWithProviders(panel())
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load Copilot')
  expect(screen.queryByRole('status', { name: 'Loading Copilot' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Enable Copilot' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(refetchOrganization).toHaveBeenCalledTimes(1)
  expect(refetch).not.toHaveBeenCalled()
})

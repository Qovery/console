import { type PropsWithChildren } from 'react'
import { useQoveryContext } from '@qovery/shared/devops-copilot/context'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
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
jest.mock('./hooks/use-message-submission/use-message-submission', () => ({
  useMessageSubmission: () => ({ handleSendMessage: jest.fn() }),
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
function panel() {
  return (
    <DevopsCopilotContext.Provider
      value={{ devopsCopilotOpen: true, setDevopsCopilotOpen: jest.fn(), sendMessageRef: { current: null } }}
    >
      <DevopsCopilotPanel onClose={jest.fn()} />
    </DevopsCopilotContext.Provider>
  )
}
beforeEach(() => {
  jest.clearAllMocks()
  jest
    .mocked(useQoveryContext)
    .mockReturnValue({ context: { organization: { id: 'org-id' } } } as ReturnType<typeof useQoveryContext>)
  config()
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

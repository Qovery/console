import posthog from 'posthog-js'
import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { DevopsCopilotTroubleshootTrigger } from './devops-copilot-troubleshoot-trigger'

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    capture: jest.fn(),
  },
}))

jest.mock('@qovery/shared/ui', () => ({
  Button: ({ children, className }: { children: ReactNode; className?: string }) => (
    <button className={className}>{children}</button>
  ),
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
  Tooltip: ({ children, content }: { children: ReactNode; content: ReactNode }) => {
    const React = jest.requireActual('react')

    return (
      <div>
        <div data-testid="tooltip-content">{content}</div>
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              'data-testid': 'tooltip-trigger',
            })
          : children}
      </div>
    )
  },
}))

const mockSetDevopsCopilotOpen = jest.fn()
const mockSendMessage = jest.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
  <DevopsCopilotContext.Provider
    value={{
      devopsCopilotOpen: false,
      setDevopsCopilotOpen: mockSetDevopsCopilotOpen,
      sendMessageRef: {
        current: mockSendMessage,
      },
    }}
  >
    {children}
  </DevopsCopilotContext.Provider>
)

describe('DevopsCopilotTroubleshootTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the troubleshoot tooltip content', () => {
    renderWithProviders(
      <DevopsCopilotTroubleshootTrigger
        source="service-deployment-list"
        deploymentId="exec-123"
        message="Why did my deployment fail? (execution id: exec-123)"
      />,
      { wrapper }
    )

    expect(screen.getByText('Ask for diagnostic')).toBeInTheDocument()
    expect(screen.getAllByTestId('icon-sparkles')).toHaveLength(2)
    expect(screen.getByTestId('icon-arrow-right')).toBeInTheDocument()
  })

  it('opens the copilot and tracks the troubleshoot event when clicked', async () => {
    const { userEvent } = renderWithProviders(
      <DevopsCopilotTroubleshootTrigger
        source="service-deployment-list"
        deploymentId="exec-123"
        message="Why did my deployment fail? (execution id: exec-123)"
      />,
      { wrapper }
    )

    await userEvent.click(screen.getByTestId('tooltip-trigger'))

    expect(mockSetDevopsCopilotOpen).toHaveBeenCalledWith(true)
    expect(mockSendMessage).toHaveBeenCalledWith('Why did my deployment fail? (execution id: exec-123)')
    expect(posthog.capture).toHaveBeenCalledWith('ai-copilot-troubleshoot-triggered', {
      source: 'service-deployment-list',
      deployment_id: 'exec-123',
    })
  })
})

import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { DevopsCopilotButton } from './devops-copilot-button'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

const mockSetDevopsCopilotOpen = jest.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
  <DevopsCopilotContext.Provider
    value={{
      devopsCopilotOpen: false,
      setDevopsCopilotOpen: mockSetDevopsCopilotOpen,
      sendMessageRef: undefined,
    }}
  >
    {children}
  </DevopsCopilotContext.Provider>
)

describe('DevopsCopilotButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the copilot button', () => {
    renderWithProviders(<DevopsCopilotButton />, { wrapper })

    expect(screen.getByRole('button', { name: 'AI Copilot' })).toBeInTheDocument()
  })

  it('should open the copilot panel when clicked', async () => {
    const { userEvent } = renderWithProviders(<DevopsCopilotButton />, { wrapper })

    await userEvent.click(screen.getByRole('button', { name: 'AI Copilot' }))

    expect(mockSetDevopsCopilotOpen).toHaveBeenCalledWith(true)
  })
})

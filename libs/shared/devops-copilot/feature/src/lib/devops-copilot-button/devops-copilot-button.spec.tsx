import { TooltipProvider } from '@radix-ui/react-tooltip'
import { type ReactNode } from 'react'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { DevopsCopilotButton } from './devops-copilot-button'

jest.mock('@qovery/shared/util-hooks', () => ({
  useFormatHotkeys: jest.fn(),
}))

const mockSetDevopsCopilotOpen = jest.fn()

const wrapper = ({ children, devopsCopilotOpen = false }: { children: ReactNode; devopsCopilotOpen?: boolean }) => (
  <TooltipProvider>
    <DevopsCopilotContext.Provider
      value={{
        devopsCopilotOpen,
        setDevopsCopilotOpen: mockSetDevopsCopilotOpen,
      }}
    >
      {children}
    </DevopsCopilotContext.Provider>
  </TooltipProvider>
)

describe('DevopsCopilotButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFormatHotkeys as jest.Mock).mockReturnValue('⌘')
  })

  it('should render button when metaKey is available', () => {
    const { getByText } = renderWithProviders(<DevopsCopilotButton />, { wrapper })

    expect(getByText('AI Copilot')).toBeInTheDocument()
  })

  it('should display correct hotkey combination', () => {
    const { getByText } = renderWithProviders(<DevopsCopilotButton />, { wrapper })

    expect(getByText('⌘')).toBeInTheDocument()
    expect(getByText('i')).toBeInTheDocument()
  })

  it('should call setDevopsCopilotOpen when button is clicked', () => {
    const { getByText } = renderWithProviders(<DevopsCopilotButton />, { wrapper })

    getByText('AI Copilot').closest('button')?.click()

    expect(mockSetDevopsCopilotOpen).toHaveBeenCalledWith(true)
  })

  it('should apply active styles when devopsCopilotOpen is true', () => {
    const { getByText } = renderWithProviders(<DevopsCopilotButton />, {
      wrapper: ({ children }) => wrapper({ children, devopsCopilotOpen: true }),
    })

    const button = getByText('AI Copilot').closest('button')
    expect(button).toHaveClass('bg-neutral-50')
  })

  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<DevopsCopilotButton />, { wrapper })

    expect(baseElement).toMatchSnapshot()
  })
})

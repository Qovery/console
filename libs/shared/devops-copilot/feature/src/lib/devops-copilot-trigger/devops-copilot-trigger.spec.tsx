import { type ReactNode } from 'react'
import { render } from '@qovery/shared/util-tests'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { DevopsCopilotTrigger } from './devops-copilot-trigger'

jest.mock('../devops-copilot-panel/devops-copilot-panel', () => ({
  DevopsCopilotPanel: ({ onClose, style }: { onClose: () => void; style: { display: string } }) => (
    <div data-testid="devops-copilot-panel" style={style}>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

const mockSetDevopsCopilotOpen = jest.fn()

const wrapper = ({ children, devopsCopilotOpen = false }: { children: ReactNode; devopsCopilotOpen?: boolean }) => (
  <DevopsCopilotContext.Provider
    value={{
      devopsCopilotOpen,
      setDevopsCopilotOpen: mockSetDevopsCopilotOpen,
    }}
  >
    {children}
  </DevopsCopilotContext.Provider>
)

describe('DevopsCopilotTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render DevopsCopilotPanel', () => {
    const { getByTestId } = render(<DevopsCopilotTrigger />, { wrapper })

    expect(getByTestId('devops-copilot-panel')).toBeInTheDocument()
  })

  it('should hide panel when devopsCopilotOpen is false', () => {
    const { getByTestId } = render(<DevopsCopilotTrigger />, { wrapper })

    const panel = getByTestId('devops-copilot-panel')
    expect(panel).toHaveStyle({ display: 'none' })
  })

  it('should show panel when devopsCopilotOpen is true', () => {
    const { getByTestId } = render(<DevopsCopilotTrigger />, {
      wrapper: ({ children }) => wrapper({ children, devopsCopilotOpen: true }),
    })

    const panel = getByTestId('devops-copilot-panel')
    expect(panel).not.toHaveStyle({ display: 'none' })
  })

  it('should call setDevopsCopilotOpen(false) when onClose is called', () => {
    const { getByText } = render(<DevopsCopilotTrigger />, { wrapper })

    getByText('Close').click()

    expect(mockSetDevopsCopilotOpen).toHaveBeenCalledWith(false)
  })

  it('should match snapshot', () => {
    const { baseElement } = render(<DevopsCopilotTrigger />, { wrapper })

    expect(baseElement).toMatchSnapshot()
  })
})

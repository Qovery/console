import { TooltipProvider } from '@radix-ui/react-tooltip'
import { type ReactNode } from 'react'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { Input } from './input'

const TooltipWrapper = ({ children }: { children: ReactNode }) => <TooltipProvider>{children}</TooltipProvider>

describe('Input', () => {
  const mockOnClick = jest.fn()
  const mockStop = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render input with placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(<Input loading={false} onClick={mockOnClick} />, {
      wrapper: TooltipWrapper,
    })

    expect(getByPlaceholderText('Ask Qovery Copilot')).toBeInTheDocument()
  })

  it('should call onClick when button is clicked and not loading', () => {
    const { getByRole } = renderWithProviders(<Input loading={false} onClick={mockOnClick} />, {
      wrapper: TooltipWrapper,
    })

    const button = getByRole('button')
    button.click()

    expect(mockOnClick).toHaveBeenCalled()
    expect(mockStop).not.toHaveBeenCalled()
  })

  it('should call stop when button is clicked and loading', () => {
    const { getByRole } = renderWithProviders(<Input loading={true} onClick={mockOnClick} stop={mockStop} />, {
      wrapper: TooltipWrapper,
    })

    const button = getByRole('button')
    button.click()

    expect(mockStop).toHaveBeenCalled()
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('should disable button when disabled prop is true', () => {
    const { getByRole } = renderWithProviders(<Input loading={false} onClick={mockOnClick} disabled />, {
      wrapper: TooltipWrapper,
    })

    const button = getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should match snapshot when not loading', () => {
    const { baseElement } = renderWithProviders(<Input loading={false} onClick={mockOnClick} />, {
      wrapper: TooltipWrapper,
    })

    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot when loading', () => {
    const { baseElement } = renderWithProviders(<Input loading={true} onClick={mockOnClick} stop={mockStop} />, {
      wrapper: TooltipWrapper,
    })

    expect(baseElement).toMatchSnapshot()
  })
})

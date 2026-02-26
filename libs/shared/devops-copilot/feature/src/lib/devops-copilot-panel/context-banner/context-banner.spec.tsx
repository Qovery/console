import { render, screen } from '@qovery/shared/util-tests'
import { ContextBanner } from './context-banner'

jest.mock('@qovery/shared/ui', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode
    onClick: () => void
    className?: string
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} data-icon-name={iconName} />,
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-tooltip={content}>{children}</div>
  ),
}))

jest.mock('@qovery/shared/util-js', () => ({
  upperCaseFirstLetter: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}))

describe('ContextBanner', () => {
  const mockOnClose = jest.fn()

  const defaultProps = {
    currentType: 'environment',
    currentName: 'Production',
    onClose: mockOnClose,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render context type and name', () => {
      render(<ContextBanner {...defaultProps} />)

      expect(screen.getByText(/Environment:/i)).toBeInTheDocument()
      expect(screen.getByText('Production')).toBeInTheDocument()
    })

    it('should capitalize first letter of context type', () => {
      render(<ContextBanner {...defaultProps} currentType="service" />)

      expect(screen.getByText(/Service:/i)).toBeInTheDocument()
    })

    it('should render plug icon', () => {
      const { container } = render(<ContextBanner {...defaultProps} />)

      const icon = container.querySelector('[data-icon-name="plug"]')
      expect(icon).toBeInTheDocument()
    })

    it('should render close button with xmark icon', () => {
      const { container } = render(<ContextBanner {...defaultProps} />)

      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()

      const xmarkIcon = container.querySelector('[data-icon-name="xmark"]')
      expect(xmarkIcon).toBeInTheDocument()
    })

    it('should render tooltip', () => {
      render(<ContextBanner {...defaultProps} />)

      const tooltipTrigger = screen.getByText(/Environment:/i).closest('span')
      expect(tooltipTrigger).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ContextBanner {...defaultProps} />)

      const closeButton = screen.getByRole('button')
      closeButton.click()

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('different context types', () => {
    it('should render organization context', () => {
      render(<ContextBanner {...defaultProps} currentType="organization" currentName="Qovery" />)

      expect(screen.getByText(/Organization:/i)).toBeInTheDocument()
      expect(screen.getByText('Qovery')).toBeInTheDocument()
    })

    it('should render cluster context', () => {
      render(<ContextBanner {...defaultProps} currentType="cluster" currentName="prod-cluster-01" />)

      expect(screen.getByText(/Cluster:/i)).toBeInTheDocument()
      expect(screen.getByText('prod-cluster-01')).toBeInTheDocument()
    })

    it('should render project context', () => {
      render(<ContextBanner {...defaultProps} currentType="project" currentName="My Project" />)

      expect(screen.getByText(/Project:/i)).toBeInTheDocument()
      expect(screen.getByText('My Project')).toBeInTheDocument()
    })

    it('should render service context', () => {
      render(<ContextBanner {...defaultProps} currentType="service" currentName="api-gateway" />)

      expect(screen.getByText(/Service:/i)).toBeInTheDocument()
      expect(screen.getByText('api-gateway')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have correct banner classes', () => {
      const { container } = render(<ContextBanner {...defaultProps} />)

      const banner = container.querySelector('.absolute.top-2\\.5')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveClass('rounded-t-xl')
      expect(banner).toHaveClass('border')
      expect(banner).toHaveClass('bg-neutral-100')
    })

    it('should have close button positioned absolutely', () => {
      render(<ContextBanner {...defaultProps} />)

      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveClass('absolute')
      expect(closeButton).toHaveClass('right-2')
      expect(closeButton).toHaveClass('top-0.5')
    })

    it('should apply font-medium to context name', () => {
      render(<ContextBanner {...defaultProps} />)

      const contextName = screen.getByText('Production')
      expect(contextName).toHaveClass('font-medium')
    })
  })
})

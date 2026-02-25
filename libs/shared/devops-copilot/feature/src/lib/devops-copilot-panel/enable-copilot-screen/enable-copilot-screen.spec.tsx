import { render, screen } from '@qovery/shared/util-tests'
import { EnableCopilotScreen } from './enable-copilot-screen'

jest.mock('@qovery/shared/ui', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} data-icon-name={iconName} />,
  Link: ({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  ),
}))

describe('EnableCopilotScreen', () => {
  const mockOnClose = jest.fn()

  const defaultProps = {
    organizationId: 'org-123',
    onClose: mockOnClose,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render robot icon', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const robotIcon = container.querySelector('[data-icon-name="robot"]')
      expect(robotIcon).toBeInTheDocument()
    })

    it('should render heading text', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      expect(screen.getByText('AI Copilot not activated yet')).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      expect(screen.getByText(/Our DevOps AI Copilot can help you fix your deployments/i)).toBeInTheDocument()
    })

    it('should render Enable AI Copilot button', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Enable AI Copilot/i })
      expect(button).toBeInTheDocument()
    })

    it('should render sparkles icon in button', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const sparklesIcon = container.querySelector('[data-icon-name="sparkles"]')
      expect(sparklesIcon).toBeInTheDocument()
    })

    it('should render decorative SVG corners', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '40')
      expect(svg).toHaveAttribute('height', '40')
    })
  })

  describe('navigation', () => {
    it('should render link to AI Copilot settings', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', expect.stringContaining('org-123'))
      expect(link).toHaveAttribute('href', expect.stringContaining('ai-copilot'))
    })

    it('should call onClose when link is clicked', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      const link = screen.getByRole('link')
      link.click()

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should handle undefined organizationId', () => {
      render(<EnableCopilotScreen {...defaultProps} organizationId={undefined} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', expect.stringContaining(':organizationId'))
    })
  })

  describe('content', () => {
    it('should display all key features in description', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      const description = screen.getByText(/Our DevOps AI Copilot/i)
      expect(description).toHaveTextContent('fix your deployments')
      expect(description).toHaveTextContent('optimize your infrastructure costs')
      expect(description).toHaveTextContent('audit your security')
    })

    it('should encourage user to enable in settings', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      expect(screen.getByText(/Enable it in your organization settings to get started/i)).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have centered layout', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const mainContainer = container.querySelector('.flex.grow.flex-col.items-center.justify-center')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should have neutral background', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const mainContainer = container.querySelector('.bg-neutral-100')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should have max-width on description', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const descriptionContainer = container.querySelector('.max-w-md')
      expect(descriptionContainer).toBeInTheDocument()
    })

    it('should render button with medium size', () => {
      render(<EnableCopilotScreen {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Enable AI Copilot/i })
      expect(button).toBeInTheDocument()
    })

    it('should have icon positioned relatively in container', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const iconContainer = container.querySelector('.relative.flex.h-10.w-10')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should position SVG absolutely', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const svg = container.querySelector('svg.absolute.inset-0')
      expect(svg).toBeInTheDocument()
    })

    it('should have gap between elements', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const mainContainer = container.querySelector('.gap-4')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should center text content', () => {
      const { container } = render(<EnableCopilotScreen {...defaultProps} />)

      const textContainer = container.querySelector('.text-center')
      expect(textContainer).toBeInTheDocument()
    })
  })
})

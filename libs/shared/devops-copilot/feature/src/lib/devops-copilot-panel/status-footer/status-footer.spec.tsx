import { render, screen } from '@qovery/shared/util-tests'
import { StatusFooter } from './status-footer'

jest.mock('@qovery/shared/ui', () => ({
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} data-icon-name={iconName} />,
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-tooltip={content}>{children}</div>
  ),
  DotStatus: ({ color }: { color: string }) => <span data-testid="dot-status" data-color={color} />,
}))

describe('StatusFooter', () => {
  const defaultProps = {
    isReadOnly: true,
    appStatus: undefined,
  }

  describe('rendering', () => {
    it('should render read-only mode text when isReadOnly is true', () => {
      render(<StatusFooter {...defaultProps} />)

      expect(screen.getByText('Read-only mode')).toBeInTheDocument()
    })

    it('should render read-write mode text when isReadOnly is false', () => {
      render(<StatusFooter {...defaultProps} isReadOnly={false} />)

      expect(screen.getByText('Read-write mode')).toBeInTheDocument()
    })

    it('should render info icon', () => {
      const { container } = render(<StatusFooter {...defaultProps} />)

      const icon = container.querySelector('[data-icon-name="circle-info"]')
      expect(icon).toBeInTheDocument()
    })

    it('should render tooltip button', () => {
      render(<StatusFooter {...defaultProps} />)

      const tooltipButton = screen.getByRole('button')
      expect(tooltipButton).toBeInTheDocument()
    })
  })

  describe('app status', () => {
    it('should not render status link when appStatus is undefined', () => {
      render(<StatusFooter {...defaultProps} />)

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('should render operational status', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'OPERATIONAL' }} />)

      expect(screen.getByText('All systems operational')).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('status.qovery.com'))
    })

    it('should render major outage status', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'MAJOROUTAGE' }} />)

      expect(screen.getByText('Major outage ongoing')).toBeInTheDocument()
    })

    it('should render minor outage status', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'MINOROUTAGE' }} />)

      expect(screen.getByText('Minor outage ongoing')).toBeInTheDocument()
    })

    it('should render partial outage status', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'PARTIALOUTAGE' }} />)

      expect(screen.getByText('Partial outage ongoing')).toBeInTheDocument()
    })

    it('should render status link with correct attributes', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'OPERATIONAL' }} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('DotStatus color', () => {
    it('should render dot status for operational status', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'OPERATIONAL' }} />)

      expect(screen.getByText('All systems operational')).toBeInTheDocument()
    })

    it('should render red dot for major outage', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'MAJOROUTAGE' }} />)

      expect(screen.getByText('Major outage ongoing')).toBeInTheDocument()
    })

    it('should render yellow dot for minor outage', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'MINOROUTAGE' }} />)

      expect(screen.getByText('Minor outage ongoing')).toBeInTheDocument()
    })

    it('should render yellow dot for partial outage', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'PARTIALOUTAGE' }} />)

      expect(screen.getByText('Partial outage ongoing')).toBeInTheDocument()
    })
  })

  describe('combined states', () => {
    it('should render both read-only mode and operational status', () => {
      render(<StatusFooter {...defaultProps} isReadOnly={true} appStatus={{ id: 'qovery', status: 'OPERATIONAL' }} />)

      expect(screen.getByText('Read-only mode')).toBeInTheDocument()
      expect(screen.getByText('All systems operational')).toBeInTheDocument()
    })

    it('should render both read-write mode and outage status', () => {
      render(<StatusFooter {...defaultProps} isReadOnly={false} appStatus={{ id: 'qovery', status: 'MAJOROUTAGE' }} />)

      expect(screen.getByText('Read-write mode')).toBeInTheDocument()
      expect(screen.getByText('Major outage ongoing')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have flex layout with space-between', () => {
      const { container } = render(<StatusFooter {...defaultProps} />)

      const footerContainer = container.firstChild
      expect(footerContainer).toHaveClass('flex')
      expect(footerContainer).toHaveClass('justify-between')
    })

    it('should render empty div when no app status', () => {
      const { container } = render(<StatusFooter {...defaultProps} />)

      const emptyDiv = container.querySelector('.h-4')
      expect(emptyDiv).toBeInTheDocument()
    })

    it('should have fade-in animation on status link', () => {
      render(<StatusFooter {...defaultProps} appStatus={{ id: 'qovery', status: 'OPERATIONAL' }} />)

      const link = screen.getByRole('link')
      expect(link).toHaveClass('animate-[fadein_0.22s_ease-in-out_forwards_0.20s]')
    })
  })
})

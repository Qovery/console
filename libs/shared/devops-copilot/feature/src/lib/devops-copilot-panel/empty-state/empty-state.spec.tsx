import { render, screen } from '@qovery/shared/util-tests'
import { EmptyState } from './empty-state'

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
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}))

describe('EmptyState', () => {
  const mockOnSuggestionClick = jest.fn()

  const mockDocLinks = [
    { label: 'How to deploy', link: 'https://example.com/deploy' },
    { label: 'Troubleshoot errors', link: 'https://example.com/troubleshoot' },
    { label: 'Optimize costs', link: 'https://example.com/costs' },
  ]

  const defaultProps = {
    docLinks: mockDocLinks,
    expand: true,
    onSuggestionClick: mockOnSuggestionClick,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render when expand is true and docLinks are provided', () => {
      render(<EmptyState {...defaultProps} />)

      expect(screen.getByText('Ask for a contextual suggestion:')).toBeInTheDocument()
    })

    it('should not render when expand is false', () => {
      render(<EmptyState {...defaultProps} expand={false} />)

      expect(screen.queryByText('Ask for a contextual suggestion:')).not.toBeInTheDocument()
    })

    it('should not render when docLinks is empty', () => {
      render(<EmptyState {...defaultProps} docLinks={[]} />)

      expect(screen.queryByText('Ask for a contextual suggestion:')).not.toBeInTheDocument()
    })

    it('should render sparkles icon', () => {
      render(<EmptyState {...defaultProps} />)

      expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument()
    })
  })

  describe('suggestions', () => {
    it('should render all doc links as buttons', () => {
      render(<EmptyState {...defaultProps} />)

      expect(screen.getByText('How to deploy')).toBeInTheDocument()
      expect(screen.getByText('Troubleshoot errors')).toBeInTheDocument()
      expect(screen.getByText('Optimize costs')).toBeInTheDocument()
    })

    it('should call onSuggestionClick when button is clicked', () => {
      render(<EmptyState {...defaultProps} />)

      const button = screen.getByText('How to deploy')
      button.click()

      expect(mockOnSuggestionClick).toHaveBeenCalledWith('How to deploy')
      expect(mockOnSuggestionClick).toHaveBeenCalledTimes(1)
    })

    it('should call onSuggestionClick with correct label for each button', () => {
      render(<EmptyState {...defaultProps} />)

      screen.getByText('Troubleshoot errors').click()
      expect(mockOnSuggestionClick).toHaveBeenCalledWith('Troubleshoot errors')

      screen.getByText('Optimize costs').click()
      expect(mockOnSuggestionClick).toHaveBeenCalledWith('Optimize costs')
    })
  })

  describe('styling', () => {
    it('should center content', () => {
      const { container } = render(<EmptyState {...defaultProps} />)

      const emptyStateContainer = container.firstChild
      expect(emptyStateContainer).toHaveClass('absolute')
      expect(emptyStateContainer).toHaveClass('left-1/2')
      expect(emptyStateContainer).toHaveClass('top-1/2')
    })

    it('should render buttons with surface variant', () => {
      render(<EmptyState {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).toHaveClass('inline-flex')
      })
    })
  })
})

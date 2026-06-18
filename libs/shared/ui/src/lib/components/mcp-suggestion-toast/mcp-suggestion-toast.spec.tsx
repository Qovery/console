import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { McpSuggestionCard } from './mcp-suggestion-toast'

describe('McpSuggestionCard', () => {
  it('should render the default title and install command', () => {
    renderWithProviders(<McpSuggestionCard />)

    expect(screen.getByText('Try deploying with')).toBeInTheDocument()
    expect(screen.getByText('curl -fsSL https://skill.qovery.com/install.sh | bash')).toBeInTheDocument()
  })

  it('should render a custom title and description', () => {
    renderWithProviders(<McpSuggestionCard title="Try optimizing your costs with" description="Ask your agent" />)

    expect(screen.getByText('Try optimizing your costs with')).toBeInTheDocument()
    expect(screen.getByText('Ask your agent')).toBeInTheDocument()
  })

  it('should render a dismiss button when close handler is provided', () => {
    renderWithProviders(<McpSuggestionCard onClose={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
})

import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { McpSuggestionCard, SKILL_INSTALL_COMMAND } from './mcp-suggestion-toast'

describe('McpSuggestionCard', () => {
  it('should render the default title and install command', () => {
    renderWithProviders(<McpSuggestionCard animatedBadge={false} />)

    expect(screen.getByText('Try deploying with')).toBeInTheDocument()
    expect(screen.getByText(SKILL_INSTALL_COMMAND)).toBeInTheDocument()
  })

  it('should render a custom title and description', () => {
    renderWithProviders(
      <McpSuggestionCard animatedBadge={false} title="Try optimizing your costs with" description="Ask your agent" />
    )

    expect(screen.getByText('Try optimizing your costs with')).toBeInTheDocument()
    expect(screen.getByText('Ask your agent')).toBeInTheDocument()
  })
})

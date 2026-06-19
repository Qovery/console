import { act } from '@testing-library/react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { showMcpSuggestionToast } from '../utils/mcp-suggestion-toast'
import { McpSuggestionCard, McpSuggestionPortal } from './mcp-suggestion-toast'

const MCP_SUGGESTION_DISMISSED_KEY = 'qovery_skill_suggestion_dismissed'

beforeEach(() => {
  jest.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  document.getElementById('qovery-floating-stack')?.remove()
  jest.useRealTimers()
})

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

describe('McpSuggestionPortal', () => {
  it('should show the toast when a suggestion event is dispatched', async () => {
    renderWithProviders(<McpSuggestionPortal />)

    act(() => {
      showMcpSuggestionToast({ type: 'service', name: 'api' })
    })

    expect(await screen.findByText('"Deploy my service api on Qovery"')).toBeInTheDocument()
  })

  it('should store the dismissal flag when the toast is dismissed', async () => {
    const { userEvent } = renderWithProviders(<McpSuggestionPortal />)

    act(() => {
      showMcpSuggestionToast({ type: 'service', name: 'api' })
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Dismiss' }))

    expect(localStorage.getItem(MCP_SUGGESTION_DISMISSED_KEY)).toBe('true')
  })
})

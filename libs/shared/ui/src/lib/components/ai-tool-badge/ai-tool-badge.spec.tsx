import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AiToolBadge, DEFAULT_AI_TOOL_NAME } from './ai-tool-badge'

describe('AiToolBadge', () => {
  it('should render the default tool name', () => {
    renderWithProviders(<AiToolBadge animated={false} />)

    expect(screen.getByText(DEFAULT_AI_TOOL_NAME)).toBeInTheDocument()
  })

  it('should render the provided tool name when not animated', () => {
    renderWithProviders(<AiToolBadge initialName="Cursor" animated={false} />)

    expect(screen.getByText('Cursor')).toBeInTheDocument()
  })

  it('should fall back to the default tool name for an unknown name', () => {
    renderWithProviders(<AiToolBadge initialName="Unknown" animated={false} />)

    expect(screen.getByText(DEFAULT_AI_TOOL_NAME)).toBeInTheDocument()
  })
})

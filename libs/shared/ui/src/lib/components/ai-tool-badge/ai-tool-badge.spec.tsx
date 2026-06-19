import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AiToolBadge } from './ai-tool-badge'

describe('AiToolBadge', () => {
  it('should render the default tool name', () => {
    renderWithProviders(<AiToolBadge />)

    expect(screen.getByText('Claude')).toBeInTheDocument()
  })
})

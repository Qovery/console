import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AiToolBadge } from './ai-tool-badge'

describe('AiToolBadge', () => {
  it('should render the default tool name', () => {
    renderWithProviders(<AiToolBadge />)

    expect(screen.getByText('Claude')).toBeInTheDocument()
  })

  it('should render the provided initial tool name', () => {
    renderWithProviders(<AiToolBadge initialName="Cursor" />)

    expect(screen.getByText('Cursor')).toBeInTheDocument()
  })

  it('should fall back to the default tool name for an unknown name', () => {
    renderWithProviders(<AiToolBadge initialName="Unknown" />)

    expect(screen.getByText('Claude')).toBeInTheDocument()
  })
})

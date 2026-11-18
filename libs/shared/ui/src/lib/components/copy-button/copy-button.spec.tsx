import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CopyButton from './copy-button'

describe('CopyButton', () => {
  test('should render CopyButton component', () => {
    renderWithProviders(<CopyButton content="Hello, world!" />)
    const copyButton = screen.getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })

  test('should render an accessible icon-only copy button without a visible label', () => {
    renderWithProviders(<CopyButton content="Hello, world!" iconOnly />)

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
  })
})

import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import CopyButton from './copy-button'

describe('CopyButton', () => {
  test('should render CopyButton component', () => {
    renderWithProviders(<CopyButton content="Hello, world!" />)
    const copyButton = screen.getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })
})

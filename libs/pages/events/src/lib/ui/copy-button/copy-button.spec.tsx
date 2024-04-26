import { renderWithProviders } from '@qovery/shared/util-tests'
import CopyButton from './copy-button'

describe('CopyButton', () => {
  test('should render CopyButton component', () => {
    const { getByText } = renderWithProviders(<CopyButton content="Hello, world!" />)
    const copyButton = getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })
})

import { render } from '__tests__/utils/setup-jest'
import CopyButton from './copy-button'

describe('CopyButton', () => {
  test('should render CopyButton component', () => {
    const { getByText } = render(<CopyButton content="Hello, world!" />)
    const copyButton = getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })
})

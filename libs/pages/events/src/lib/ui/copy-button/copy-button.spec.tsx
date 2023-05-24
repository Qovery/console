import { act, render } from '__tests__/utils/setup-jest'
import CopyButton from './copy-button'

describe('CopyButton', () => {
  test('should render CopyButton component', () => {
    const { getByText } = render(<CopyButton content="Hello, world!" />)
    const copyButton = getByText('Copy')
    expect(copyButton).toBeInTheDocument()
  })

  const writeText = jest.fn()
  Object.assign(navigator, {
    clipboard: {
      writeText,
    },
  })

  test('should call copyToClipboard function on button click', () => {
    const mockCopyToClipboard = jest.fn()
    jest.mock('@qovery/shared/utils', () => ({
      copyToClipboard: mockCopyToClipboard,
    }))

    const { getByText } = render(<CopyButton content="Hello, world!" />)
    const copyButton = getByText('Copy')

    act(() => {
      copyButton.click()
    })

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, world!')
  })
})

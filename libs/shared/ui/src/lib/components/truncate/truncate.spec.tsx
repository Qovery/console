import { render, screen } from '__tests__/utils/setup-jest'
import Truncate, { truncateText } from './truncate'

describe('Truncate', () => {
  const props = {
    truncateLimit: 2,
    text: 'Hello world !',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Truncate {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should truncate the current text', () => {
    render(<Truncate {...props} />)

    const text = screen.queryByTestId('truncate-text')
    const textTruncate = truncateText(props.text, props.truncateLimit)

    expect(text?.textContent).toBe(`${textTruncate}...`)
  })
})

import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Truncate, { truncateText } from './truncate'

describe('Truncate', () => {
  const props = {
    truncateLimit: 2,
    text: 'Hello world !',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Truncate {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should truncate the current text', () => {
    renderWithProviders(<Truncate {...props} />)

    const text = screen.queryByTestId('truncate-text')
    const textTruncate = truncateText(props.text, props.truncateLimit)

    expect(text?.textContent).toBe(`${textTruncate}…`)
  })
})

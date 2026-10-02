import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import HighlightText from './highlight-text'

describe('HighlightText', () => {
  it('renders plain text without a highlight', () => {
    const { container } = renderWithProviders(<HighlightText text="CPU target" />)

    expect(container).toHaveTextContent('CPU target')
    expect(container.querySelector('mark')).toBeNull()
  })

  it('highlights every case-insensitive match', () => {
    renderWithProviders(<HighlightText text="CPU and cpu budget" highlight="cpu" />)

    expect(screen.getAllByText(/cpu/i, { selector: 'mark' }).map((mark) => mark.textContent)).toEqual(['CPU', 'cpu'])
  })

  it('treats regular expression characters literally', () => {
    renderWithProviders(<HighlightText text="Timeout (seconds)" highlight="(sec" />)

    expect(screen.getByText('(sec', { selector: 'mark' })).toBeInTheDocument()
  })
})

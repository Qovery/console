import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import InputSearch, { type InputSearchProps } from './input-search'

let props: InputSearchProps

describe('InputSearch', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputSearch />)
    expect(baseElement).toBeTruthy()
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputSearch {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(input as HTMLInputElement).toHaveValue('some new text value')
  })

  it('follows default value changes', () => {
    const { rerender } = render(<InputSearch defaultValue="loki" />)

    rerender(<InputSearch defaultValue="envoy" />)
    expect(screen.getByRole('textbox')).toHaveValue('envoy')

    rerender(<InputSearch />)
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('keeps the typed value while focused', () => {
    const { rerender } = render(<InputSearch defaultValue="lo" />)
    const input = screen.getByRole('textbox')

    input.focus()
    fireEvent.change(input, { target: { value: 'loki' } })
    rerender(<InputSearch defaultValue="lok" />)

    expect(input).toHaveValue('loki')
  })
})

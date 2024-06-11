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
})

import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import InputTextArea, { type InputTextAreaProps } from './input-text-area'

describe('InputTextAreaArea', () => {
  let props: InputTextAreaProps

  beforeEach(() => {
    props = {
      name: 'some name',
      label: 'some label',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputTextArea {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes on focus and blur', () => {
    render(<InputTextArea {...props} />)

    const inputContainer = screen.getByLabelText('textarea-container')

    const input = screen.getByRole('textbox')

    fireEvent.focus(input)

    expect(inputContainer).toHaveClass('input--focused')

    fireEvent.blur(input)

    expect(inputContainer).not.toHaveClass('input--focused')
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputTextArea {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(input as HTMLInputElement).toHaveValue('some new text value')
  })
})

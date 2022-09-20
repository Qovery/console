import { fireEvent, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import InputTextArea, { InputTextAreaProps } from './input-text-area'

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

    expect(inputContainer.className).toContain('input--focused')

    fireEvent.blur(input)

    expect(inputContainer.className).not.toContain('input--focused')
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputTextArea {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect((input as HTMLInputElement).value).toBe('some new text value')
  })
})

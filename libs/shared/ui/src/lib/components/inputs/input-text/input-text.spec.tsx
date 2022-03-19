import { render } from '__tests__/utils/setup-jest'
import { fireEvent, screen } from '@testing-library/react'

import InputText, { InputTextProps } from './input-text'

describe('InputText', () => {
  let props: InputTextProps

  beforeEach(() => {
    props = {
      name: 'some name',
      label: 'some label',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputText name={props.name} label={props.label} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes as input actions', () => {
    props.error = 'some error'

    const { rerender } = render(<InputText {...props} />)

    let inputContainer = screen.getByLabelText('input-container')

    expect(inputContainer.className).toBe('input input--error')

    props.error = ''
    props.isValid = true

    rerender(<InputText {...props} />)

    inputContainer = screen.getByLabelText('input-container')
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(inputContainer.className).toBe('input input--focused')
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputText {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect((input as any).value).toBe('some new text value')
  })

  it('should call the getValue method when the input event is emitted', async () => {
    const getValue = jest.fn()

    props.getValue = getValue

    render(<InputText {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(getValue).toHaveBeenCalledWith('some name', 'some new text value')
  })
})

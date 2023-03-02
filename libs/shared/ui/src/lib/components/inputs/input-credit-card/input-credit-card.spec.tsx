import { fireEvent, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
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

    expect(inputContainer.className).toContain('input--error')

    props.error = ''

    rerender(<InputText {...props} />)

    inputContainer = screen.getByLabelText('input-container')
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(inputContainer.className).not.toContain('input--error')
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputText {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.input(input, { target: { value: 'some new text value' } })

    expect((input as HTMLInputElement).value).toBe('some new text value')
  })

  it('should display a floating component on the right', async () => {
    props.rightElement = <div>GB</div>
    render(<InputText {...props} />)

    screen.getByText('GB')

    const wrapper = screen.getByTestId('right-floating-component')
    expect(wrapper).toHaveClass('absolute top-1/2 -translate-y-1/2 right-4')
  })
})

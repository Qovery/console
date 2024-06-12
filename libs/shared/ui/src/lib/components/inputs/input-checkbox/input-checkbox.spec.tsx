import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import InputCheckbox, { type InputCheckboxProps } from './input-checkbox'

const props: InputCheckboxProps = {
  name: 'test',
  value: 'test',
}

describe('InputCheckbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputCheckbox {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should check the checkbox when the input event is emitted', async () => {
    render(<InputCheckbox {...props} />)

    const input = screen.getByRole('checkbox') as HTMLInputElement

    fireEvent.click(input)

    expect(input).toBeChecked()
  })

  it('should checked when the formValue and value is the same', async () => {
    props.formValue = 'test'

    render(<InputCheckbox {...props} />)

    const input = screen.getByRole('checkbox') as HTMLInputElement

    expect(input).toBeChecked()
  })

  it('should call the onChange method when the input event is emitted', async () => {
    const onChange = jest.fn()

    props.onChange = onChange

    render(<InputCheckbox {...props} />)

    const input = screen.getByRole('checkbox')

    fireEvent.click(input)

    expect(onChange).toHaveBeenCalled()
  })
})

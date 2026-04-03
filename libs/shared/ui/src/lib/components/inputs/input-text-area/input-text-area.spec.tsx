import { fireEvent, render, screen, waitFor } from '__tests__/utils/setup-jest'
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

  it('should disable the label transition while syncing a prefilled value', async () => {
    props.value = 'prefilled value'

    render(<InputTextArea {...props} />)

    const label = screen.getByText(props.label)
    const container = screen.getByLabelText('textarea-container')

    expect(container).toHaveClass('input--label-up')
    expect(label).toHaveClass('!transition-none')

    await waitFor(() => expect(screen.getByText(props.label)).not.toHaveClass('!transition-none'))
  })

  it('should disable the label transition when a value is injected after focus', async () => {
    const { rerender } = render(<InputTextArea {...props} value="" />)

    fireEvent.focus(screen.getByRole('textbox'))

    rerender(<InputTextArea {...props} value="prefilled value" />)

    expect(screen.getByLabelText('textarea-container')).toHaveClass('input--label-up')
    expect(screen.getByText(props.label)).toHaveClass('!transition-none')

    await waitFor(() => expect(screen.getByText(props.label)).not.toHaveClass('!transition-none'))
  })
})

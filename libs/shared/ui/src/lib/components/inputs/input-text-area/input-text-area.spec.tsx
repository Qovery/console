import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import InputTextArea, { type InputTextAreaProps } from './input-text-area'

describe('InputTextArea', () => {
  let props: InputTextAreaProps

  beforeEach(() => {
    props = {
      name: 'some name',
      label: 'some label',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputTextArea {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes on focus and blur', async () => {
    const { userEvent } = renderWithProviders(<InputTextArea {...props} />)

    const inputContainer = screen.getByLabelText('textarea-container')

    const input = screen.getByRole('textbox')

    await userEvent.click(input)

    expect(inputContainer).toHaveClass('input--focused')

    await userEvent.tab()

    expect(inputContainer).not.toHaveClass('input--focused')
  })

  it('should update the value when typing', async () => {
    const { userEvent } = renderWithProviders(<InputTextArea {...props} />)

    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'some new text value')

    expect(input).toHaveValue('some new text value')
  })

  it('should disable the label transition while syncing a prefilled value', async () => {
    props.value = 'prefilled value'

    renderWithProviders(<InputTextArea {...props} />)

    const label = screen.getByText(props.label)
    const container = screen.getByLabelText('textarea-container')

    expect(container).toHaveClass('input--label-up')
    expect(label).toHaveClass('!transition-none')

    await waitFor(() => expect(screen.getByText(props.label)).not.toHaveClass('!transition-none'))
  })

  it('should disable the label transition when a value is injected after focus', async () => {
    const { rerender, userEvent } = renderWithProviders(<InputTextArea {...props} value="" />)

    await userEvent.tab()

    expect(screen.getByRole('textbox')).toHaveFocus()

    rerender(<InputTextArea {...props} value="prefilled value" />)

    expect(screen.getByLabelText('textarea-container')).toHaveClass('input--label-up')
    expect(screen.getByText(props.label)).toHaveClass('!transition-none')

    await waitFor(() => expect(screen.getByText(props.label)).not.toHaveClass('!transition-none'))
  })
})

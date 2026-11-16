import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import InputText, { type InputTextProps } from './input-text'

describe('InputText', () => {
  let props: InputTextProps

  beforeEach(() => {
    props = {
      name: 'some name',
      label: 'some label',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputText name={props.name} label={props.label} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes as input actions', async () => {
    props.error = 'some error'

    const { rerender, userEvent } = renderWithProviders(<InputText {...props} />)

    let inputContainer = screen.getByLabelText('input-container')

    expect(inputContainer).toHaveClass('input--error')

    props.error = ''

    rerender(<InputText {...props} />)

    inputContainer = screen.getByLabelText('input-container')
    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'some new text value')

    expect(inputContainer).not.toHaveClass('input--error')
  })

  it('should update the value when typing', async () => {
    const { userEvent } = renderWithProviders(<InputText {...props} />)

    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'some new text value')

    expect(input).toHaveValue('some new text value')
  })

  it('should display a floating component on the right', async () => {
    props.rightElement = <div>GB</div>
    renderWithProviders(<InputText {...props} />)

    screen.getByText('GB')

    const wrapper = screen.getByTestId('right-floating-component')
    expect(wrapper).toHaveClass('absolute top-1/2 -translate-y-1/2 right-4')

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('!pr-9')
  })

  it('should keep the label up when the field is prefilled', () => {
    props.value = 'prefilled value'

    renderWithProviders(<InputText {...props} />)

    expect(screen.getByLabelText('input-container')).toHaveClass('input--label-up')
    expect(screen.getByRole('textbox')).toHaveValue('prefilled value')
  })

  it('should disable the label transition while syncing a prefilled value', async () => {
    props.value = 'prefilled value'

    renderWithProviders(<InputText {...props} />)

    const label = screen.getByText(props.label)

    expect(label).toHaveClass('!transition-none')

    await waitFor(() => expect(screen.getByText(props.label)).not.toHaveClass('!transition-none'))
  })

  it('should disable the label transition when a value is injected after focus', async () => {
    const { rerender, userEvent } = renderWithProviders(<InputText {...props} value="" />)

    await userEvent.tab()

    expect(screen.getByRole('textbox')).toHaveFocus()

    rerender(<InputText {...props} value="prefilled value" />)

    expect(screen.getByLabelText('input-container')).toHaveClass('input--label-up')
    expect(screen.getByText(props.label)).toHaveClass('!transition-none')

    await waitFor(() => expect(screen.getByText(props.label)).not.toHaveClass('!transition-none'))
  })
})

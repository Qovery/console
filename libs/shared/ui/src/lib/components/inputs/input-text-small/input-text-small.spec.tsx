import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import InputTextSmall, { type InputTextSmallProps } from './input-text-small'

describe('InputTextSmall', () => {
  let props: InputTextSmallProps

  beforeEach(() => {
    props = {
      name: 'some name',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputTextSmall {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply the accurate classes as input actions', () => {
    props.error = 'some error'

    const { rerender } = render(<InputTextSmall {...props} />)

    let inputContainer = screen.queryByTestId('input') as HTMLDivElement

    expect(inputContainer).toHaveClass('input--error')

    props.error = ''

    rerender(<InputTextSmall {...props} />)

    inputContainer = screen.queryByTestId('input') as HTMLDivElement
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(inputContainer).not.toHaveClass('input--error')
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputTextSmall {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(input as HTMLInputElement).toHaveValue('some new text value')
  })

  describe('with error on left', () => {
    beforeEach(() => {
      props.error = 'some error'
      props.errorMessagePosition = 'left'
    })

    it('should render the error icon and not print the bottom error', () => {
      render(<InputTextSmall {...props} />)

      const warningIcon = screen.getByTestId('warning-icon-left')
      expect(warningIcon).toBeInTheDocument()

      expect(screen.getByTestId('input')).toHaveClass('input--error')
      expect(screen.queryByText('some error')).not.toBeInTheDocument()
      expect(screen.getByTestId('input-small-wrapper')).toHaveClass('flex')
    })
  })

  describe('with warning on left', () => {
    beforeEach(() => {
      props.warning = 'some warning'
      props.errorMessagePosition = 'left'
    })

    it('should render the error icon and not print the bottom error', () => {
      render(<InputTextSmall {...props} />)

      const warningIcon = screen.getByTestId('warning-icon-left')
      expect(warningIcon).toBeInTheDocument()

      expect(screen.getByTestId('input')).not.toHaveClass('input--error')
      expect(screen.queryByText('some error')).not.toBeInTheDocument()
      expect(screen.getByTestId('input-small-wrapper')).toHaveClass('flex')
    })
  })

  it('should render icon', async () => {
    render(<InputTextSmall {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(input as HTMLInputElement).toHaveValue('some new text value')
  })

  it('should have a show hide button and button should toggle input type', async () => {
    render(<InputTextSmall {...props} hasShowPasswordButton={true} />)
    const button = screen.getByTestId('show-password-button')
    const icon = button.querySelector('.icon-solid-eye-slash')
    expect(icon).toBeTruthy()

    const input = screen.getByRole('textbox')

    fireEvent.click(button)
    expect(input).toHaveAttribute('type', 'password')
  })
})

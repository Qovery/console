import { fireEvent, screen } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import InputTextSmall, { InputTextSmallProps } from './input-text-small'

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

    expect(inputContainer.className).toContain('input--error')

    props.error = ''

    rerender(<InputTextSmall {...props} />)

    inputContainer = screen.queryByTestId('input') as HTMLDivElement
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect(inputContainer.className).not.toContain('input--error')
  })

  it('should set the text value when the input event is emitted', async () => {
    render(<InputTextSmall {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect((input as HTMLInputElement).value).toBe('some new text value')
  })

  describe('with error on left', () => {
    beforeEach(() => {
      props.error = 'some error'
      props.errorMessagePosition = 'left'
    })

    it('should render the error icon and not print the bottom error', () => {
      render(<InputTextSmall {...props} />)

      const warningIcon = screen.getByTestId('warning-icon-left')
      expect(warningIcon).toBeTruthy()

      expect(screen.getByTestId('input').className).toContain('input--error')
      expect(screen.queryByText('some error')).toBeNull()
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
      expect(warningIcon).toBeTruthy()

      expect(screen.getByTestId('input').className).not.toContain('input--error')
      expect(screen.queryByText('some error')).toBeNull()
      expect(screen.getByTestId('input-small-wrapper')).toHaveClass('flex')
    })
  })

  it('should render icon', async () => {
    render(<InputTextSmall {...props} />)

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'some new text value' } })

    expect((input as HTMLInputElement).value).toBe('some new text value')
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

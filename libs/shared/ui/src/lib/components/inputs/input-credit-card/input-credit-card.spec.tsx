import { act, fireEvent, getByDisplayValue, getByTestId, render, screen } from '__tests__/utils/setup-jest'
import InputCreditCard, { type InputCreditCardProps } from './input-credit-card'

describe('InputCreditCard', () => {
  let props: InputCreditCardProps

  beforeEach(() => {
    props = {
      name: 'some name',
      label: 'some label',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputCreditCard name={props.name} label={props.label} />)
    expect(baseElement).toBeTruthy()
  })

  it('should format the text for a number and show the matching credit card image', async () => {
    const { baseElement } = render(<InputCreditCard {...props} type="number" />)

    const input = screen.getByRole('textbox')

    const image = getByTestId(baseElement, 'credit-card-image')
    expect(image).toHaveAttribute('aria-label', 'Placeholder card')

    await act(() => {
      fireEvent.change(input, { target: { value: '4444444444444444' } })
    })

    expect(image).toHaveAttribute('aria-label', 'Visa')

    getByDisplayValue(baseElement, '4444 4444 4444 4444')
  })

  it('should set the value for expiry', async () => {
    const { baseElement } = render(<InputCreditCard {...props} type="expiry" />)

    const input = screen.getByRole('textbox')

    fireEvent.input(input, { target: { value: '0320' } })

    getByDisplayValue(baseElement, '03 / 20')
  })

  it('should set the value for ccv', async () => {
    const { baseElement } = render(<InputCreditCard {...props} type="cvc" />)

    const input = screen.getByRole('textbox')

    await act(() => {
      fireEvent.input(input, { target: { value: '032' } })
    })

    getByDisplayValue(baseElement, '032')
  })
})

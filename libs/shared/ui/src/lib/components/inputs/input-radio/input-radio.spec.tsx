import { fireEvent, render, screen } from '__tests__/utils/setup-jest'
import InputRadio, { type InputRadioProps } from './input-radio'

describe('InputRadio', () => {
  let props: InputRadioProps

  beforeEach(() => {
    props = {
      name: 'some-name',
      value: '1',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<InputRadio {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should check the radio when the input event is emitted', async () => {
    render(<InputRadio {...props} />)

    const input = screen.getByRole('radio')

    fireEvent.click(input)

    expect(input).toBeChecked()
  })

  it('should call the getValue method when the input event is emitted', async () => {
    const getValue = jest.fn()

    props.getValue = getValue

    render(<InputRadio {...props} />)

    const input = screen.getByRole('radio')

    fireEvent.click(input)

    expect(getValue).toHaveBeenCalledWith(true, '1')
  })

  it('should call display a description', async () => {
    render(<InputRadio {...props} description="qovery is life" />)

    screen.getByText('qovery is life')
  })
})

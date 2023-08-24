import { act, getByTestId, render, waitFor } from '__tests__/utils/setup-jest'
import InputRadioBox, { type InputRadioBoxProps } from './input-radio-box'

const props: InputRadioBoxProps = {
  fieldValue: '',
  onChange: jest.fn(),
  name: 'selected',
  label: 'Start',
  value: 'start',
  description: <p data-testid="description">Description</p>,
}

describe('InputRadioBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with nothing selected', () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    const radioBox = getByTestId(baseElement, 'input-radio-box')
    expect(radioBox).toHaveClass('bg-neutral-100 border-neutral-250')
  })

  it('should select on click', async () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    const radioBox = getByTestId(baseElement, 'input-radio-box')
    await act(() => {
      radioBox.click()
    })
    await waitFor(() => {
      expect(props.onChange).toHaveBeenCalled()
    })
  })

  it('should display border color and background if selected', async () => {
    const { baseElement } = render(<InputRadioBox {...props} name="selected" fieldValue="start" />)
    const radioBox = getByTestId(baseElement, 'input-radio-box')
    expect(radioBox).toHaveClass('bg-brand-50 border-brand-500')
  })

  it('should display description if provided', async () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    getByTestId(baseElement, 'description')
  })
})

import { act, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import InputRadioBox, { InputRadioBoxProps } from './input-radio-box'

const props: InputRadioBoxProps = {
  field: {
    name: 'selected',
    value: '',
    onChange: jest.fn(),
  },
  name: 'Start',
  value: 'start',
  description: <p data-testid="description">Description</p>,
  onClick: jest.fn(),
  currentValue: 'start',
}

describe('InputRadioBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render with nothing selected', () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    const radioBox = getByTestId(baseElement, 'input-radio-box')
    expect(radioBox).toHaveClass('bg-element-light-lighter-200 border-element-light-lighter-500')
  })

  it('should select on click', async () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    const radioBox = getByTestId(baseElement, 'input-radio-box')
    await act(() => {
      radioBox.click()
    })
    expect(props.onClick).toHaveBeenCalledWith('selected', 'start')
  })

  it('should display border color and background if selected', async () => {
    const { baseElement } = render(
      <InputRadioBox {...props} field={{ name: 'selected', value: 'start', onChange: jest.fn() }} />
    )
    const radioBox = getByTestId(baseElement, 'input-radio-box')
    expect(radioBox).toHaveClass('bg-brand-50 border-brand-500')
  })

  it('should display description if provided', async () => {
    const { baseElement } = render(<InputRadioBox {...props} />)
    getByTestId(baseElement, 'description')
  })
})

import { render } from '__tests__/utils/setup-jest'
import { act, fireEvent, screen } from '@testing-library/react'
import { Simulate } from 'react-dom/test-utils'
import { Slider, SliderProps } from './slider'

describe('Slider', () => {
  let props: SliderProps

  beforeEach(() => {
    props = {
      min: 10,
      max: 100,
      step: 10,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Slider {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have label in the top of the input range', () => {
    props.label = 'my label'

    render(<Slider {...props} />)

    const label = screen.queryByTestId('label')

    expect(label?.textContent).toBe('my label')
  })

  it('should set the value when the input event is emitted', () => {
    render(<Slider {...props} />)

    const input = screen.queryByTestId('input-range') as HTMLInputElement

    fireEvent.change(input, { target: { value: '10' } })

    expect(input.value).toBe('10')
  })

  it('should have callback and return value', () => {
    const getValue = jest.fn()

    props.getValue = getValue

    render(<Slider {...props} />)

    const input = screen.queryByTestId('input-range') as HTMLInputElement

    act(() => {
      input.value = '100'
      Simulate.change(input)
    })

    expect(getValue).toHaveBeenCalledWith(100)
  })
})

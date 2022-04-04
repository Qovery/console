import { render } from '__tests__/utils/setup-jest'
import { fireEvent } from '@testing-library/react'
import { Slider, SliderProps } from './slider'

let props: SliderProps

let container

beforeEach(() => {
  props = {
    min: 10,
    max: 100,
    step: 10,
  }

  container = document.createElement('div')
  document.body.appendChild(container)
})
describe('Slider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Slider {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should apply class name', () => {
    props.className = 'some-class-name'

    const rendered = render(<Slider {...props} />)

    const slider = rendered.container.querySelector('.slider')

    expect(slider?.classList.contains('some-class-name')).toBe(true)
  })

  it('should have label', () => {
    props.label = 'my label'

    const rendered = render(<Slider {...props} />)

    const label = rendered.container.querySelector('.slider div p:first-child')

    expect(label?.textContent).toBe('my label')
  })

  it('should set the value when the input event is emitted', () => {
    const rendered = render(<Slider {...props} />)

    const input: any = rendered.container.querySelector('input')

    fireEvent.change(input, { target: { value: '10' } })

    expect(input.value).toBe('10')
  })

  it('shoud have callback and return value', () => {
    const getValue = jest.fn()

    props.getValue = getValue(10)

    expect(getValue).toHaveBeenCalledWith(10)
  })
})

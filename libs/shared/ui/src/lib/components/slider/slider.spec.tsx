import { render } from '@testing-library/react'
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
})

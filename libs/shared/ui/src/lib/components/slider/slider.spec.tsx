import { act, render, screen } from '__tests__/utils/setup-jest'
import { Slider, type SliderProps } from './slider'

describe('Slider', () => {
  let props: SliderProps

  beforeEach(() => {
    props = {
      value: [10],
      min: 10,
      max: 100,
      step: 10,
      onChange: jest.fn(),
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

  it('should set a default values with correct attributes', () => {
    props.value = [20, 30]

    render(<Slider {...props} />)

    const input = screen.getAllByRole('slider') as HTMLSpanElement[]

    act(() => {
      input[0].setAttribute('aria-valuenow', '25')
      input[1].setAttribute('aria-valuenow', '35')
    })

    expect(input[0]).toHaveAttribute('aria-valuenow', '25')
    expect(input[1]).toHaveAttribute('aria-valuenow', '35')
  })
})

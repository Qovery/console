import { render } from '__tests__/utils/setup-jest'
import { PlanEnum } from 'qovery-typescript-axios'
import PlanCard, { PlanCardProps } from './plan-card'

describe('PlanCard', () => {
  let props: PlanCardProps

  beforeEach(() => {
    props = {
      name: PlanEnum.FREE,
      title: 'Free',
      text: 'Adapted for personnal project',
      onClick: jest.fn(),
      loading: '',
      price: 200,
      list: ['test'],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PlanCard {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have text content', () => {
    const { baseElement } = render(<PlanCard {...props} />)

    expect(baseElement.textContent).toContain(props.title)
    expect(baseElement.textContent).toContain(props.text)
    expect(baseElement.textContent).toContain(`$${props.price}`)
    expect(baseElement.textContent).toContain(props.list[0])
  })

  it('should Custom text for Enterprise plan', () => {
    props.name = PlanEnum.ENTERPRISE

    const { baseElement } = render(<PlanCard {...props} />)

    expect(baseElement.textContent).toContain('Custom')
  })
})

import { render } from '__tests__/utils/setup-jest'
import { PlanEnum } from 'qovery-typescript-axios'
import PlanCard, { type PlanCardProps } from './plan-card'

describe('PlanCard', () => {
  let props: PlanCardProps

  beforeEach(() => {
    props = {
      name: PlanEnum.TEAM_2025,
      title: 'Team',
      text: 'Ideal for teams',
      onClick: jest.fn(),
      loading: '',
      price: 29,
      list: ['test'],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PlanCard {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have text content', () => {
    const { baseElement } = render(<PlanCard {...props} />)

    expect(baseElement).toHaveTextContent(new RegExp(props.title))
    expect(baseElement).toHaveTextContent(new RegExp(props.text))
    expect(baseElement).toHaveTextContent(new RegExp(`\\$${props.price}`))
    expect(baseElement).toHaveTextContent(new RegExp(props.list[0]))
  })

  it('should show Custom text for Enterprise plan', () => {
    props.name = PlanEnum.ENTERPRISE_2025
    props.price = 'custom'

    const { baseElement } = render(<PlanCard {...props} />)

    expect(baseElement).toHaveTextContent(/Custom/)
  })

  it('should show Free text for free plan (price = 0)', () => {
    props.price = 0

    const { baseElement } = render(<PlanCard {...props} />)

    expect(baseElement).toHaveTextContent(/Free/)
  })
})

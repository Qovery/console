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
})

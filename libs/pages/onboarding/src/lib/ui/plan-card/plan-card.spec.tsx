import { render } from '__tests__/utils/setup-jest'
import { OrganizationPlanType } from '@qovery/domains/organization'
import PlanCard, { PlanCardProps } from './plan-card'

describe('PlanCard', () => {
  let props: PlanCardProps

  beforeEach(() => {
    props = {
      name: OrganizationPlanType.FREE,
      selected: OrganizationPlanType.FREE,
      title: 'Free',
      text: 'Adapted for personnal project',
      onClick: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PlanCard {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

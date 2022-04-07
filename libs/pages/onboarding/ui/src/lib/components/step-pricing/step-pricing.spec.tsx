import { OrganizationPlanType } from '@console/domains/organization'
import { render } from '__tests__/utils/setup-jest'

import StepPricing from './step-pricing'
import { StepPricingProps } from './step-pricing'

describe('StepPricing', () => {
  let props: StepPricingProps

  beforeEach(() => {
    props = {
      selectPlan: OrganizationPlanType.BUSINESS,
      setSelectPlan: jest.fn(),
      plans: [
        {
          name: OrganizationPlanType.BUSINESS,
          title: 'some-title',
          text: 'bla bla',
          price: 49,
          listPrice: [{ number: '1', price: '100' }],
        },
      ],
      chooseDeploy: jest.fn(),
      currentValue: { [OrganizationPlanType.BUSINESS]: { disable: false, number: '1' } },
      currentDeploy: 100,
      onSubmit: jest.fn(),
      loading: false,
      onClickContact: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPricing {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

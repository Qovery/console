import { render } from '__tests__/utils/setup-jest'
import { PlanEnum } from 'qovery-typescript-axios'
import StepPricing, { type StepPricingProps } from './step-pricing'

describe('StepPricing', () => {
  let props: StepPricingProps

  beforeEach(() => {
    props = {
      plans: [
        {
          name: PlanEnum.ENTERPRISE,
          title: 'some-title',
          text: 'bla bla',
          price: 49,
          list: ['hello'],
        },
      ],
      onSubmit: jest.fn(),
      loading: '',
      onClickContact: jest.fn(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPricing {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

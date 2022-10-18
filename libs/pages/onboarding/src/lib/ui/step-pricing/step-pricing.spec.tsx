import { ResizeObserver } from '__tests__/utils/resize-observer'
import { render } from '__tests__/utils/setup-jest'
import { PlanEnum } from 'qovery-typescript-axios'
import StepPricing from './step-pricing'
import { StepPricingProps } from './step-pricing'

describe('StepPricing', () => {
  let props: StepPricingProps
  window.ResizeObserver = ResizeObserver

  beforeEach(() => {
    props = {
      selectPlan: PlanEnum.ENTERPRISE,
      setSelectPlan: jest.fn(),
      plans: [
        {
          name: PlanEnum.ENTERPRISE,
          title: 'some-title',
          text: 'bla bla',
          price: 49,
          listPrice: [{ number: '1', price: '100' }],
        },
      ],
      chooseDeploy: jest.fn(),
      currentValue: { [PlanEnum.ENTERPRISE]: { disable: false, number: '1' } },
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

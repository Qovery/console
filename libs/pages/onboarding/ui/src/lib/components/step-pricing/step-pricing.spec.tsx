import { render } from '__tests__/utils/setup-jest'

import StepPricing from './step-pricing'
import { StepPricingProps } from './step-pricing'

describe('StepPricing', () => {
  let props: StepPricingProps

  beforeEach(() => {
    props = {
      select: '',
      setSelect: jest.fn(),
      displayDeploy: false,
      plans: [
        {
          name: 'planName',
          title: 'some-title',
          text: 'bla bla',
          listPrice: [{ number: '1', price: '100' }],
          listDeploy: [{ label: 'some-label', value: 'some-value' }],
        },
      ],
      chooseDeploy: jest.fn(),
      currentValue: { planName: { disable: false, number: '1' } },
      defaultValue: { planName: { label: 'some-label', value: 'some-valuelistPrice' } },
      currentDeploy: { label: 'some-label', value: 'some-value' },
      deploys: [{ label: 'some-label', value: 'some-value' }],
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPricing {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

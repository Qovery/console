import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import { render } from '__tests__/utils/setup-jest'
import { type MutableRefObject } from 'react'
import StepPlans, { type StepPlansProps } from './step-plans'

describe('StepPlans', () => {
  let props: Partial<StepPlansProps>

  beforeEach(() => {
    props = {
      onSubmit: jest.fn(),
      selectedPlan: {
        title: 'User plan',
        price: 299,
      },
      onChangePlan: jest.fn(),
      authLogout: jest.fn(),
      cbInstance: null,
      cardRef: { current: null } as MutableRefObject<FieldContainer | null>,
      onCardReady: jest.fn(),
      isCardReady: false,
      isSubmitting: false,
    }
    render(<StepPlans {...(props as StepPlansProps)} />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPlans {...(props as StepPlansProps)} />)
    expect(baseElement).toBeTruthy()
  })
})

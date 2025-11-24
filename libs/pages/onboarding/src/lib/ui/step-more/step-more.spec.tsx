import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import { render } from '__tests__/utils/setup-jest'
import { type MutableRefObject } from 'react'
import StepMore, { type StepMoreProps } from './step-more'

describe('StepMore', () => {
  let props: Partial<StepMoreProps>

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
    render(<StepMore {...(props as StepMoreProps)} />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepMore {...(props as StepMoreProps)} />)
    expect(baseElement).toBeTruthy()
  })
})

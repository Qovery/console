import { render } from '__tests__/utils/setup-jest'
import { type CreditCardFormValues } from '@qovery/shared/console-shared'
import { FormProvider, useForm } from 'react-hook-form'
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
    }

    const Wrapper = () => {
      const methods = useForm<CreditCardFormValues>({
        defaultValues: {
          card_number: '',
          cvc: '',
          expiry: '',
        },
      })
      props.control = methods.control

      return (
        <FormProvider {...methods}>
          <StepMore {...(props as StepMoreProps)} />
        </FormProvider>
      )
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const TestComponent = () => {
      const methods = useForm<CreditCardFormValues>({
        defaultValues: {
          card_number: '',
          cvc: '',
          expiry: '',
        },
      })

      return (
        <FormProvider {...methods}>
          <StepMore {...(props as StepMoreProps)} control={methods.control} />
        </FormProvider>
      )
    }

    const { baseElement } = render(<TestComponent />)
    expect(baseElement).toBeTruthy()
  })
})

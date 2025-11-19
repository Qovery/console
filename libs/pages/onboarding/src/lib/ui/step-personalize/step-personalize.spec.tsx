import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import StepPersonalize, { type StepPersonalizeProps } from './step-personalize'

describe('StepPersonalize', () => {
  let props: Partial<StepPersonalizeProps>

  beforeEach(() => {
    props = {
      dataCloudProviders: [{ label: 'some-label', value: 'some-value', icon: <div>some-icon</div> }],
      dataQoveryUsage: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      authLogout: jest.fn(),
    }

    const Wrapper = () => {
      const methods = useForm<{
        first_name: string
        last_name: string
        user_email: string
        company_name?: string
        qovery_usage: string
        qovery_usage_other?: string
        infrastructure_hosting: string
      }>({ mode: 'all' })

      return (
        <FormProvider {...methods}>
          <StepPersonalize {...(props as StepPersonalizeProps)} />
        </FormProvider>
      )
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<StepPersonalize {...(props as StepPersonalizeProps)} />, {
        defaultValues: {
          first_name: '',
          last_name: '',
          user_email: '',
          company_name: '',
          qovery_usage: '',
          qovery_usage_other: '',
          infrastructure_hosting: '',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

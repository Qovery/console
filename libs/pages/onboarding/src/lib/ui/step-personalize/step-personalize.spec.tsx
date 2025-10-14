import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type TypeOfUseEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import StepPersonalize, { type StepPersonalizeProps } from './step-personalize'

describe('StepPersonalize', () => {
  let props: Partial<StepPersonalizeProps>

  beforeEach(() => {
    props = {
      dataTypes: [{ label: 'some-label', value: 'some-value' }],
      dataCloudProviders: [{ label: 'some-label', value: 'some-value', icon: <div>some-icon</div> }],
      onSubmit: jest.fn(),
      authLogout: jest.fn(),
    }

    const Wrapper = () => {
      const methods = useForm<{
        first_name: string
        last_name: string
        user_email: string
        type_of_use: TypeOfUseEnum
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
          type_of_use: undefined,
          infrastructure_hosting: '',
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

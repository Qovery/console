import { render } from '__tests__/utils/setup-jest'
import { type TypeOfUseEnum } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
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
      const { control } = useForm<{
        first_name: string
        last_name: string
        user_email: string
        type_of_use: TypeOfUseEnum
        infrastructure_hosting: string
      }>()

      props.control = control

      return <StepPersonalize {...(props as StepPersonalizeProps)} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPersonalize {...(props as StepPersonalizeProps)} />)
    expect(baseElement).toBeTruthy()
  })
})

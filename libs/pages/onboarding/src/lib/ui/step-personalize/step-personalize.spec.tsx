import { render } from '__tests__/utils/setup-jest'
import { fireEvent, screen } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import StepPersonalize, { StepPersonalizeProps } from './step-personalize'

describe('StepPersonalize', () => {
  let props: StepPersonalizeProps
  let Wrapper: React.FC

  beforeEach(() => {
    props = {
      dataTypes: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      authLogout: jest.fn(),
      control: null as any,
    }

    Wrapper = () => {
      const { control } = useForm<{
        first_name: string
        last_name: string
        user_email: string
        type_of_use: string
      }>()

      props.control = control

      return <StepPersonalize {...props} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepPersonalize {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

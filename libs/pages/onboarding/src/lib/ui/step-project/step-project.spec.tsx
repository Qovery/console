import { useForm } from 'react-hook-form'
import { render } from '__tests__/utils/setup-jest'

import StepProject, { StepProjectProps } from './step-project'

describe('StepProject', () => {
  let props: StepProjectProps
  let Wrapper: React.FC

  beforeEach(() => {
    props = {
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

      return <StepProject {...props} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepProject {...props} />)

    expect(baseElement).toBeTruthy()
  })
})

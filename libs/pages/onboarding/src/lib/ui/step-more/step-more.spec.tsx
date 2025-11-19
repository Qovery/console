import { render } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import StepMore, { type StepMoreProps } from './step-more'

describe('StepMore', () => {
  let props: Partial<StepMoreProps>

  beforeEach(() => {
    props = {
      onSubmit: jest.fn(),
    }

    const Wrapper = () => {
      const { control } = useForm<{
        user_questions?: string
      }>()

      props.control = control

      return <StepMore {...(props as StepMoreProps)} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepMore {...(props as StepMoreProps)} />)
    expect(baseElement).toBeTruthy()
  })
})

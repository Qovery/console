import { render } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import StepMore, { type StepMoreProps } from './step-more'

describe('StepMore', () => {
  let props: Partial<StepMoreProps>

  beforeEach(() => {
    props = {
      dataQuestions: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      displayQoveryUsageOther: false,
    }

    const Wrapper = () => {
      const { control } = useForm<{
        user_questions?: string
        qovery_usage: string
        qovery_usage_other?: string
        where_to_deploy?: string
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

import { useForm } from 'react-hook-form'
import { render } from '__tests__/utils/setup-jest'

import StepMore, { StepMoreProps } from './step-more'

describe('StepMore', () => {
  let props: StepMoreProps
  let Wrapper: React.FC

  beforeEach(() => {
    props = {
      dataQuestions: [{ label: 'some-label', value: 'some-value' }],
      onSubmit: jest.fn(),
      control: null as any,
      displayQoveryUsageOther: false,
    }

    Wrapper = () => {
      const { control } = useForm<{
        qovery_usage: string
        qovery_usage_other: string
        user_questions: string
      }>()

      props.control = control

      return <StepMore {...props} />
    }

    render(<Wrapper />)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<StepMore {...props} />)
    expect(baseElement).toBeTruthy()
  })
})

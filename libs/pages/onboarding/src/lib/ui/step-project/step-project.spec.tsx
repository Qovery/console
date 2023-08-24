import { render } from '__tests__/utils/setup-jest'
import { useForm } from 'react-hook-form'
import StepProject, { type StepProjectProps } from './step-project'

const Wrapper = (props: Omit<StepProjectProps, 'control'>) => {
  const { control } = useForm<{
    organization_name: string
    project_name: string
  }>()

  return <StepProject control={control} {...props} />
}

describe('StepProject', () => {
  it('should render successfully', () => {
    const authLogout = jest.fn()
    const onSubmit = jest.fn()
    const { baseElement } = render(<Wrapper authLogout={authLogout} onSubmit={onSubmit} />)

    expect(baseElement).toBeTruthy()
  })
})

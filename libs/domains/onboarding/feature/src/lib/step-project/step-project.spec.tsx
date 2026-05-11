import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepProject, { type StepProjectProps } from './step-project'

const Wrapper = (props: StepProjectProps) => {
  const methods = useForm<{
    organization_name: string
    project_name: string
  }>()

  return (
    <FormProvider {...methods}>
      <StepProject {...props} />
    </FormProvider>
  )
}

describe('StepProject', () => {
  it('should render successfully', () => {
    const onSubmit = jest.fn()
    const { baseElement } = renderWithProviders(<Wrapper onSubmit={onSubmit} />)

    expect(baseElement).toBeTruthy()
  })

  it('should hide the back button when no back handler is provided', () => {
    const onSubmit = jest.fn()
    renderWithProviders(<Wrapper onSubmit={onSubmit} onFirstStepBack={undefined} />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })
})

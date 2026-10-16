import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import StepProject, { type StepProjectProps } from './step-project'

const Wrapper = (props: StepProjectProps) => {
  const methods = useForm<{
    organization_name: string
    project_name: string
  }>({ mode: 'onChange', defaultValues: { organization_name: '', project_name: 'main' } })

  return (
    <FormProvider {...methods}>
      <StepProject {...props} />
    </FormProvider>
  )
}

describe('StepProject', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
  it('should render successfully', () => {
    const onSubmit = jest.fn()
    const { baseElement } = renderWithProviders(<Wrapper onSubmit={onSubmit} />)

    expect(baseElement).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Create your organization' })).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
  })

  it('should hide the back button when no back handler is provided', () => {
    const onSubmit = jest.fn()
    renderWithProviders(<Wrapper onSubmit={onSubmit} onFirstStepBack={undefined} />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })
  it('requires non-blank organization and project names', async () => {
    const { userEvent } = renderWithProviders(<Wrapper onSubmit={jest.fn()} />)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await waitFor(() => expect(continueButton).toBeEnabled())
    await userEvent.clear(screen.getByLabelText('Project name'))
    await userEvent.type(screen.getByLabelText('Project name'), '   ')
    await waitFor(() => expect(continueButton).toBeDisabled())
    await userEvent.clear(screen.getByLabelText('Project name'))
    await userEvent.type(screen.getByLabelText('Project name'), 'Production')
    await waitFor(() => expect(continueButton).toBeEnabled())
  })
})

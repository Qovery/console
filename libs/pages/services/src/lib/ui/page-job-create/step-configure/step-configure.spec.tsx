import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { StepConfigure, type StepConfigureProps } from './step-configure'

const props: StepConfigureProps = {
  jobType: ServiceTypeEnum.CRON_JOB,
  onSubmit: jest.fn(),
  onBack: jest.fn(),
}

const defaultValues: JobConfigureData = {
  max_duration: 0,
  port: 80,
  nb_restarts: 0,
}

describe('Configure', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<JobConfigureData>(<StepConfigure {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('for a cron job, with these defaultValues submit button should be enabled', async () => {
    renderWithProviders(
      wrapWithReactHookForm<JobConfigureData>(<StepConfigure {...props} jobType={ServiceTypeEnum.CRON_JOB} />, {
        defaultValues: {
          ...defaultValues,
          schedule: '0 0 * * *',
        },
      })
    )

    const submitButton = await screen.findByRole('button', { name: /Continue/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
  })

  it('for a lifecycle job, should have at least one of three event check to be valid', async () => {
    renderWithProviders(
      wrapWithReactHookForm<JobConfigureData>(<StepConfigure {...props} jobType={ServiceTypeEnum.LIFECYCLE_JOB} />, {
        defaultValues,
      })
    )

    const submitButton = await screen.findByRole('button', { name: /Continue/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    const checkbox = screen.getByLabelText('Deploy')

    checkbox.click()

    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
  })
})

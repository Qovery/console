import { act, getByLabelText, getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { JobConfigureData } from '@qovery/shared/interfaces'
import { StepConfigure, StepConfigureProps } from './step-configure'

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
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<StepConfigure {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('for a cron job, with these defaultValues submit button should be enabled', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<StepConfigure {...props} jobType={ServiceTypeEnum.CRON_JOB} />, {
        defaultValues: {
          ...defaultValues,
          schedule: '0 0 * * *',
        },
      })
    )

    const submitButton = getByTestId(baseElement, 'button-submit')

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('for a lifecycle job, should have at least one of three event check to be valid', async () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<StepConfigure {...props} jobType={ServiceTypeEnum.LIFECYCLE_JOB} />, {
        defaultValues,
      })
    )

    const submitButton = getByTestId(baseElement, 'button-submit')
    expect(submitButton).toBeDisabled()

    const checkbox = getByLabelText(baseElement, 'Start')

    await act(() => {
      checkbox.click()
    })

    expect(submitButton).not.toBeDisabled()
  })
})

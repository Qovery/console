import { act, fireEvent, getAllByTestId, getByLabelText, getByTestId, getByText, render } from '@testing-library/react'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { JobConfigureData } from '@qovery/shared/interfaces'
import JobConfigureSettings, { JobConfigureSettingsProps } from './job-configure-settings'

const props: JobConfigureSettingsProps = {
  jobType: 'CRON',
}

const defaultValues: JobConfigureData = {
  port: 80,
  cmd: ['test'],
  nb_restarts: 0,
  schedule: '0 0 * * *',
  cmd_arguments: "['test']",
  event: 'test',
  image_entry_point: 'test',
  max_duration: 0,
}

describe('JobConfigureSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<JobConfigureSettings {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  describe('job is a lifecycle', () => {
    props.jobType = 'LIFECYCLE'

    it('should render 3 enabled box and 3 inputs', () => {
      const { baseElement } = render(
        wrapWithReactHookForm<JobConfigureData>(<JobConfigureSettings jobType="LIFECYCLE" />, {
          defaultValues,
        })
      )

      expect(getAllByTestId(baseElement, 'input-text')).toHaveLength(3)
      expect(getAllByTestId(baseElement, 'enabled-box')).toHaveLength(3)
      expect(baseElement).toBeTruthy()
    })
  })

  describe('job is a cron', () => {
    props.jobType = 'CRON'

    it('should render 5 input and 1 textarea', async () => {
      const { baseElement } = render(
        wrapWithReactHookForm<JobConfigureData>(<JobConfigureSettings jobType="CRON" />, {
          defaultValues,
        })
      )

      expect(getAllByTestId(baseElement, 'input-text')).toHaveLength(4)
      getByTestId(baseElement, 'input-text-image-entry-point')
      getByTestId(baseElement, 'input-textarea-cmd-arguments')

      expect(baseElement).toBeTruthy()
    })

    it('should display the cron value in a human readable way', async () => {
      const { baseElement } = render(
        wrapWithReactHookForm<JobConfigureData>(<JobConfigureSettings jobType="CRON" />, {
          defaultValues,
        })
      )
      const inputSchedule = getByLabelText(baseElement, 'Schedule - Cron expression')

      await act(async () => {
        fireEvent.change(inputSchedule, { target: { value: '9 * * * *' } })
      })

      getByText(baseElement, 'At 9 minutes past the hour')

      expect(baseElement).toBeTruthy()
    })
  })
})

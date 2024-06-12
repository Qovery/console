import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobConfigureData, type JobGeneralData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import JobConfigureSettings, { type JobConfigureSettingsProps } from './job-configure-settings'

const props: JobConfigureSettingsProps = {
  jobType: ServiceTypeEnum.CRON_JOB,
}

const defaultValues: JobConfigureData & Pick<JobGeneralData, 'image_entry_point' | 'cmd_arguments' | 'cmd'> = {
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
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<JobConfigureSettings {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  describe('job is a lifecycle', () => {
    props.jobType = ServiceTypeEnum.LIFECYCLE_JOB

    it('should render 3 enabled box and 3 inputs', () => {
      renderWithProviders(
        wrapWithReactHookForm(<JobConfigureSettings jobType={ServiceTypeEnum.LIFECYCLE_JOB} />, {
          defaultValues,
        })
      )

      expect(screen.getAllByTestId('input-text')).toHaveLength(3)
      expect(screen.getAllByTestId('enabled-box')).toHaveLength(3)
    })
  })

  describe('job is a cron', () => {
    props.jobType = ServiceTypeEnum.CRON_JOB

    it('should render 4 inputs and 1 select', async () => {
      renderWithProviders(
        wrapWithReactHookForm(<JobConfigureSettings jobType={ServiceTypeEnum.CRON_JOB} />, {
          defaultValues,
        })
      )

      expect(screen.getAllByTestId('input-text')).toHaveLength(4)
      expect(screen.getByText('Timezone')).toBeInTheDocument()
    })

    it('should display the cron value in a human readable way', async () => {
      const { userEvent } = renderWithProviders(
        wrapWithReactHookForm(<JobConfigureSettings jobType={ServiceTypeEnum.CRON_JOB} />, {
          defaultValues,
        })
      )
      const inputSchedule = screen.getByLabelText('Schedule - Cron expression')

      userEvent.clear(inputSchedule)
      await userEvent.type(inputSchedule, '9 * * * *')

      screen.getByText('At 9 minutes past the hour (Etc/UTC)')
    })
  })
})

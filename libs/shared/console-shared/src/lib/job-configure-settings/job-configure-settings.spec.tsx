import { render } from '@testing-library/react'
import { JobConfigureData } from '@qovery/shared/interfaces'
import { wrapWithReactHookForm } from '../../../../../../__tests__/utils/wrap-with-react-hook-form'
import JobConfigureSettings, { JobConfigureSettingsProps } from './job-configure-settings'

const props: JobConfigureSettingsProps = {
  jobType: 'cron',
}

describe('JobConfigureSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<JobConfigureSettings {...props} />, {
        defaultValues: {
          port: 80,
          cmd: ['test'],
          nb_restarts: 0,
          schedule: '0 0 * * *',
          cmd_arguments: "['test']",
          event: 'test',
          image_entry_point: 'test',
          max_duration: 0,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

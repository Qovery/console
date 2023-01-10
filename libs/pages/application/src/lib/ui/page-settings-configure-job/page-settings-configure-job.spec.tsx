import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { cronjobFactoryMock } from '@qovery/shared/factories'
import { JobConfigureData } from '@qovery/shared/interfaces'
import PageSettingsConfigureJob, { PageSettingsConfigureJobProps } from './page-settings-configure-job'

const props: PageSettingsConfigureJobProps = {
  application: cronjobFactoryMock(1)[0],
  loading: false,
  onSubmit: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<PageSettingsConfigureJob {...props} />, {
        defaultValues: {
          max_duration: 1,
          nb_restarts: 1,
          port: 3000,
          schedule: '0 0 * * *',
          cmd_arguments: '',
          cmd: [''],
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

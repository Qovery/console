import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type Job } from '@qovery/domains/services/data-access'
import { cronjobFactoryMock } from '@qovery/shared/factories'
import { type JobConfigureData, type JobGeneralData } from '@qovery/shared/interfaces'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsConfigureJob, { type PageSettingsConfigureJobProps } from './page-settings-configure-job'

const props: PageSettingsConfigureJobProps = {
  service: cronjobFactoryMock(1)[0] as Job,
  loading: false,
  onSubmit: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<JobConfigureData & Pick<JobGeneralData, 'image_entry_point' | 'cmd_arguments' | 'cmd'>>(
        <PageSettingsConfigureJob {...props} />,
        {
          defaultValues: {
            max_duration: 1,
            nb_restarts: 1,
            port: 3000,
            schedule: '0 0 * * *',
            cmd_arguments: '',
            cmd: [''],
          },
        }
      )
    )
    expect(baseElement).toBeTruthy()
  })
})

import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { cronjobFactoryMock } from '@qovery/domains/application'
import { JobConfigureData } from '@qovery/shared/interfaces'
import PageSettingsConfigure, { PageSettingsConfigureProps } from './page-settings-configure'

const props: PageSettingsConfigureProps = {
  application: cronjobFactoryMock(1)[0],
  loading: false,
  onSubmit: jest.fn(),
}

describe('PageSettingsDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobConfigureData>(<PageSettingsConfigure {...props} />, {
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

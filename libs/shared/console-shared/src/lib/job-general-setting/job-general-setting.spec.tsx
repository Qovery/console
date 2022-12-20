import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { JobGeneralData } from '@qovery/shared/interfaces'
import JobGeneralSetting from './job-general-setting'

describe('JobGeneralSetting', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobGeneralData>(<JobGeneralSetting jobType="cron" />, {
        defaultValues: {
          branch: 'main',
          name: 'test',
          description: 'test',
          build_mode: BuildModeEnum.DOCKER,
          dockerfile_path: 'Dockerfile',
          root_path: '/',
          image_entry_point: 'test',
          repository: 'test',
          provider: GitProviderEnum.GITHUB,
          serviceType: ServiceTypeEnum.APPLICATION,
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })
})

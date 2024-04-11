import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { type JobGeneralData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import JobGeneralSettings from './job-general-settings'

describe('JobGeneralSettings', () => {
  let defaultValues: JobGeneralData

  beforeEach(() => {
    defaultValues = {
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
      auto_deploy: true,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<JobGeneralData>(<JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render git related fields if service type is git', async () => {
    defaultValues.serviceType = ServiceTypeEnum.APPLICATION
    renderWithProviders(
      wrapWithReactHookForm<JobGeneralData>(
        <JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} isEdition={true} />,
        {
          defaultValues,
        }
      )
    )

    screen.getByTestId('git-fields')
  })

  it('should render container related fields if service type is git', async () => {
    defaultValues.serviceType = ServiceTypeEnum.CONTAINER
    renderWithProviders(
      wrapWithReactHookForm<JobGeneralData>(
        <JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} isEdition={true} />,
        {
          defaultValues,
        }
      )
    )

    screen.getByTestId('container-fields')
  })
})

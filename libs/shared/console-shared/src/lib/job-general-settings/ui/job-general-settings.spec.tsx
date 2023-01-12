import { getAllByTestId, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { cronjobFactoryMock } from '@qovery/shared/factories'
import { JobGeneralData } from '@qovery/shared/interfaces'
import JobGeneralSettings from './job-general-settings'

const mockJobApplication = cronjobFactoryMock(1)[0]
jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    editApplication: jest.fn(),
    getApplicationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockJobApplication.id],
      entities: {
        [mockJobApplication.id]: mockJobApplication,
      },
      error: null,
    }),
    selectApplicationById: () => mockJobApplication,
  }
})

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
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobGeneralData>(<JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render 2 content block if edit mode', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<JobGeneralData>(
        <JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} isEdition={true} />,
        {
          defaultValues,
        }
      )
    )

    expect(getAllByTestId(baseElement, 'block-content')).toHaveLength(2)
  })

  it('should render git related fields if service type is git', () => {
    defaultValues.serviceType = ServiceTypeEnum.APPLICATION
    const { baseElement } = render(
      wrapWithReactHookForm<JobGeneralData>(
        <JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} isEdition={true} />,
        {
          defaultValues,
        }
      )
    )

    getByTestId(baseElement, 'git-fields')
  })

  it('should render container related fields if service type is git', () => {
    defaultValues.serviceType = ServiceTypeEnum.CONTAINER
    const { baseElement } = render(
      wrapWithReactHookForm<JobGeneralData>(
        <JobGeneralSettings jobType={ServiceTypeEnum.CRON_JOB} isEdition={true} />,
        {
          defaultValues,
        }
      )
    )

    getByTestId(baseElement, 'container-fields')
  })
})

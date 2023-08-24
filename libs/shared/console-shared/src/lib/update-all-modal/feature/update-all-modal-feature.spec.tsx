import { act, getAllByTestId, getByTestId, render } from '__tests__/utils/setup-jest'
import { type Commit } from 'qovery-typescript-axios'
import * as environmentDomains from '@qovery/domains/environment'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import UpdateAllModalFeature, { type UpdateAllModalFeatureProps } from './update-all-modal-feature'

const useActionDeployAllEnvironmentSpy = jest.spyOn(environmentDomains, 'useActionDeployAllEnvironment') as jest.Mock

const mockApplications = applicationFactoryMock(3).map((app) => {
  return {
    ...app,
    git_repository: {
      ...app.git_repository,
      url: '',
      deployed_commit_contributor: '',
      deployed_commit_date: '',
      deployed_commit_id: 'commit0',
      deployed_commit_tag: '',
    },
    commits: {
      loadingStatus: 'loaded',
      items: [
        { git_commit_id: 'commit1' } as Commit,
        { git_commit_id: 'commit2' } as Commit,
        { git_commit_id: 'commit3' } as Commit,
      ],
    },
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    editApplication: jest.fn(),
    getApplicationsState: () => ({
      loadingStatus: 'loaded',
      ids: mockApplications.map((app) => app.id),
      entities: mockApplications.reduce((acc, app) => {
        acc[app.id] = app as ApplicationEntity
        return acc
      }, {} as Record<string, ApplicationEntity>),
      error: null,
    }),
    applicationsLoadingStatus: () => 'loaded',
    fetchApplications: () => mockApplications,
    selectApplicationsEntitiesByEnvId: () => mockApplications,
  }
})

describe('UpdateAllModalFeature', () => {
  const props: UpdateAllModalFeatureProps = {
    environmentId: 'env1',
    projectId: 'project1',
  }

  beforeEach(() => {
    useActionDeployAllEnvironmentSpy.mockReturnValue({ mutate: jest.fn() })
  })

  it('should render successfully', () => {
    const { baseElement } = render(<UpdateAllModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should postEnvironmentServicesUpdate have been called on submit with good payload', async () => {
    const { baseElement } = render(<UpdateAllModalFeature {...props} />)

    const deselectAll = getByTestId(baseElement, 'deselect-all')

    await act(() => {
      deselectAll.click()
    })

    const firstRow = getAllByTestId(baseElement, 'outdated-service-row')[0]

    await act(() => {
      firstRow.click()
    })

    const submitButton = getByTestId(baseElement, 'submit-button')

    await act(() => {
      submitButton.click()
    })

    expect(useActionDeployAllEnvironmentSpy().mutate).toHaveBeenCalledWith({
      applications: [
        {
          application_id: mockApplications[0].id,
          git_commit_id: mockApplications[0].commits.items[0].git_commit_id,
        },
      ],
      jobs: [],
    })
  })
})

import { type Commit } from 'qovery-typescript-axios'
import * as environmentDomains from '@qovery/domains/environment'
import { type OutdatedService } from '@qovery/domains/services/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import UpdateAllModalFeature, { type UpdateAllModalFeatureProps } from './update-all-modal-feature'

const useActionDeployAllEnvironmentSpy = jest.spyOn(environmentDomains, 'useActionDeployAllEnvironment') as jest.Mock

const mockApplications = applicationFactoryMock(3).map((app): OutdatedService => {
  return {
    ...app,
    environment: {
      id: '1',
    },
    healthchecks: {},
    git_repository: {
      ...app.git_repository,
      url: '',
      deployed_commit_contributor: '',
      deployed_commit_date: '',
      deployed_commit_id: 'commit0',
      deployed_commit_tag: '',
    },
    serviceType: ServiceTypeEnum.APPLICATION,
    commits: [
      { git_commit_id: 'commit1' } as Commit,
      { git_commit_id: 'commit2' } as Commit,
      { git_commit_id: 'commit3' } as Commit,
    ],
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useOutdatedServices: () => ({
    data: mockApplications,
    isLoading: false,
    error: {},
  }),
}))

describe('UpdateAllModalFeature', () => {
  const props: UpdateAllModalFeatureProps = {
    organizationId: 'org1',
    environmentId: 'env1',
    projectId: 'project1',
  }

  beforeEach(() => {
    useActionDeployAllEnvironmentSpy.mockReturnValue({ mutate: jest.fn() })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<UpdateAllModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should postEnvironmentServicesUpdate have been called on submit with good payload', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModalFeature {...props} />)

    const deselectAll = screen.getByTestId('deselect-all')

    await userEvent.click(deselectAll)

    const firstRow = screen.getAllByTestId('outdated-service-row')[0]

    await userEvent.click(firstRow)

    const submitButton = screen.getByTestId('submit-button')

    await userEvent.click(submitButton)

    expect(useActionDeployAllEnvironmentSpy().mutate).toHaveBeenCalledWith({
      applications: [
        {
          application_id: mockApplications[0].id,
          git_commit_id: mockApplications[0].commits[0].git_commit_id,
        },
      ],
      jobs: [],
    })
  })
})

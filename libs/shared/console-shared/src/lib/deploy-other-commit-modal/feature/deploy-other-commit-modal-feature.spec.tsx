import * as storeApplication from '@qovery/domains/application'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DeployOtherCommitModalFeature, {
  type DeployOtherCommitModalFeatureProps,
} from './deploy-other-commit-modal-feature'

import SpyInstance = jest.SpyInstance

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () =>
    jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    ),
  useSelector: (a: () => void) => {
    return a()
  },
}))

const mockApplication = applicationFactoryMock(1)[0]

jest.mock('@qovery/domains/services/feature', () => ({
  useServiceType: () => ({
    data: 'APPLICATION',
    isLoading: false,
    error: {},
  }),
  useCommits: () => ({
    data: [
      {
        message: 'blabla',
        commit_page_url: '#',
        tag: 'v1',
        git_commit_id: '1',
        created_at: '2021-09-01',
        author_name: 'John Doe',
      },
      {
        message: 'bloblo',
        commit_page_url: '#',
        tag: 'v1',
        git_commit_id: '2',
        created_at: '2021-09-01',
        author_name: 'John Doe',
      },
      {
        message: 'blabla pouic pouic search',
        commit_page_url: '#',
        tag: 'v1',
        git_commit_id: '3',
        created_at: '2021-09-02',
        author_name: 'John Doe',
      },
    ],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('@qovery/domains/application', () => ({
  ...jest.requireActual('@qovery/domains/application'),
  selectApplicationById: () => mockApplication,
  postApplicationActionsDeployByCommitId: jest.fn(),
}))

const props: DeployOtherCommitModalFeatureProps = {
  applicationId: 'applicationId',
  environmentId: 'environmentId',
  organizationId: 'organizationId',
  projectId: 'projectId',
}

describe('DeployOtherCommitModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<DeployOtherCommitModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch deploy action with correct parameters', async () => {
    const deploySpy: SpyInstance = jest.spyOn(storeApplication, 'postApplicationActionsDeployByCommitId')
    deploySpy.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { userEvent } = renderWithProviders(<DeployOtherCommitModalFeature {...props} />)

    const commitBoxes = screen.getAllByTestId('commit-box')

    await userEvent.click(commitBoxes[1])

    // click on submit button
    const submitButton = screen.getByTestId('submit-button')
    await userEvent.click(submitButton)

    expect(deploySpy).toHaveBeenCalledWith({
      applicationId: 'applicationId',
      git_commit_id: '2',
      environmentId: 'environmentId',
      serviceType: ServiceTypeEnum.APPLICATION,
      callback: expect.any(Function),
    })
  })

  it('should filter by search', async () => {
    const { userEvent } = renderWithProviders(<DeployOtherCommitModalFeature {...props} />)
    const searchInput = screen.getByTestId('input-search')

    await userEvent.type(searchInput, 'pouic')

    const commitBoxes = screen.getAllByTestId('commit-box')
    expect(commitBoxes.length).toEqual(1)
  })

  it('should filter by search and display no result', async () => {
    const { userEvent } = renderWithProviders(<DeployOtherCommitModalFeature {...props} />)
    const searchInput = screen.getByTestId('input-search')

    await userEvent.type(searchInput, 'asdfasdf asdf asd ')

    const commitBoxes = screen.queryAllByTestId('commit-box')
    expect(commitBoxes.length).toEqual(0)
    screen.getByText('No result for this search')
  })
})

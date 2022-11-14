import { getAllByTestId, getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeApplication from '@qovery/domains/application'
import DeployOtherCommitModalFeature, { DeployOtherCommitModalFeatureProps } from './deploy-other-commit-modal-feature'

import SpyInstance = jest.SpyInstance

const props: DeployOtherCommitModalFeatureProps = {
  applicationId: 'applicationId',
  environmentId: 'environmentId',
}

jest.mock('react-redux', () => ({
  ...(jest.requireActual('react-redux') as any),
  useDispatch: () =>
    jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    ),
  useSelector: (a: any) => {
    return a()
  },
}))

const mockApplication = storeApplication.applicationFactoryMock(0)[0]

jest.mock('@qovery/domains/application', () => ({
  ...(jest.requireActual('@qovery/domains/application') as any),
  fetchApplicationCommits: () => jest.fn(),
  getCommitsGroupedByDate: () => ({
    '2021-09-01': [
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
    ],
    '2021-09-02': [
      {
        message: 'blabla',
        commit_page_url: '#',
        tag: 'v1',
        git_commit_id: '3',
        created_at: '2021-09-02',
        author_name: 'John Doe',
      },
    ],
  }),
  selectApplicationById: () => mockApplication,
  postApplicationActionsDeployByCommitId: jest.fn(),
}))

describe('DeployOtherCommitModalFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<DeployOtherCommitModalFeature {...props} />)
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

    const { baseElement } = render(<DeployOtherCommitModalFeature {...props} />)
    const commitBoxes = getAllByTestId(baseElement, 'commit-box')

    commitBoxes[1].click()
    await waitFor(() => {})

    // click on submit button
    const submitButton = getByTestId(baseElement, 'submit-button')
    submitButton.click()

    expect(deploySpy).toHaveBeenCalledWith({
      applicationId: 'applicationId',
      git_commit_id: '2',
      environmentId: 'environmentId',
    })
  })
})

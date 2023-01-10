import {
  act,
  fireEvent,
  getAllByTestId,
  getByTestId,
  getByText,
  queryAllByTestId,
  waitFor,
} from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as storeApplication from '@qovery/domains/application'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import DeployOtherCommitModalFeature, { DeployOtherCommitModalFeatureProps } from './deploy-other-commit-modal-feature'

import SpyInstance = jest.SpyInstance

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

const mockApplication = applicationFactoryMock(1)[0]

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
        message: 'blabla pouic pouic search',
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

const props: DeployOtherCommitModalFeatureProps = {
  applicationId: 'applicationId',
  environmentId: 'environmentId',
}

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

    await waitFor(jest.fn())
    const commitBoxes = getAllByTestId(baseElement, 'commit-box')

    commitBoxes[1].click()
    await waitFor(jest.fn())

    // click on submit button
    const submitButton = getByTestId(baseElement, 'submit-button')
    submitButton.click()

    expect(deploySpy).toHaveBeenCalledWith({
      applicationId: 'applicationId',
      git_commit_id: '2',
      environmentId: 'environmentId',
      serviceType: ServiceTypeEnum.APPLICATION,
    })
  })

  it('should filter by search', async () => {
    const { baseElement } = render(<DeployOtherCommitModalFeature {...props} />)
    const searchInput = getByTestId(baseElement, 'input-search')

    await act(() => {
      fireEvent.change(searchInput, { target: { value: 'pouic' } })
    })

    const commitBoxes = getAllByTestId(baseElement, 'commit-box')
    expect(commitBoxes.length).toEqual(1)
  })

  it('should filter by search and display no result', async () => {
    const { baseElement } = render(<DeployOtherCommitModalFeature {...props} />)
    const searchInput = getByTestId(baseElement, 'input-search')

    await act(() => {
      fireEvent.change(searchInput, { target: { value: 'asdfasdf asdf asd ' } })
    })

    const commitBoxes = queryAllByTestId(baseElement, 'commit-box')
    expect(commitBoxes.length).toEqual(0)
    getByText(baseElement, 'No result for this search')
  })
})

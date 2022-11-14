import { getAllByTestId, getByTestId, getByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import DeployOtherCommitModal, { DeployOtherCommitModalProps } from './deploy-other-commit-modal'

const props: DeployOtherCommitModalProps = {
  currentCommitId: '1',
  setSelectedCommitId: jest.fn(),
  selectedCommitId: '2',
  isLoading: false,
  handleDeploy: jest.fn(),
  commitsByDay: {
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
  },
}

describe('DeployOtherCommitModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 2 dates and 3 commit boxes', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} />)

    const dates = getAllByTestId(baseElement, 'commit-date')
    expect(dates.length).toBe(2)

    const commitBoxes = getAllByTestId(baseElement, 'commit-box')
    expect(commitBoxes.length).toBe(3)
  })

  it('should should display loading spinner', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} isLoading={true} />)

    getByTestId(baseElement, 'spinner')
  })

  it('should call setSelectedCommitId on Click on box', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} />)

    const commitBoxes = getAllByTestId(baseElement, 'commit-box')
    commitBoxes[0].click()
    expect(props.setSelectedCommitId).toHaveBeenCalledWith('1')
  })

  it('should display selected version', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} />)

    const commitBoxes = getAllByTestId(baseElement, 'commit-box')
    getByText(commitBoxes[1], 'Selected version')
  })

  it('should display current version', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} />)

    const commitBoxes = getAllByTestId(baseElement, 'commit-box')
    getByText(commitBoxes[0], 'Current version')
  })

  it('should call handleDeploy on click', () => {
    const { baseElement } = render(<DeployOtherCommitModal {...props} />)

    const button = getByTestId(baseElement, 'submit-button')
    button.click()

    expect(props.handleDeploy).toHaveBeenCalled()
  })
})

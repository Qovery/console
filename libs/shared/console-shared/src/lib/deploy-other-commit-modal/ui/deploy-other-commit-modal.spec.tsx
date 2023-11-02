import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import DeployOtherCommitModal, { type DeployOtherCommitModalProps } from './deploy-other-commit-modal'

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
    const { baseElement } = renderWithProviders(<DeployOtherCommitModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render 2 dates and 3 commit boxes', () => {
    renderWithProviders(<DeployOtherCommitModal {...props} />)

    const dates = screen.getAllByTestId('commit-date')
    expect(dates.length).toBe(2)

    const commitBoxes = screen.getAllByTestId('commit-box')
    expect(commitBoxes.length).toBe(3)
  })

  it('should should display loading spinner', () => {
    renderWithProviders(<DeployOtherCommitModal {...props} isLoading={true} />)

    screen.getByTestId('spinner')
  })

  it('should call setSelectedCommitId on Click on box', () => {
    renderWithProviders(<DeployOtherCommitModal {...props} />)

    const commitBoxes = screen.getAllByTestId('commit-box')
    commitBoxes[0].click()
    expect(props.setSelectedCommitId).toHaveBeenCalledWith('1')
  })

  it('should display selected version', () => {
    renderWithProviders(<DeployOtherCommitModal {...props} />)

    const commitBoxes = screen.getAllByTestId('commit-box')
    within(commitBoxes[1]).getByText('Selected version')
  })

  it('should display current version', () => {
    renderWithProviders(<DeployOtherCommitModal {...props} />)

    const commitBoxes = screen.getAllByTestId('commit-box')
    within(commitBoxes[0]).getByText('Current version')
  })

  it('should call handleDeploy on click', async () => {
    const { userEvent } = renderWithProviders(<DeployOtherCommitModal {...props} />)

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)

    expect(props.handleDeploy).toHaveBeenCalled()
  })
})

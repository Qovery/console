import { act, getAllByTestId, getByTestId, render } from '__tests__/utils/setup-jest'
import { Commit } from 'qovery-typescript-axios'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import UpdateAllModal, { UpdateAllModalProps } from './update-all-modal'

const defaultProps: UpdateAllModalProps = {
  listLoading: false,
  submitDisabled: false,
  closeModal: jest.fn(),
  submitLoading: false,
  getNameForCommit: jest.fn(),
  applications: applicationFactoryMock(3).map((app) => {
    return {
      ...app,
      commits: {
        loadingStatus: 'loaded',
        items: [
          { git_commit_id: 'commit1' } as Commit,
          { git_commit_id: 'commit2' } as Commit,
          { git_commit_id: 'commit3' } as Commit,
        ],
      },
    }
  }),
  unselectAll: jest.fn(),
  selectAll: jest.fn(),
  onSubmit: jest.fn(),
  environment: environmentFactoryMock(1)[0],
  checkService: jest.fn(),
  selectedServiceIds: [],
  getAvatarForCommit: jest.fn(),
}

describe('UpdateAllModal', () => {
  let props: UpdateAllModalProps

  beforeEach(() => {
    props = { ...defaultProps }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<UpdateAllModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display loading spinner in list', () => {
    props.listLoading = true
    const { baseElement } = render(<UpdateAllModal {...props} />)
    getByTestId(baseElement, 'spinner')
  })

  it('should display 3 rows', () => {
    const { baseElement } = render(<UpdateAllModal {...props} />)
    expect(getAllByTestId(baseElement, 'outdated-service-row')).toHaveLength(3)
  })

  it('should have 1 row checked', () => {
    if (props.applications) props.selectedServiceIds = [props.applications[0].id]
    const { baseElement } = render(<UpdateAllModal {...props} />)

    const firstRow = getAllByTestId(baseElement, 'outdated-service-row')[0]
    expect(firstRow).toHaveClass('bg-brand-50', 'border-brand-500')
  })

  it('should color border top if previous row is checked', () => {
    if (props.applications) props.selectedServiceIds = [props.applications[0].id]
    const { baseElement } = render(<UpdateAllModal {...props} />)

    const secondRow = getAllByTestId(baseElement, 'outdated-service-row')[1]
    expect(secondRow).toHaveClass('border-t-brand-500')
  })

  it('should check a row if click on the row', async () => {
    if (props.applications) {
      props.selectedServiceIds = [props.applications[0].id]
      const { baseElement } = render(<UpdateAllModal {...props} />)

      const firstRow = getAllByTestId(baseElement, 'outdated-service-row')[0]

      await act(() => {
        firstRow.click()
      })

      expect(props.checkService).toHaveBeenCalledWith(props.applications[0].id)
    }
  })

  it('should not check a row if click is on commit tag', async () => {
    if (props.applications) {
      props.selectedServiceIds = [props.applications[0].id]
      const { baseElement } = render(<UpdateAllModal {...props} />)

      const firstRow = getAllByTestId(baseElement, 'outdated-service-row')[0]
      const commitTag = getAllByTestId(firstRow, 'tag-commit')[0]

      await act(() => {
        commitTag.click()
      })

      expect(props.checkService).not.toHaveBeenCalled()
    }
  })

  it('should call select all on click on the button', async () => {
    let { baseElement } = render(<UpdateAllModal {...props} />)

    const selectAll = getByTestId(baseElement, 'select-all')

    await act(() => {
      selectAll.click()
    })
    expect(props.selectAll).toHaveBeenCalled()

    props.selectedServiceIds = props.applications?.map((app) => app.id) || []
    baseElement = render(<UpdateAllModal {...props} />).baseElement

    const deselectAll = getByTestId(baseElement, 'deselect-all')
    await act(() => {
      deselectAll.click()
    })
    expect(props.unselectAll).toHaveBeenCalled()
  })

  it('should call submit all on click on the button', async () => {
    if (props.applications) {
      props.selectedServiceIds = [props.applications[0].id]
      const { baseElement } = render(<UpdateAllModal {...props} />)

      const submitButton = getByTestId(baseElement, 'submit-button')

      await act(() => {
        submitButton.click()
      })

      expect(submitButton).toHaveTextContent('Update 1 service')
      expect(props.onSubmit).toHaveBeenCalled()
    }
  })

  it('should disabled submit button if no selected', async () => {
    const { baseElement } = render(<UpdateAllModal {...props} />)

    const submitButton = getByTestId(baseElement, 'submit-button')
    expect(submitButton).toHaveTextContent('Update 0 service')
    expect(submitButton).toBeDisabled()
  })

  it('should display empty state', async () => {
    props.applications = []
    props.listLoading = false

    const { baseElement } = render(<UpdateAllModal {...props} />)

    getByTestId(baseElement, 'empty-state')
  })

  it('should reduce opacity of commit blocks', () => {
    if (props.applications) props.selectedServiceIds = [props.applications[0].id]
    const { baseElement } = render(<UpdateAllModal {...props} />)

    const rows = getAllByTestId(baseElement, 'outdated-service-row')

    // for checked row
    let currentCommitBlock = getByTestId(rows[0], 'current-commit-block')
    expect(currentCommitBlock).toHaveClass('opacity-50')
    let lastCommitBlock = getByTestId(rows[0], 'last-commit-block')
    expect(lastCommitBlock).not.toHaveClass('opacity-50')

    // for unchecked row
    currentCommitBlock = getByTestId(rows[1], 'current-commit-block')
    expect(currentCommitBlock).not.toHaveClass('opacity-50')
    lastCommitBlock = getByTestId(rows[1], 'last-commit-block')
    expect(lastCommitBlock).toHaveClass('opacity-50')
  })
})

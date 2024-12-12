import { type Commit, ServiceTypeEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useDeployAllServices } from '../hooks/use-deploy-all-services/use-deploy-all-services'
import { type OutdatedService } from '../hooks/use-outdated-services/use-outdated-services'
import { UpdateAllModal, type UpdateAllModalProps } from './update-all-modal'

const [mockEnvironment1, mockEnvironment2] = environmentFactoryMock(2).map((env, index) => ({
  ...env,
  id: `env${index + 1}`,
}))

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

jest.mock('../hooks/use-outdated-services/use-outdated-services', () => ({
  useOutdatedServices: ({ environmentId }: { environmentId: string }) => ({
    data: environmentId === 'env1' ? mockApplications : [],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('../hooks/use-deploy-all-services/use-deploy-all-services', () => {
  const mutate = jest.fn()
  return {
    ...jest.requireActual('../hooks/use-deploy-all-services/use-deploy-all-services'),
    useDeployAllServices: () => ({
      mutate,
      isLoading: false,
      error: {},
    }),
  }
})

describe('UpdateAllModal', () => {
  const props: UpdateAllModalProps = {
    environment: mockEnvironment1,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should useDeployAllServices have been called on submit with good payload', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)

    const deselectAll = screen.getByTestId('deselect-all')

    await userEvent.click(deselectAll)

    const firstRow = screen.getAllByTestId('outdated-service-row')[0]

    await userEvent.click(firstRow)

    const submitButton = screen.getByTestId('submit-button')

    await userEvent.click(submitButton)

    expect(useDeployAllServices().mutate).toHaveBeenCalledWith({
      environment: mockEnvironment1,
      payload: {
        applications: [
          {
            application_id: mockApplications[0].id,
            git_commit_id: mockApplications[0].commits[0].git_commit_id,
          },
        ],
        jobs: [],
      },
    })
  })

  it('should useDeployAllServices have been called on submit with selectAll', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)

    const deselectAll = screen.getByTestId('deselect-all')

    await userEvent.click(deselectAll)

    await userEvent.click(screen.getByTestId('select-all'))

    const submitButton = screen.getByTestId('submit-button')

    await userEvent.click(submitButton)

    expect(useDeployAllServices().mutate).toHaveBeenCalledWith({
      environment: mockEnvironment1,
      payload: {
        applications: [
          {
            application_id: mockApplications[0].id,
            git_commit_id: mockApplications[0].commits[0].git_commit_id,
          },
          {
            application_id: mockApplications[1].id,
            git_commit_id: mockApplications[1].commits[0].git_commit_id,
          },
          {
            application_id: mockApplications[2].id,
            git_commit_id: mockApplications[2].commits[0].git_commit_id,
          },
        ],
        jobs: [],
      },
    })
  })

  it('should display 3 rows', () => {
    renderWithProviders(<UpdateAllModal {...props} />)
    expect(screen.getAllByTestId('outdated-service-row')).toHaveLength(3)
  })

  it('should have 1 row checked and next sibling color border top', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)

    await userEvent.click(screen.getByTestId('deselect-all'))

    const rows = screen.getAllByTestId('outdated-service-row')
    const firstRow = rows[0]
    await userEvent.click(firstRow)

    expect(firstRow).toHaveClass('bg-brand-50', 'border-brand-500')

    const secondRow = rows[1]
    expect(secondRow).toHaveClass('border-t-brand-500')

    const submitButton = screen.getByTestId('submit-button')

    expect(submitButton).toHaveTextContent('Update 1 service')
  })

  it('should disabled submit button if no selected', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)

    await userEvent.click(screen.getByTestId('deselect-all'))

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toHaveTextContent('Update 0 service')
    expect(submitButton).toBeDisabled()
  })

  it('should display empty state', async () => {
    renderWithProviders(<UpdateAllModal {...props} environment={mockEnvironment2} />)

    screen.getByTestId('empty-state')
  })

  it('should reduce opacity of commit blocks', async () => {
    const { baseElement, userEvent } = renderWithProviders(<UpdateAllModal {...props} />)

    await userEvent.click(screen.getByTestId('deselect-all'))

    const rows = screen.getAllByTestId('outdated-service-row')
    const firstRow = rows[0]
    await userEvent.click(firstRow)

    expect(baseElement).toMatchSnapshot()
  })
})

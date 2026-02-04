import { type Commit, ServiceTypeEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type OutdatedService } from '../hooks/use-outdated-services/use-outdated-services'
import { type ServiceForDeploy } from '../hooks/use-services-for-deploy/use-services-for-deploy'
import { UpdateAllModal, type UpdateAllModalProps } from './update-all-modal'

const [mockEnvironment1, mockEnvironment2, mockEnvironment3] = environmentFactoryMock(3).map((env, index) => ({
  ...env,
  id: `env${index + 1}`,
}))
const mockMutate = jest.fn()

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

const mockServicesForDeploy: ServiceForDeploy[] = [
  {
    id: mockApplications[0].id,
    name: mockApplications[0].name,
    icon_uri: '',
    serviceType: 'APPLICATION',
    sourceType: 'git',
    currentVersion: {
      type: 'commit',
      value: 'commit0',
      displayValue: 'commit0',
    },
  },
  {
    id: mockApplications[1].id,
    name: mockApplications[1].name,
    icon_uri: '',
    serviceType: 'APPLICATION',
    sourceType: 'git',
    currentVersion: {
      type: 'commit',
      value: 'commit1',
      displayValue: 'commit1',
    },
  },
]

jest.mock('../hooks/use-outdated-services/use-outdated-services', () => ({
  useOutdatedServices: ({ environmentId }: { environmentId: string }) => ({
    data: environmentId === 'env1' ? [mockApplications[0]] : [],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('../hooks/use-services-for-deploy/use-services-for-deploy', () => ({
  useServicesForDeploy: ({ environmentId }: { environmentId: string }) => ({
    data: environmentId === 'env1' ? mockServicesForDeploy : environmentId === 'env2' ? [mockServicesForDeploy[1]] : [],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('../hooks/use-deploy-all-services/use-deploy-all-services', () => {
  return {
    ...jest.requireActual('../hooks/use-deploy-all-services/use-deploy-all-services'),
    useDeployAllServices: () => ({
      mutate: mockMutate,
      isLoading: false,
      error: {},
    }),
  }
})

describe('UpdateAllModal', () => {
  const props: UpdateAllModalProps = {
    environment: mockEnvironment1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should deploy outdated service by default', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)
    const submitButton = screen.getByTestId('submit-button')

    expect(submitButton).toHaveTextContent('Update 1 service')
    await userEvent.click(submitButton)

    expect(mockMutate).toHaveBeenCalledWith({
      environment: mockEnvironment1,
      payload: {
        applications: [
          {
            application_id: mockApplications[0].id,
            git_commit_id: mockApplications[0].commits[0].git_commit_id,
          },
        ],
      },
    })
  })

  it('should select and unselect outdated services', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)

    expect(screen.getByTestId('submit-button')).toHaveTextContent('Update 1 service')
    await userEvent.click(screen.getByTestId('deselect-all'))
    expect(screen.getByTestId('submit-button')).toHaveTextContent('No services to update')
    await userEvent.click(screen.getByTestId('select-all'))
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Update 1 service')
  })

  it('should display services from both sections', () => {
    renderWithProviders(<UpdateAllModal {...props} />)
    expect(screen.getAllByTestId('service-row')).toHaveLength(2)
  })

  it('should disable submit button when no services are selected', () => {
    renderWithProviders(<UpdateAllModal {...props} environment={mockEnvironment2} />)
    expect(screen.getByTestId('submit-button')).toHaveTextContent('No services to update')
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('should not display empty state when there are no services', () => {
    renderWithProviders(<UpdateAllModal {...props} environment={mockEnvironment3} />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toHaveTextContent('No services to update')
  })
})

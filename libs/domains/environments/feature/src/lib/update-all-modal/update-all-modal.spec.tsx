import { type UseQueriesOptions } from '@tanstack/react-query'
import { fireEvent } from '@testing-library/react'
import { within } from '@testing-library/react'
import { type Commit, ServiceTypeEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type OutdatedService } from '../hooks/use-outdated-services/use-outdated-services'
import { type ServiceForDeploy } from '../hooks/use-services-for-deploy/use-services-for-deploy'
import { UpdateAllModal, type UpdateAllModalProps } from './update-all-modal'

const mockUseQuery = jest.fn()
const mockUseQueries = jest.fn()

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: (options: unknown) => mockUseQuery(options),
    useQueries: (options: unknown) => mockUseQueries(options),
  }
})

const [mockEnvironment, mockEmptyEnvironment] = environmentFactoryMock(2).map((env, index) => ({
  ...env,
  id: `env-${index + 1}`,
}))

const mockMutate = jest.fn()

const mockBaseApplications = applicationFactoryMock(2).map(
  (app): OutdatedService => ({
    ...app,
    environment: { id: '1' },
    healthchecks: {},
    git_repository: {
      ...app.git_repository,
      url: '',
      deployed_commit_contributor: '',
      deployed_commit_date: '',
      deployed_commit_id: 'commit-old',
      deployed_commit_tag: '',
    },
    serviceType: ServiceTypeEnum.APPLICATION,
    commits: [{ git_commit_id: 'commit-new' } as Commit],
  })
)

const mockServicesForDeploy: ServiceForDeploy[] = [
  {
    id: 'service-app',
    name: 'App service',
    icon_uri: '',
    serviceType: 'APPLICATION',
    sourceType: 'git',
    currentVersion: { type: 'commit', value: 'app-old', displayValue: 'app-old' },
  },
  {
    id: 'service-job-git',
    name: 'Job git service',
    icon_uri: '',
    serviceType: 'JOB',
    sourceType: 'git',
    job_type: 'CRON',
    currentVersion: { type: 'commit', value: 'job-old', displayValue: 'job-old' },
  },
  {
    id: 'service-container-outdated',
    name: 'Container outdated',
    icon_uri: '',
    serviceType: 'CONTAINER',
    sourceType: 'container',
    currentVersion: { type: 'tag', value: '1.0.0', displayValue: '1.0.0' },
    containerSource: {
      image_name: 'container-outdated',
      tag: '1.0.0',
      registry: { id: 'registry-outdated' } as ServiceForDeploy['containerSource']['registry'],
    },
  },
  {
    id: 'service-job-container',
    name: 'Job container',
    icon_uri: '',
    serviceType: 'JOB',
    sourceType: 'container',
    job_type: 'CRON',
    currentVersion: { type: 'tag', value: '2.0.0', displayValue: '2.0.0' },
    containerSource: {
      image_name: 'job-container',
      tag: '2.0.0',
      registry: { id: 'registry-job' } as ServiceForDeploy['containerSource']['registry'],
    },
  },
  {
    id: 'service-helm-repo',
    name: 'Helm repository',
    icon_uri: '',
    serviceType: 'HELM',
    sourceType: 'helm-repository',
    currentVersion: { type: 'chart-version', value: '2.0.0', displayValue: '2.0.0' },
    helmRepository: { repositoryId: 'helm-repo', chartName: 'chart-a' },
  },
  {
    id: 'service-helm-git',
    name: 'Helm git',
    icon_uri: '',
    serviceType: 'HELM',
    sourceType: 'git',
    currentVersion: { type: 'commit', value: 'helm-old', displayValue: 'helm-old' },
  },
  {
    id: 'service-terraform',
    name: 'Terraform',
    icon_uri: '',
    serviceType: 'TERRAFORM',
    sourceType: 'git',
    currentVersion: { type: 'commit', value: 'terraform-old', displayValue: 'terraform-old' },
  },
  {
    id: 'service-cron',
    name: 'Cron job',
    icon_uri: '',
    serviceType: 'CRON_JOB',
    sourceType: 'git',
    currentVersion: { type: 'commit', value: 'cron-old', displayValue: 'cron-old' },
  },
  {
    id: 'service-lifecycle',
    name: 'Lifecycle job',
    icon_uri: '',
    serviceType: 'LIFECYCLE_JOB',
    sourceType: 'git',
    currentVersion: { type: 'commit', value: 'lifecycle-old', displayValue: 'lifecycle-old' },
  },
  {
    id: 'service-unconfigured-app',
    name: 'Unconfigured app',
    icon_uri: '',
    serviceType: 'APPLICATION',
    sourceType: 'git',
  },
  {
    id: 'service-database-as-git',
    name: 'Database (git source)',
    icon_uri: '',
    serviceType: 'DATABASE',
    sourceType: 'git',
    currentVersion: { type: 'tag', value: '12', displayValue: '12' },
  },
  {
    id: 'service-container-up-to-date',
    name: 'Container up to date',
    icon_uri: '',
    serviceType: 'CONTAINER',
    sourceType: 'container',
    currentVersion: { type: 'tag', value: '9.9.9', displayValue: '9.9.9' },
    containerSource: {
      image_name: 'container-up-to-date',
      tag: '9.9.9',
      registry: { id: 'registry-up-to-date' } as ServiceForDeploy['containerSource']['registry'],
    },
  },
]

const mockOutdatedServices: Partial<OutdatedService>[] = [
  { id: 'service-app', commits: [{ git_commit_id: 'app-new' } as Commit] },
  { id: 'service-job-git', commits: [{ git_commit_id: 'job-new' } as Commit] },
  { id: 'service-database-as-git', commits: [{ git_commit_id: 'db-new' } as Commit] },
  { id: 'service-unconfigured-app', commits: [] },
]

const mockServicesForDeployByEnvironment: Record<string, ServiceForDeploy[]> = {
  [mockEnvironment.id]: mockServicesForDeploy,
  [mockEmptyEnvironment.id]: [],
}

const mockOutdatedServicesByEnvironment: Record<string, Partial<OutdatedService>[]> = {
  [mockEnvironment.id]: mockOutdatedServices,
  [mockEmptyEnvironment.id]: [],
}

const mockLatestDataByServiceId: Record<string, unknown> = {
  'service-app': null,
  'service-job-git': null,
  'service-container-outdated': [
    {
      image_name: 'container-outdated',
      versions: ['2.0.0', '1.0.0', 'latest'],
    },
  ],
  'service-job-container': [
    {
      image_name: 'job-container',
      versions: ['3.0.0', '2.0.0', 'latest'],
    },
  ],
  'service-helm-repo': [
    {
      chart_name: 'chart-a',
      versions: ['3.0.0', '2.0.0'],
    },
  ],
  'service-helm-git': [{ git_commit_id: 'helm-new' }],
  'service-terraform': [{ git_commit_id: 'terraform-new' }],
  'service-cron': [{ git_commit_id: 'cron-new' }],
  'service-lifecycle': [{ git_commit_id: 'lifecycle-new' }],
  'service-unconfigured-app': null,
  'service-database-as-git': null,
  'service-container-up-to-date': [
    {
      image_name: 'container-up-to-date',
      versions: ['9.9.9', '9.9.8', 'latest'],
    },
  ],
}

const mockCommitsByServiceId: Record<string, { git_commit_id: string; message?: string }[]> = {
  'service-app': [{ git_commit_id: 'app-new', message: 'App message' }],
  'service-job-git': [{ git_commit_id: 'job-new', message: '' }],
  'service-helm-git': [{ git_commit_id: 'helm-new', message: 'Helm message' }],
  'service-terraform': [{ git_commit_id: 'terraform-new', message: 'Terraform message' }],
  'service-cron': [{ git_commit_id: 'cron-new', message: 'Cron message' }],
  'service-lifecycle': [{ git_commit_id: 'lifecycle-new', message: 'Lifecycle message' }],
  'service-unconfigured-app': [],
}

const mockContainerVersionsByRegistryId: Record<string, { image_name: string; versions: string[] }[]> = {
  'registry-outdated': [{ image_name: 'container-outdated', versions: ['2.0.0', '1.0.0', 'latest'] }],
  'registry-job': [{ image_name: 'job-container', versions: ['3.0.0', '2.0.0', 'latest'] }],
  'registry-up-to-date': [{ image_name: 'container-up-to-date', versions: ['9.9.9', '9.9.8', 'latest'] }],
}

const mockHelmVersionsByRepositoryId: Record<string, { chart_name?: string; versions?: string[] }[]> = {
  'helm-repo': [{ chart_name: 'chart-a', versions: ['3.0.0', '2.0.0'] }],
}

jest.mock('../hooks/use-outdated-services/use-outdated-services', () => ({
  useOutdatedServices: ({ environmentId }: { environmentId: string }) => ({
    data: mockOutdatedServicesByEnvironment[environmentId] ?? [],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('../hooks/use-services-for-deploy/use-services-for-deploy', () => ({
  useServicesForDeploy: ({ environmentId }: { environmentId: string }) => ({
    data: mockServicesForDeployByEnvironment[environmentId] ?? [],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('../hooks/use-deploy-all-services/use-deploy-all-services', () => ({
  ...jest.requireActual('../hooks/use-deploy-all-services/use-deploy-all-services'),
  useDeployAllServices: () => ({
    mutate: mockMutate,
    isLoading: false,
    error: {},
  }),
}))

describe('UpdateAllModal', () => {
  const props: UpdateAllModalProps = {
    environment: mockEnvironment,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseQueries.mockImplementation((options: UseQueriesOptions) => {
      const supportedServiceIds = mockServicesForDeploy
        .filter(({ sourceType }) => sourceType !== 'database')
        .map(({ id }) => id)

      return (options.queries as unknown[]).map((_, index) => ({
        data: mockLatestDataByServiceId[supportedServiceIds[index]],
        fetchStatus: 'idle',
      }))
    })

    mockUseQuery.mockImplementation(
      (options: { queryKey?: unknown[]; enabled?: boolean; select?: (data: unknown) => unknown }) => {
        if (!options || options.enabled === false) {
          return { data: undefined }
        }

        const queryKey = options.queryKey ?? []
        let data: unknown

        if (queryKey[0] === 'services' && queryKey[1] === 'listCommits') {
          data = mockCommitsByServiceId[String(queryKey[2])] ?? []
        } else if (queryKey[0] === 'organizations' && queryKey[1] === 'containerVersions') {
          data = mockContainerVersionsByRegistryId[String(queryKey[3])] ?? []
        } else if (queryKey[0] === 'serviceHelm' && queryKey[1] === 'helmCharts') {
          data = mockHelmVersionsByRepositoryId[String(queryKey[3])] ?? []
        }

        if (options.select) {
          return { data: options.select(data) }
        }

        return { data }
      }
    )
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit payload with all covered service type branches', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(await screen.findByText('Update 8 services')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Container outdated'))
    await userEvent.click(screen.getByText('Job container'))
    expect(screen.getByText('Update 10 services')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mockMutate).toHaveBeenCalledWith({
      environment: mockEnvironment,
      payload: {
        applications: [
          {
            application_id: 'service-app',
            git_commit_id: 'app-new',
          },
        ],
        containers: [
          {
            id: 'service-container-outdated',
            image_tag: '1.0.0',
          },
        ],
        jobs: [
          {
            id: 'service-job-git',
            git_commit_id: 'job-new',
            image_tag: undefined,
          },
          {
            id: 'service-job-container',
            git_commit_id: undefined,
            image_tag: '2.0.0',
          },
        ],
        helms: [
          {
            id: 'service-helm-repo',
            chart_version: '3.0.0',
            git_commit_id: undefined,
          },
          {
            id: 'service-helm-git',
            chart_version: undefined,
            git_commit_id: 'helm-new',
          },
        ],
        databases: ['service-database-as-git'],
      },
    })
  })

  it('should ignore toggle on unselectable row and toggle selected row with keyboard', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(await screen.findByText('Update 8 services')).toBeInTheDocument()
    expect(screen.getByText('1 service on deleted branch')).toBeInTheDocument()
    const upToDateHeading = screen.getByText('3 up-to-date services')
    const deletedBranchHeading = screen.getByText('1 service on deleted branch')
    expect(
      Boolean(upToDateHeading.compareDocumentPosition(deletedBranchHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true)
    expect(screen.getByText('Unconfigured app')).toHaveClass('text-neutral-300')
    expect(screen.getByText('Unconfigured app').closest('[data-testid="service-row"]')).toHaveClass('bg-neutral-100')
    expect(screen.queryByTestId('target-version-select-service-unconfigured-app')).not.toBeInTheDocument()
    expect(document.querySelector('input[name="service-unconfigured-app"]')).toBeNull()

    await userEvent.click(screen.getByText('Unconfigured app'))
    expect(screen.getByText('Update 8 services')).toBeInTheDocument()

    const appRow = screen.getByText('App service').closest('[role="button"]')
    expect(appRow).toBeTruthy()
    fireEvent.keyDown(appRow!, { key: 'Enter' })

    expect(screen.getByText('Update 7 services')).toBeInTheDocument()
  })

  it('should show git fallback message and auto-select service when choosing a new version', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(await screen.findByText('Update 8 services')).toBeInTheDocument()
    expect(screen.getByTestId('target-version-select-service-container-up-to-date')).toHaveTextContent('9.9.9')

    await userEvent.click(screen.getByTestId('target-version-select-service-job-git'))
    expect(await screen.findByText('No message')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('target-version-select-service-container-up-to-date'))
    await userEvent.click(await screen.findByRole('button', { name: /9\.9\.8/ }))

    expect(screen.getByText('Update 9 services')).toBeInTheDocument()
  })

  it('should use the same truncated one-line option layout for git and container popovers', async () => {
    const { userEvent } = renderWithProviders(<UpdateAllModal {...props} />)
    expect(await screen.findByText('Update 8 services')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('target-version-select-service-app'))
    const gitOption = await screen.findByRole('button', { name: /app-new/i })
    const gitTopLabel = within(gitOption).getByText('app-new')
    expect(gitTopLabel).toHaveClass('truncate', 'whitespace-nowrap')
    expect(gitTopLabel.parentElement).toHaveClass('items-center', 'gap-1')
    await userEvent.click(gitOption)

    await userEvent.click(screen.getByTestId('target-version-select-service-container-outdated'))
    const containerOption = (await screen.findAllByRole('button', { name: /^2\.0\.0$/ })).find((element) =>
      element.className.includes('min-h-[62px]')
    )
    expect(containerOption).toBeDefined()
    if (!containerOption) {
      throw new Error('Expected container option in popover')
    }
    const containerTopLabel = within(containerOption).getByText('2.0.0')
    expect(containerTopLabel).toHaveClass('truncate', 'whitespace-nowrap')
    expect(containerTopLabel.parentElement).toHaveClass('items-center', 'gap-1')
    await userEvent.click(containerOption)
  })

  it('should disable submit button when there are no services', () => {
    renderWithProviders(<UpdateAllModal {...props} environment={mockEmptyEnvironment} />)
    expect(screen.getByTestId('submit-button')).toHaveTextContent('No services to update')
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('should not display empty state when there are no services', () => {
    renderWithProviders(<UpdateAllModal {...props} environment={mockEmptyEnvironment} />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })
})

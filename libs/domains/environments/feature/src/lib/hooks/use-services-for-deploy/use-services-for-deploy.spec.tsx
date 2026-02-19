import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  applicationFactoryMock,
  containerFactoryMock,
  cronjobFactoryMock,
  databaseFactoryMock,
  helmFactoryMock,
  terraformFactoryMock,
} from '@qovery/shared/factories'
import { queries } from '@qovery/state/util-queries'
import { useServicesForDeploy } from './use-services-for-deploy'

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

jest.mock('@qovery/state/util-queries', () => ({
  queries: {
    services: {
      list: jest.fn((environmentId: string) => ({
        queryKey: ['services', 'list', environmentId],
        queryFn: jest.fn(),
      })),
    },
  },
}))

const mockUseQuery = jest.mocked(useQuery)
const mockQueries = jest.mocked(queries.services.list)

describe('useServicesForDeploy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should map all supported service/source variants', () => {
    const application = applicationFactoryMock(1)[0]
    application.id = 'application'
    application.git_repository = {
      ...application.git_repository,
      deployed_commit_id: 'abcdef123456',
      deployed_commit_date: '2024-01-01T00:00:00.000Z',
    }

    const container = containerFactoryMock(1)[0]
    container.id = 'container'
    container.tag = '1.2.3'
    container.image_name = 'qovery/container'

    const jobGit = cronjobFactoryMock(1)[0]
    jobGit.id = 'job-git'

    const jobContainer = cronjobFactoryMock(1, true)[0]
    jobContainer.id = 'job-container'
    if ('image' in jobContainer.source && jobContainer.source.image) {
      jobContainer.source.image.image_name = undefined
      jobContainer.source.image.tag = '2.0.0'
    }

    const jobUnknown = cronjobFactoryMock(1)[0]
    jobUnknown.id = 'job-unknown'
    jobUnknown.source = {} as typeof jobUnknown.source

    const helmGit = helmFactoryMock(1)[0]
    helmGit.id = 'helm-git'
    if ('git' in helmGit.source && helmGit.source.git) {
      helmGit.source.git.git_repository = {
        ...helmGit.source.git.git_repository,
        deployed_commit_id: '123456789abcdef',
        deployed_commit_date: '2024-01-03T00:00:00.000Z',
      }
    }
    helmGit.values_override = {
      file: {
        git: {
          git_repository: {
            provider: 'GITHUB',
            owner: 'qovery',
            name: 'repo',
            branch: 'main',
            root_path: '/',
            url: 'https://github.com/qovery/repo',
          },
        },
      },
    } as typeof helmGit.values_override

    const helmRepository = helmFactoryMock(1)[0]
    helmRepository.id = 'helm-repository'
    helmRepository.source = {
      repository: {
        chart_version: '3.2.1',
        chart_name: undefined,
        repository: { id: 'repo-id' },
      },
    } as typeof helmRepository.source

    const helmUnknown = helmFactoryMock(1)[0]
    helmUnknown.id = 'helm-unknown'
    helmUnknown.source = {} as typeof helmUnknown.source

    const database = databaseFactoryMock(1)[0]
    database.id = 'database'
    database.version = '14'

    const terraform = terraformFactoryMock(1)[0]
    terraform.id = 'terraform'
    if (terraform.terraform_files_source?.git?.git_repository) {
      terraform.terraform_files_source.git.git_repository.deployed_commit_id = 'fedcba987654321'
      terraform.terraform_files_source.git.git_repository.deployed_commit_date = '2024-01-02T00:00:00.000Z'
    }

    mockUseQuery.mockReturnValue({
      data: [
        application,
        container,
        jobGit,
        jobContainer,
        jobUnknown,
        helmGit,
        helmRepository,
        helmUnknown,
        database,
        terraform,
      ] as AnyService[],
      isLoading: false,
    } as ReturnType<typeof useQuery>)

    const { result } = renderHook(() => useServicesForDeploy({ environmentId: 'env-1' }))

    const byId = (id: string) => result.current.data.find((service) => service.id === id)

    expect(byId('application')).toMatchObject({
      serviceType: 'APPLICATION',
      sourceType: 'git',
      currentVersion: { type: 'commit', value: 'abcdef123456', displayValue: 'abcdef1' },
      gitRepository: { deployedCommitId: 'abcdef123456', deployedCommitDate: '2024-01-01T00:00:00.000Z' },
    })

    expect(byId('container')).toMatchObject({
      serviceType: 'CONTAINER',
      sourceType: 'container',
      currentVersion: { type: 'tag', value: '1.2.3', displayValue: '1.2.3' },
      containerSource: { image_name: 'qovery/container', tag: '1.2.3' },
    })

    expect(byId('job-git')).toMatchObject({
      serviceType: 'JOB',
      sourceType: 'git',
      currentVersion: {
        type: 'commit',
        value: '8a21ddb195d821781d46eb1d8f26d5ae13609dd1',
        displayValue: '8a21ddb',
      },
      gitRepository: { deployedCommitId: '8a21ddb195d821781d46eb1d8f26d5ae13609dd1' },
    })

    expect(byId('job-container')).toMatchObject({
      serviceType: 'JOB',
      sourceType: 'container',
      currentVersion: { type: 'tag', value: '2.0.0', displayValue: '2.0.0' },
      containerSource: { image_name: '', tag: '2.0.0' },
    })

    expect(byId('job-unknown')).toMatchObject({
      serviceType: 'JOB',
      sourceType: 'git',
    })
    expect(byId('job-unknown')?.currentVersion).toBeUndefined()

    expect(byId('helm-git')).toMatchObject({
      serviceType: 'HELM',
      sourceType: 'git',
      currentVersion: {
        type: 'commit',
        value: '123456789abcdef',
        displayValue: '1234567',
      },
      hasValuesOverrideGit: true,
      gitRepository: { deployedCommitId: '123456789abcdef' },
    })

    expect(byId('helm-repository')).toMatchObject({
      serviceType: 'HELM',
      sourceType: 'helm-repository',
      currentVersion: { type: 'chart-version', value: '3.2.1', displayValue: '3.2.1' },
      helmRepository: { repositoryId: 'repo-id', chartName: '' },
      hasValuesOverrideGit: false,
    })

    expect(byId('helm-unknown')).toMatchObject({
      serviceType: 'HELM',
      sourceType: 'helm-repository',
    })
    expect(byId('helm-unknown')?.currentVersion).toBeUndefined()

    expect(byId('database')).toMatchObject({
      serviceType: 'DATABASE',
      sourceType: 'database',
      currentVersion: { type: 'tag', value: '14', displayValue: '14' },
    })

    expect(byId('terraform')).toMatchObject({
      serviceType: 'TERRAFORM',
      sourceType: 'git',
      currentVersion: { type: 'commit', value: 'fedcba987654321', displayValue: 'fedcba9' },
      gitRepository: { deployedCommitId: 'fedcba987654321', deployedCommitDate: '2024-01-02T00:00:00.000Z' },
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('should return empty array when query data is undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useQuery>)

    const { result } = renderHook(() => useServicesForDeploy({ environmentId: 'env-1' }))

    expect(result.current.data).toEqual([])
  })

  it('should call services.list and disable query when environmentId is empty', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
    } as ReturnType<typeof useQuery>)

    const { result } = renderHook(() => useServicesForDeploy({ environmentId: '' }))

    expect(mockQueries).toHaveBeenCalledWith('')
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    )
    expect(result.current.isLoading).toBe(true)
  })
})

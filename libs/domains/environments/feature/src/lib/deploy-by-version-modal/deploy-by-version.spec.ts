import { type Commit } from 'qovery-typescript-axios'
import { helmFactoryMock, terraformFactoryMock } from '@qovery/shared/factories'
import {
  type DeployByVersionService,
  buildDeployByVersionPayload,
  commitsToVersionOptions,
  containerVersionsToOptions,
  countDeployByVersionServices,
  createInitialSelections,
  sortVersions,
  toVersionedService,
  versionsToOptions,
} from './deploy-by-version'

const services: DeployByVersionService[] = [
  {
    id: 'application',
    name: 'Application',
    iconUri: 'app://qovery-console/application',
    serviceType: 'APPLICATION',
    sourceType: 'git',
    currentVersion: 'app-old',
    versions: [{ value: 'app-new' }, { value: 'app-old' }],
    isSkipped: false,
  },
  {
    id: 'container',
    name: 'Container',
    iconUri: 'app://qovery-console/container',
    serviceType: 'CONTAINER',
    sourceType: 'container',
    currentVersion: '1.0.0',
    containerRegistryId: 'registry',
    imageName: 'nginx',
    versions: [{ value: '2.0.0' }, { value: '1.0.0' }],
    isSkipped: false,
  },
  {
    id: 'git-job',
    name: 'Git job',
    iconUri: 'app://qovery-console/cron-job',
    serviceType: 'JOB',
    sourceType: 'git',
    jobType: 'CRON',
    currentVersion: 'job-old',
    versions: [{ value: 'job-new' }],
    isSkipped: false,
  },
  {
    id: 'container-job',
    name: 'Container job',
    iconUri: 'app://qovery-console/lifecycle-job',
    serviceType: 'JOB',
    sourceType: 'container',
    jobType: 'LIFECYCLE',
    currentVersion: '1.0.0',
    containerRegistryId: 'registry',
    imageName: 'job',
    versions: [{ value: '2.0.0' }],
    isSkipped: false,
  },
  {
    id: 'git-helm',
    name: 'Git Helm',
    iconUri: 'app://qovery-console/helm',
    serviceType: 'HELM',
    sourceType: 'git',
    currentVersion: 'helm-old',
    versions: [{ value: 'helm-new' }],
    isSkipped: false,
  },
  {
    id: 'repository-helm',
    name: 'Repository Helm',
    iconUri: 'app://qovery-console/helm',
    serviceType: 'HELM',
    sourceType: 'helm-repository',
    currentVersion: '1.0.0',
    helmRepositoryId: 'helm-repository',
    chartName: 'chart',
    versions: [{ value: '2.0.0' }],
    isSkipped: false,
  },
  {
    id: 'terraform',
    name: 'Terraform',
    iconUri: 'app://qovery-console/terraform',
    serviceType: 'TERRAFORM',
    sourceType: 'git',
    currentVersion: 'terraform-old',
    versions: [{ value: 'terraform-new' }],
    isSkipped: false,
  },
  {
    id: 'skipped-terraform',
    name: 'Skipped Terraform',
    iconUri: 'app://qovery-console/terraform',
    serviceType: 'TERRAFORM',
    sourceType: 'git',
    currentVersion: 'terraform-old',
    versions: [{ value: 'terraform-new' }],
    isSkipped: true,
  },
]

describe('deploy by version', () => {
  it('builds a typed payload for every supported source, including Terraform', () => {
    const selections = createInitialSelections(services)
    expect(selections['skipped-terraform'].selected).toBe(false)
    selections['skipped-terraform'].selected = true
    const payload = buildDeployByVersionPayload(services, selections)

    expect(payload).toEqual({
      applications: [{ application_id: 'application', git_commit_id: 'app-new' }],
      containers: [{ id: 'container', image_tag: '2.0.0' }],
      jobs: [
        { id: 'git-job', git_commit_id: 'job-new' },
        { id: 'container-job', image_tag: '2.0.0' },
      ],
      helms: [
        { id: 'git-helm', git_commit_id: 'helm-new' },
        { id: 'repository-helm', chart_version: '2.0.0' },
      ],
      terraforms: [{ id: 'terraform', git_commit_id: 'terraform-new' }],
    })
    expect(countDeployByVersionServices(payload)).toBe(7)
    expect(payload.terraforms).not.toContainEqual(expect.objectContaining({ id: 'skipped-terraform' }))
  })

  it('excludes all blueprint-backed services before source classification', () => {
    const terraform = { ...terraformFactoryMock(1)[0], blueprint_id: 'blueprint-id' }
    const helm = { ...helmFactoryMock(1)[0], blueprint_id: 'blueprint-id' }

    expect(toVersionedService(terraform)).toBeUndefined()
    expect(toVersionedService(helm)).toBeUndefined()
  })

  it('includes a regular Terraform service and reads its deployed commit', () => {
    const terraform = terraformFactoryMock(1)[0]
    const gitRepository = terraform.terraform_files_source?.git?.git_repository
    if (!gitRepository) throw new Error('The Terraform factory must have a Git repository')
    gitRepository.deployed_commit_id = 'deployed-commit'

    expect(toVersionedService(terraform)).toMatchObject({
      id: terraform.id,
      serviceType: 'TERRAFORM',
      sourceType: 'git',
      currentVersion: 'deployed-commit',
    })
  })

  it('keeps API version arrays immutable while sorting semantic versions first', () => {
    const versions = ['latest', '1.9.0', 'v2.0.0']

    expect(sortVersions(versions)).toEqual(['v2.0.0', '1.9.0', 'latest'])
    expect(versions).toEqual(['latest', '1.9.0', 'v2.0.0'])
  })

  it('disables the mutable latest tag only for container versions', () => {
    expect(containerVersionsToOptions(['latest', '1.0.0'])).toEqual([
      { value: '1.0.0' },
      {
        value: 'latest',
        isDisabled: true,
        disabledReason: 'Image tag cannot be latest to ensure consistent deployment',
      },
    ])
    expect(versionsToOptions(['latest'])).toEqual([{ value: 'latest' }])
  })

  it('selects the first deployable version and rejects disabled selections from the payload', () => {
    const container = {
      ...services[1],
      versions: [{ value: 'latest', isDisabled: true }, { value: '2.0.0' }],
    } satisfies DeployByVersionService
    const containerJob = {
      ...services[3],
      versions: [{ value: 'latest', isDisabled: true }],
    } satisfies DeployByVersionService
    const selections = createInitialSelections([container, containerJob])

    expect(selections).toEqual({
      container: { selected: true, version: '2.0.0' },
      'container-job': { selected: false, version: '' },
    })

    selections.container = { selected: true, version: 'latest' }
    selections['container-job'] = { selected: true, version: 'latest' }

    expect(buildDeployByVersionPayload([container, containerJob], selections)).toEqual({})
  })

  it('preserves commit metadata for the version menu', () => {
    const commit: Commit = {
      git_commit_id: 'abc123',
      created_at: '2026-01-01T00:00:00Z',
      message: 'Add deployment support',
      tag: 'v1.0.0',
      author_name: 'Ada',
    }

    expect(commitsToVersionOptions([commit])).toEqual([
      { value: 'abc123', message: 'Add deployment support', tag: 'v1.0.0' },
    ])
  })
})

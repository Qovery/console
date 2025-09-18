import { BuildModeEnum, GitProviderEnum, ServiceTypeEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import {
  applicationFactoryMock,
  cronjobFactoryMock,
  helmFactoryMock,
  terraformFactoryMock,
} from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsGeneralFeature, {
  handleGitApplicationSubmit,
  handleHelmSubmit,
  handleJobSubmit,
  handleTerraformSubmit,
} from './page-settings-general-feature'

describe('PageSettingsGeneralFeature', () => {
  let application: Application
  beforeEach(() => {
    application = applicationFactoryMock(1)[0]
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the application with Docker', () => {
    const app = handleGitApplicationSubmit(
      {
        serviceType: ServiceTypeEnum.APPLICATION,
        name: 'hello',
        description: 'description',
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        branch: 'main',
        root_path: '/',
        auto_deploy: false,
      },
      application,
      [],
      []
    )
    expect(app.name).toBe('hello')
    expect(app.description).toBe('description')
    expect(app.dockerfile_path).toBe('/')
    expect(app.docker_target_build_stage).toBeUndefined()
  })

  it('should update the application with Docker and target build stage', () => {
    const app = handleGitApplicationSubmit(
      {
        serviceType: ServiceTypeEnum.APPLICATION,
        name: 'hello',
        description: 'description',
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: '/',
        docker_target_build_stage: 'build-stage',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
        auto_deploy: false,
      },
      application,
      [],
      []
    )
    expect(app.name).toBe('hello')
    expect(app.description).toBe('description')
    expect(app.dockerfile_path).toBe('/')
    expect(app.docker_target_build_stage).toBe('build-stage')
  })

  it('should update the application with git repository', () => {
    const app = handleGitApplicationSubmit(
      {
        serviceType: ServiceTypeEnum.APPLICATION,
        name: 'hello',
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
        auto_deploy: false,
        git_repository: {
          provider: GitProviderEnum.GITHUB,
          url: 'https://github.com/qovery/console.git',
          branch: 'main',
          root_path: '/',
        },
      },
      application,
      [],
      []
    )

    expect(app.git_repository?.branch).toBe('main')
    expect(app.git_repository?.root_path).toBe('/')
    expect(app.git_repository?.url).toBe('https://github.com/qovery/console.git')

    const updatedApp = handleGitApplicationSubmit(
      {
        serviceType: ServiceTypeEnum.APPLICATION,
        name: 'hello',
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        branch: 'main',
        root_path: '/',
        auto_deploy: false,
      },
      application,
      [],
      []
    )

    expect(updatedApp.git_repository?.branch).toBe('main')
    expect(updatedApp.git_repository?.root_path).toBe('/')
    expect(updatedApp.git_repository?.url).toBe(application.git_repository?.url) // Since the git repository is not updated, the url should be the same
  })

  it('should update the job with git repository', () => {
    const job = cronjobFactoryMock(1)[0]
    const app = handleJobSubmit(
      {
        serviceType: ServiceTypeEnum.JOB,
        name: 'hello',
        description: 'description',
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        git_repository: {
          url: 'https://github.com/qovery/console.git',
          default_branch: 'main',
          id: '1',
          name: 'qovery/console',
        },
        branch: 'main',
        root_path: '/',
        auto_deploy: false,
      },
      job,
      [],
      []
    )

    expect(app.source?.docker?.git_repository?.branch).toBe('main')
    expect(app.source?.docker?.git_repository?.root_path).toBe('/')
    expect(app.source?.docker?.git_repository?.url).toBe('https://github.com/qovery/console.git')
    expect(app.source?.docker?.docker_target_build_stage).toBeUndefined()
  })

  it('should update the job with git repository and docker target build stage', () => {
    const job = cronjobFactoryMock(1)[0]
    const app = handleJobSubmit(
      {
        serviceType: ServiceTypeEnum.JOB,
        name: 'hello',
        description: 'description',
        dockerfile_path: '/',
        docker_target_build_stage: 'production',
        provider: GitProviderEnum.GITHUB,
        git_repository: {
          url: 'https://github.com/qovery/console.git',
          default_branch: 'main',
          id: '1',
          name: 'qovery/console',
        },
        branch: 'main',
        root_path: '/',
        auto_deploy: false,
      },
      job,
      [],
      []
    )

    expect(app.source?.docker?.git_repository?.branch).toBe('main')
    expect(app.source?.docker?.git_repository?.root_path).toBe('/')
    expect(app.source?.docker?.git_repository?.url).toBe('https://github.com/qovery/console.git')
    expect(app.source?.docker?.docker_target_build_stage).toBe('production')
  })

  it('should update the job with image', () => {
    const job = cronjobFactoryMock(1, true)[0]
    const app = handleJobSubmit(
      {
        serviceType: ServiceTypeEnum.JOB,
        name: 'hello',
        description: 'description',
        image_tag: 'latest',
        image_name: 'qovery/console',
        registry: 'docker.io',
        auto_deploy: false,
      },
      job,
      [],
      []
    )

    expect(app.source?.image?.tag).toBe('latest')
    expect(app.source?.image?.image_name).toBe('qovery/console')
    expect(app.source?.image?.registry_id).toBe('docker.io')
  })

  it('should update git helm service', () => {
    const helm = helmFactoryMock()[0]
    const app = handleHelmSubmit(
      {
        name: 'hello',
        description: 'description',
        provider: GitProviderEnum.GITHUB,
        git_repository: {
          url: 'https://github.com/qovery/console.git',
          default_branch: 'main',
          id: '1',
          name: 'qovery/console',
        },
        branch: 'main',
        root_path: '/',
        source_provider: 'GIT',
        allow_cluster_wide_resources: true,
        arguments: '--set image.tag=latest',
        timeout_sec: '600',
        auto_deploy: false,
        icon_uri: 'app://qovery-console/helm',
      },
      helm
    )
    expect(app).toStrictEqual({
      name: 'hello',
      description: 'description',
      allow_cluster_wide_resources: true,
      arguments: ['--set', 'image.tag=latest'],
      timeout_sec: 600,
      auto_deploy: false,
      icon_uri: 'app://qovery-console/helm',
      source: {
        git_repository: {
          url: 'https://github.com/qovery/console.git',
          branch: 'main',
          root_path: '/',
          git_token_id: undefined,
        },
      },
    })
  })

  it('should update helm repository service', () => {
    const helm = helmFactoryMock()[0]
    const app = handleHelmSubmit(
      {
        name: 'hello',
        description: 'description',
        provider: GitProviderEnum.GITHUB,
        repository: '000-000',
        source_provider: 'HELM_REPOSITORY',
        allow_cluster_wide_resources: true,
        arguments: '--set image.tag=latest',
        timeout_sec: '600',
        auto_deploy: false,
        chart_name: 'chart',
        chart_version: '1.0.0',
        icon_uri: 'app://qovery-console/helm',
      },
      helm
    )
    expect(app).toStrictEqual({
      name: 'hello',
      description: 'description',
      icon_uri: 'app://qovery-console/helm',
      allow_cluster_wide_resources: true,
      arguments: ['--set', 'image.tag=latest'],
      timeout_sec: 600,
      auto_deploy: false,
      source: {
        helm_repository: {
          repository: '000-000',
          chart_name: 'chart',
          chart_version: '1.0.0',
        },
      },
    })
  })

  it('should update terraform repository service', () => {
    const terraform = terraformFactoryMock(1)[0]
    const gitRepoUrl = 'https://github.com/qovery/console.git'
    const gitBranch = 'staging'
    const description = 'new description'
    const name = 'new name'
    const rootPath = '/'
    const app = handleTerraformSubmit(
      {
        name: name,
        description: description,
        git_repository: {
          provider: 'GITHUB',
          owner: 'qovery',
          name: 'console',
          url: gitRepoUrl,
        },
        root_path: rootPath,
        branch: gitBranch,
      },
      terraform
    )

    expect(app).toStrictEqual({
      ...terraform,
      name: name,
      description: description,
      terraform_files_source: {
        git_repository: {
          url: gitRepoUrl,
          branch: gitBranch,
          root_path: rootPath,
          git_token_id: terraform.terraform_files_source?.git?.git_repository?.git_token_id,
        },
      },
    })
  })
})

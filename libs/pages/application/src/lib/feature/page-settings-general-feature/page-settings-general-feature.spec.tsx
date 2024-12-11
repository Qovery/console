import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock, cronjobFactoryMock, helmFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import PageSettingsGeneralFeature, {
  handleGitApplicationSubmit,
  handleHelmSubmit,
  handleJobSubmit,
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
        name: 'hello',
        description: 'description',
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
      },
      application,
      [],
      []
    )
    expect(app.name).toBe('hello')
    expect(app.description).toBe('description')
    expect(app.dockerfile_path).toBe('/')
  })

  it('should update the application with git repository', () => {
    const app = handleGitApplicationSubmit(
      {
        name: 'hello',
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
      },
      application,
      [],
      []
    )

    expect(app.git_repository?.branch).toBe('main')
    expect(app.git_repository?.root_path).toBe('/')
    expect(app.git_repository?.url).toBe('https://github.com/qovery/console.git')
  })

  it('should update the job with git repository', () => {
    const job = cronjobFactoryMock(1)[0]
    const app = handleJobSubmit(
      {
        name: 'hello',
        description: 'description',
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
      },
      job,
      [],
      []
    )

    expect(app.source?.docker?.git_repository?.branch).toBe('main')
    expect(app.source?.docker?.git_repository?.root_path).toBe('/')
    expect(app.source?.docker?.git_repository?.url).toBe('https://github.com/qovery/console.git')
  })

  it('should update the job with image', () => {
    const job = cronjobFactoryMock(1, true)[0]
    const app = handleJobSubmit(
      {
        name: 'hello',
        description: 'description',
        image_tag: 'latest',
        image_name: 'qovery/console',
        registry: 'docker.io',
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
        repository: 'qovery/console',
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
})

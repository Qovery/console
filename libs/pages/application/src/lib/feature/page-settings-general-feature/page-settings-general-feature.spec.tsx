import { render } from '__tests__/utils/setup-jest'
import { BuildModeEnum, BuildPackLanguageEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock, cronjobFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import PageSettingsGeneralFeature, {
  handleGitApplicationSubmit,
  handleJobSubmit,
} from './page-settings-general-feature'

describe('PageSettingsGeneralFeature', () => {
  let application: ApplicationEntity
  beforeEach(() => {
    application = applicationFactoryMock(1)[0]
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the application with Docker', () => {
    application.buildpack_language = BuildPackLanguageEnum.GO
    const app = handleGitApplicationSubmit(
      {
        name: 'hello',
        description: 'description',
        build_mode: BuildModeEnum.DOCKER,
        buildpack_language: BuildPackLanguageEnum.GO,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
      },
      application
    )
    expect(app.name).toBe('hello')
    expect(app.description).toBe('description')
    expect(app.buildpack_language).toBe(null)
    expect(app.dockerfile_path).toBe('/')
  })

  it('should update the application with Buildpack', () => {
    application.dockerfile_path = 'Dockerfile'
    const app = handleGitApplicationSubmit(
      {
        name: 'hello',
        description: 'description',
        build_mode: BuildModeEnum.BUILDPACKS,
        buildpack_language: BuildPackLanguageEnum.GO,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
      },
      application
    )
    expect(app.name).toBe('hello')
    expect(app.description).toBe('description')
    expect(app.dockerfile_path).toBe(null)
    expect(app.buildpack_language).toBe(BuildPackLanguageEnum.GO)
  })

  it('should update the application with git repository', () => {
    const app = handleGitApplicationSubmit(
      {
        name: 'hello',
        build_mode: BuildModeEnum.BUILDPACKS,
        buildpack_language: BuildPackLanguageEnum.GO,
        dockerfile_path: '/',
        provider: GitProviderEnum.GITHUB,
        repository: 'qovery/console',
        branch: 'main',
        root_path: '/',
      },
      application
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
      job
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
      job
    )

    expect(app.source?.image?.tag).toBe('latest')
    expect(app.source?.image?.image_name).toBe('qovery/console')
    expect(app.source?.image?.registry_id).toBe('docker.io')
  })
})

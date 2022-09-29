import { render } from '__tests__/utils/setup-jest'
import { BuildModeEnum, BuildPackLanguageEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/domains/application'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-general-feature'

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
    const app = handleSubmit(
      {
        name: 'hello',
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
    expect(app.buildpack_language).toBe(null)
    expect(app.dockerfile_path).toBe('/')
  })

  it('should update the application with Buildpack', () => {
    application.dockerfile_path = 'Dockerfile'
    const app = handleSubmit(
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
    expect(app.name).toBe('hello')
    expect(app.dockerfile_path).toBe(null)
    expect(app.buildpack_language).toBe(BuildPackLanguageEnum.GO)
  })

  it('should update the application with git repository', () => {
    const app = handleSubmit(
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
})

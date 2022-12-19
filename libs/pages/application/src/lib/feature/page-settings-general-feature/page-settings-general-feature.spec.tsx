import { render } from '__tests__/utils/setup-jest'
import { BuildModeEnum, BuildPackLanguageEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/domains/application'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { cronjobFactoryMock } from '../../../../../../domains/application/src/lib/mocks/factories/job-factory.mock'
import PageSettingsGeneralFeature, { handleJobSubmit, handleSubmit } from './page-settings-general-feature'

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

  it('should update the job with git repository', () => {
    const job = cronjobFactoryMock(1)[0]
    const app = handleJobSubmit(
      {
        name: 'hello',
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

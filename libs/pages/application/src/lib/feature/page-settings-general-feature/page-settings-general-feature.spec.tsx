import { render } from '__tests__/utils/setup-jest'
import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@console/domains/application'
import { ApplicationEntity } from '@console/shared/interfaces'
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
      },
      application
    )
    expect(app.name).toBe('hello')
    expect(app.dockerfile_path).toBe(null)
    expect(app.buildpack_language).toBe(BuildPackLanguageEnum.GO)
  })
})

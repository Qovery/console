import { ApplicationAdvancedSettings } from 'qovery-typescript-axios'
import { getServiceType } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { initFormValues } from './init-form-values'

const mockApplication: ApplicationEntity = applicationFactoryMock(1)[0]
const mockAdvancedSettings: Partial<ApplicationAdvancedSettings> = {
  'build.timeout_max_sec': 60,
  'deployment.custom_domain_check_enabled': true,
  'liveness_probe.http_get.path': '/',
}
mockApplication.advanced_settings = {
  loadingStatus: 'loaded',
  current_settings: mockAdvancedSettings,
}

describe('InitFormValues', () => {
  it('should return the init values', () => {
    expect(
      initFormValues(
        ['build.timeout_max_sec', 'deployment.custom_domain_check_enabled', 'liveness_probe.http_get.path'],
        mockApplication,
        getServiceType(mockApplication)
      )
    ).toStrictEqual({
      'build.timeout_max_sec': '60',
      'deployment.custom_domain_check_enabled': 'true',
      'liveness_probe.http_get.path': '/',
    })
  })
})

import { ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { getServiceType } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { initFormValues } from './init-form-values'

const mockCluster: ApplicationEntity = applicationFactoryMock(1)[0]
const mockAdvancedSettings: Partial<ClusterAdvancedSettings> = {
  'registry.image_retention_time': 60,
  'pleco.resources_ttl': 10,
  'load_balancer.size': '/',
}
mockCluster.advanced_settings = {
  loadingStatus: 'loaded',
  current_settings: mockAdvancedSettings,
}

describe('InitFormValues', () => {
  it('should return the init values', () => {
    expect(
      initFormValues(
        ['registry.image_retention_time', 'pleco.resources_ttl', 'load_balancer.size'],
        mockCluster,
        getServiceType(mockCluster)
      )
    ).toStrictEqual({
      'registry.image_retention_time': '60',
      'pleco.resources_ttl': '10',
      'load_balancer.size': '/',
    })
  })
})

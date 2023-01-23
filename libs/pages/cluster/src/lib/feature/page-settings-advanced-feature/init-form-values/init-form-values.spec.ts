import { ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { getServiceType } from '@qovery/shared/enums'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { initFormValues } from './init-form-values'

const mockCluster: ApplicationEntity = applicationFactoryMock(1)[0]
const mockAdvancedSettings: Partial<ClusterAdvancedSettings> = {
  'registry.image_retention_time': 60,
  'aws.vpc.enable_s3_flow_logs': false,
  'aws.iam.admin_group': 'Admins',
  'cloud_provider.container_registry.tags': {},
}
mockCluster.advanced_settings = {
  loadingStatus: 'loaded',
  current_settings: mockAdvancedSettings,
}

describe('InitFormValues', () => {
  it('should return the init values', () => {
    expect(
      initFormValues(
        [
          'registry.image_retention_time',
          'aws.vpc.enable_s3_flow_logs',
          'aws.iam.admin_group',
          'cloud_provider.container_registry.tags',
        ],
        mockCluster
      )
    ).toStrictEqual({
      'registry.image_retention_time': '60',
      'aws.vpc.enable_s3_flow_logs': 'false',
      'aws.iam.admin_group': 'Admins',
      'cloud_provider.container_registry.tags': '{}',
    })
  })
})

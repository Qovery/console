import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { initFormValues } from './init-form-values'

const mockAdvancedSettings: ClusterAdvancedSettings = {
  'registry.image_retention_time': 60,
  'aws.vpc.enable_s3_flow_logs': false,
  'aws.iam.admin_group': 'Admins',
  'cloud_provider.container_registry.tags': {},
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
        mockAdvancedSettings
      )
    ).toStrictEqual({
      'registry.image_retention_time': '60',
      'aws.vpc.enable_s3_flow_logs': 'false',
      'aws.iam.admin_group': 'Admins',
      'cloud_provider.container_registry.tags': '{}',
    })
  })
})

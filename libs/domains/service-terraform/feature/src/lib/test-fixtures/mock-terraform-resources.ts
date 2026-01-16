import { type TerraformResource } from '@qovery/shared/interfaces'

export function createMockTerraformResource(overrides: Partial<TerraformResource> = {}): TerraformResource {
  return {
    id: 'res-1',
    resourceType: 'aws_s3_bucket',
    name: 'app_bucket',
    address: 'aws_s3_bucket.app_bucket',
    provider: 'registry.terraform.io/hashicorp/aws',
    mode: 'managed',
    displayName: 'S3 Bucket',
    extractedAt: '2025-01-16T12:00:00Z',
    attributes: {
      id: 'my-app-bucket',
      bucket: 'my-app-bucket',
      region: 'us-east-1',
    },
    keyAttributes: [
      {
        key: 'id',
        value: 'my-app-bucket',
        displayName: 'ID',
      },
    ],
    ...overrides,
  }
}

export const mockS3BucketResource = createMockTerraformResource()

export const mockRdsResource = createMockTerraformResource({
  id: 'res-2',
  resourceType: 'aws_rds_instance',
  name: 'app_db',
  address: 'aws_rds_instance.app_db',
  displayName: 'RDS Instance',
  attributes: {
    id: 'mydb',
    engine: 'mysql',
    db_name: 'appdb',
  },
  keyAttributes: [
    {
      key: 'instance_id',
      value: 'i-123',
      displayName: 'Instance ID',
    },
  ],
})

export const mockEc2Resource = createMockTerraformResource({
  id: 'res-3',
  resourceType: 'aws_instance',
  name: 'web_server',
  address: 'aws_instance.web_server',
  displayName: 'EC2 Instance',
  attributes: {
    instance_type: 't3.micro',
  },
  keyAttributes: [
    {
      key: 'instance_id',
      value: 'i-456',
      displayName: 'Instance ID',
    },
  ],
})

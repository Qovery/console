import { type TerraformResourcesResponse } from '@qovery/shared/interfaces'

/**
 * Mock terraform resources data for development and testing
 */
export const mockTerraformResourcesResponse: TerraformResourcesResponse = {
  resources: [
    {
      id: '29093be8-e073-42eb-824b-2f99c7465172',
      resourceType: 'aws_s3_bucket',
      name: 'app_bucket',
      address: 'aws_s3_bucket.app_bucket',
      provider: 'registry.terraform.io/hashicorp/aws',
      mode: 'managed',
      displayName: 'S3 Bucket',
      extractedAt: '2025-01-15T10:30:00Z',
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
        {
          key: 'bucket',
          value: 'my-app-bucket',
          displayName: 'Bucket Name',
        },
        {
          key: 'region',
          value: 'us-east-1',
          displayName: 'Region',
        },
      ],
    },
    {
      id: 'd6a416da-4cd3-47bf-9f7c-5afbfda35859',
      resourceType: 'aws_rds_instance',
      name: 'app_db',
      address: 'aws_rds_instance.app_db',
      provider: 'registry.terraform.io/hashicorp/aws',
      mode: 'managed',
      displayName: 'RDS Instance',
      extractedAt: '2025-01-15T10:30:00Z',
      attributes: {
        id: 'terraform-20250115103000',
        engine: 'postgres',
        instance_class: 'db.t3.micro',
        allocated_storage: 20,
      },
      keyAttributes: [
        {
          key: 'id',
          value: 'terraform-20250115103000',
          displayName: 'Instance ID',
        },
        {
          key: 'engine',
          value: 'postgres',
          displayName: 'Engine',
        },
        {
          key: 'instance_class',
          value: 'db.t3.micro',
          displayName: 'Instance Class',
        },
        {
          key: 'allocated_storage',
          value: '20',
          displayName: 'Storage (GB)',
        },
      ],
    },
  ],
}

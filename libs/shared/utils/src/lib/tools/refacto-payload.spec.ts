import {
  OrganizationCustomRoleClusterPermission,
  ServiceDeploymentStatusEnum,
  StateEnum,
} from 'qovery-typescript-axios'
import { CloudProviderEnum, DatabaseAccessibilityEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { ContainerApplicationEntity } from '@qovery/shared/interfaces'
import {
  refactoClusterPayload,
  refactoContainerApplicationPayload,
  refactoDatabasePayload,
  refactoGitApplicationPayload,
  refactoOrganizationCustomRolePayload,
  refactoOrganizationPayload,
  refactoPayload,
} from './refacto-payload'

describe('testing payload refactoring', () => {
  it('should remove default values (id, created_at and updated_at)', () => {
    const response = {
      id: '1',
      created_at: '2022-07-21T09:59:42.01426Z',
      updated_at: '2022-07-21T09:59:42.014261Z',
      name: 'hello',
      description: 'test',
    }

    expect(refactoPayload(response)).toEqual({ name: 'hello', description: 'test' })
  })

  it('should remove useless application values', () => {
    const response = {
      id: '1',
      created_at: '',
      updated_at: '',
      status: {
        id: '',
        state: StateEnum.BUILDING,
        service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
      },
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      maximum_cpu: 10,
      maximum_memory: 10,
      git_repository: {
        url: '',
        branch: '',
        root_path: '',
      },
      name: 'hello-2',
      test: 'test',
    }

    expect(refactoGitApplicationPayload(response)).toEqual({
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      git_repository: {
        url: '',
        branch: '',
        root_path: '',
      },
      name: 'hello-2',
    })
  })

  it('should remove useless container values', () => {
    const response: Partial<ContainerApplicationEntity> = {
      id: '1',
      created_at: '',
      updated_at: '',
      environment: {
        id: '1',
      },
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      maximum_cpu: 10,
      maximum_memory: 10,
      name: 'hello-2',
      description: 'test',
      entrypoint: '/',
      cpu: 3000,
      auto_preview: false,
      tag: '1',
      ports: [],
      arguments: [],
      memory: 32,
      max_running_instances: 12,
      min_running_instances: 1,
      registry: {
        id: '1',
      },
      image_name: 'image_name',
    }

    expect(refactoContainerApplicationPayload(response)).toEqual({
      name: 'hello-2',
      description: 'test',
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      ports: [],
      cpu: 3000,
      memory: 32,
      max_running_instances: 12,
      min_running_instances: 1,
      registry_id: '1',
      image_name: 'image_name',
      tag: '1',
      arguments: [],
      entrypoint: '/',
      auto_preview: false,
    })
  })

  it('should remove useless database values', () => {
    const response = databaseFactoryMock(2)[0]
    response.name = 'hello'
    response.description = 'test'
    response.version = '12'
    response.accessibility = DatabaseAccessibilityEnum.PRIVATE
    response.cpu = 1024
    response.memory = 1024
    response.storage = 1024
    response.instance_type = 't2.small'

    expect(refactoDatabasePayload(response)).toEqual({
      name: 'hello',
      description: 'test',
      version: '12',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      cpu: 1024,
      memory: 1024,
      storage: 1024,
      instance_type: 't2.small',
    })
  })

  it('should remove useless organization values', () => {
    const response = {
      id: '1',
      created_at: '',
      updated_at: '',
      name: 'hello',
      description: 'hello world',
      logo_url: 'https://qovery.com',
      website_url: 'https://qovery.com',
      admin_emails: ['test@test.com'],
    }

    expect(refactoOrganizationPayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      logo_url: 'https://qovery.com',
      website_url: 'https://qovery.com',
      admin_emails: ['test@test.com'],
    })
  })

  it('should remove useless organization custom roles values', () => {
    const response = {
      id: '1',
      name: 'hello',
      description: 'hello world',
      cluster_permissions: [
        {
          cluster_name: 'my cluster',
          cluster_id: '1',
          permission: OrganizationCustomRoleClusterPermission.VIEWER,
        },
      ],
      project_permissions: [
        {
          project_id: '1',
          project_name: 'my project',
          is_admin: true,
          permissions: [],
        },
      ],
    }

    expect(refactoOrganizationCustomRolePayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      cluster_permissions: [
        {
          cluster_id: '1',
          permission: OrganizationCustomRoleClusterPermission.VIEWER,
        },
      ],
      project_permissions: [
        {
          project_id: '1',
          is_admin: true,
          permissions: [],
        },
      ],
    })
  })

  it('should remove useless cluster values', () => {
    const response = {
      id: '1',
      created_at: '',
      updated_at: '',
      name: 'hello',
      description: 'hello world',
      region: 'est',
      cloud_provider: CloudProviderEnum.AWS,
      production: false,
    }

    expect(refactoClusterPayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      region: 'est',
      cloud_provider: CloudProviderEnum.AWS,
      production: false,
    })
  })
})

import { DatabaseAccessibilityEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/domains/database'
import { ContainerApplicationEntity } from '@qovery/shared/interfaces'
import { refactoDatabasePayload } from '@qovery/shared/utils'
import {
  refactoContainerApplicationPayload,
  refactoGitApplicationPayload,
  refactoOrganizationPayload,
  refactoPayload,
} from './refacto-payload'

describe('testing payload refactoring', () => {
  it('should remove default values (id, created_at and updated_at)', () => {
    const response = {
      id: '1',
      created_at: new Date(),
      updated_at: new Date(),
      name: 'hello',
    }

    expect(refactoPayload(response)).toEqual({ name: 'hello' })
  })

  it('should remove application values', () => {
    const response: any = {
      id: '1',
      created_at: '',
      updated_at: '',
      environment: '',
      status: '',
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      running_status: '',
      maximum_cpu: 10,
      maximum_memory: 10,
      git_repository: {
        url: '',
        branch: '',
        root_path: '',
      },
      name: 'hello-2',
      test: 'test',
      commits: [],
      links: [],
      instances: [],
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

  it('should remove container values', () => {
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

  it('should remove database values', () => {
    let response = databaseFactoryMock(2)[0]
    response.name = 'hello'
    response.version = '12'
    response.accessibility = DatabaseAccessibilityEnum.PRIVATE
    response.cpu = 1024
    response.memory = 1024
    response.storage = 1024

    expect(refactoDatabasePayload(response)).toEqual({
      name: 'hello',
      version: '12',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      cpu: 1024,
      memory: 1024,
      storage: 1024,
    })
  })

  it('should remove organization values', () => {
    const response: any = {
      id: '1',
      created_at: '',
      updated_at: '',
      name: 'hello',
      description: 'hello world',
      icon_url: 'https://qovery.com',
      logo_url: 'https://qovery.com',
      website_url: 'https://qovery.com',
      admin_emails: ['test@test.com'],
    }

    expect(refactoOrganizationPayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      icon_url: 'https://qovery.com',
      logo_url: 'https://qovery.com',
      website_url: 'https://qovery.com',
      admin_emails: ['test@test.com'],
    })
  })
})

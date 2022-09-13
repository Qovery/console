import { Application, DatabaseAccessibilityEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@console/domains/database'
import { GitApplicationEntity } from '@console/shared/interfaces'
import { refactoDatabasePayload } from '@console/shared/utils'
import { refactoContainerApplicationPayload, refactoGitApplicationPayload, refactoPayload } from './refacto-payload'

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
      name: 'hello-2',
      test: 'test',
      instances: [],
    }

    expect(refactoContainerApplicationPayload(response)).toEqual({
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      name: 'hello-2',
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
})

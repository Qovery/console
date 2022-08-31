import { DatabaseAccessibilityEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@console/domains/database'
import { refactoDatabasePayload } from '@console/shared/utils'
import { refactoApplicationPayload, refactoPayload } from './refacto-payload'

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
    const response = {
      id: '1',
      created_at: new Date(),
      updated_at: new Date(),
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
      maximum_cpu: '',
      maximum_memory: '',
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

    expect(refactoApplicationPayload(response)).toEqual({
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

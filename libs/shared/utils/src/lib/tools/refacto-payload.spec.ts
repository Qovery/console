import { StorageTypeEnum } from 'qovery-typescript-axios'
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
      name: 'hello-2',
      test: 'test',
      storage: [{ mount_point: '', size: 4, type: StorageTypeEnum.FAST_SSD }],
      git_repository: {
        url: '',
        branch: '',
        root_path: '',
      },
    })
  })
})

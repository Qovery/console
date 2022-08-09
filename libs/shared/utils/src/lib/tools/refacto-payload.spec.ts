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
      buildpack_language: '',
      environment: '',
      status: '',
      storage: '',
      running_status: '',
      maximum_cpu: '',
      maximum_memory: '',
      name: 'hello-2',
      test: 'test',
    }

    expect(refactoApplicationPayload(response)).toEqual({ name: 'hello-2', test: 'test' })
  })
})

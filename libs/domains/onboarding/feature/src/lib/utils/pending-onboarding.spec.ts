import { readPendingOnboarding, savePendingOnboarding } from './pending-onboarding'

describe('pending onboarding recovery', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    sessionStorage.clear()
  })

  it('restores completed tracking together with the created organization and project', () => {
    const progress = {
      organizationId: 'organization-id',
      projectId: 'project-id',
      completionTracked: true,
      profile: {
        full_name: 'John Doe',
        company_name: 'Acme',
        phone: '',
        user_email: 'john@acme.com',
        organization_name: 'Acme workspace',
      },
    }

    savePendingOnboarding('user-id', progress)

    expect(readPendingOnboarding('user-id')).toEqual(progress)
  })

  it.each(['invalid JSON', '{}', '{"organizationId":"existing-org","profile":{}}'])(
    'ignores an invalid stored record: %s',
    (value) => {
      sessionStorage.setItem('onboarding-pending:user-id', value)
      expect(readPendingOnboarding('user-id')).toBeUndefined()
    }
  )

  it.each(['setItem', 'removeItem'] as const)('logs a %s failure without blocking in-memory recovery', (method) => {
    const error = new Error('Session storage is unavailable')
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw error
    })
    const progress = {
      organizationId: 'organization-id',
      profile: {
        full_name: 'John Doe',
        company_name: 'Acme',
        phone: '',
        user_email: 'john@acme.com',
        organization_name: 'Acme workspace',
      },
    }

    expect(() => savePendingOnboarding('user-id', method === 'setItem' ? progress : undefined)).not.toThrow()
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})

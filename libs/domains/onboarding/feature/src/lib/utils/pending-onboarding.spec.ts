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

  it('preserves resource IDs from the previous profile fields when resuming', () => {
    sessionStorage.setItem(
      'onboarding-pending:user-id',
      JSON.stringify({
        organizationId: 'existing-org',
        projectId: 'existing-project',
        completionTracked: true,
        profile: { full_name: 'John Doe', company_name: 'Acme', phone: '' },
      })
    )
    expect(readPendingOnboarding('user-id')).toEqual({
      organizationId: 'existing-org',
      projectId: 'existing-project',
      completionTracked: true,
      profile: { full_name: 'John Doe', company_name: 'Acme', phone: '', user_email: '', organization_name: 'Acme' },
    })
  })

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

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
      profile: { full_name: 'John Doe', company_name: 'Acme', phone: '' },
    }

    savePendingOnboarding('user-id', progress)

    expect(readPendingOnboarding('user-id')).toEqual(progress)
  })

  it.each(['setItem', 'removeItem'] as const)('logs a %s failure without blocking in-memory recovery', (method) => {
    const error = new Error('Session storage is unavailable')
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw error
    })
    const progress = {
      organizationId: 'organization-id',
      profile: { full_name: 'John Doe', company_name: 'Acme', phone: '' },
    }

    expect(() => savePendingOnboarding('user-id', method === 'setItem' ? progress : undefined)).not.toThrow()
    expect(consoleError).toHaveBeenCalledWith(error)
  })
})

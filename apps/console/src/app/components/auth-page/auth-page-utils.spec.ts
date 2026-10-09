import { authPageBeforeLoad, clearAuthEntry, readAuthEntry } from './auth-page-utils'

describe('auth entry', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('remembers the screen and redirect of a `?connection=` auto-login', async () => {
    const login = jest.fn().mockResolvedValue(undefined)

    await authPageBeforeLoad({
      page: 'signup',
      auth: { isAuthenticated: false, login },
      search: { connection: 'acme.com', redirect: '/organization/123/overview' },
    })

    expect(login).toHaveBeenCalledWith('/organization/123/overview', 'acme')
    expect(readAuthEntry()).toEqual({ screen: 'signup', redirect: '/organization/123/overview' })
  })

  it('falls back to the login page and the root when nothing was remembered', () => {
    expect(readAuthEntry()).toEqual({ screen: 'login', redirect: '/' })
  })

  it('forgets the entry once cleared', async () => {
    await authPageBeforeLoad({
      page: 'signup',
      auth: { isAuthenticated: false, login: jest.fn().mockResolvedValue(undefined) },
      search: { connection: 'acme.com' },
    })

    clearAuthEntry()

    expect(readAuthEntry()).toEqual({ screen: 'login', redirect: '/' })
  })
})

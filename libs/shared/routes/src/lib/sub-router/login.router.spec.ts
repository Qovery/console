import { SESSION_EXPIRED_REASON, getSafeRedirect, isLoginPath, shouldRedirectAuthenticatedUser } from './login.router'

describe('login router', () => {
  describe('isLoginPath', () => {
    it.each(['/login', '/login/auth0-callback'])('should match %s', (pathname) => {
      expect(isLoginPath(pathname)).toBe(true)
    })

    it.each(['/', '/organization/123', '/loginish'])('should not match %s', (pathname) => {
      expect(isLoginPath(pathname)).toBe(false)
    })
  })

  describe('getSafeRedirect', () => {
    it('should fall back to the root when there is no redirect', () => {
      expect(getSafeRedirect(undefined)).toBe('/')
      expect(getSafeRedirect('')).toBe('/')
    })

    it('should refuse a redirect that points back at the login page', () => {
      expect(getSafeRedirect('/login?redirect=%2F')).toBe('/')
    })

    it('should keep an in-app redirect', () => {
      expect(getSafeRedirect('/organization/123/overview')).toBe('/organization/123/overview')
    })
  })

  describe('shouldRedirectAuthenticatedUser', () => {
    it('should send an authenticated visitor back into the app', () => {
      expect(shouldRedirectAuthenticatedUser({ isAuthenticated: true })).toBe(true)
    })

    it('should keep an anonymous visitor on the login page', () => {
      expect(shouldRedirectAuthenticatedUser({ isAuthenticated: false })).toBe(false)
    })

    it('should keep a visitor whose session expired on the login page even though Auth0 still reports them as authenticated', () => {
      expect(shouldRedirectAuthenticatedUser({ isAuthenticated: true, reason: SESSION_EXPIRED_REASON })).toBe(false)
    })
  })
})

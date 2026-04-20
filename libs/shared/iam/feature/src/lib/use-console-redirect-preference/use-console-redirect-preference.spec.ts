import {
  getNewConsoleUrl,
  getStoredConsolePreference,
  shouldBypassLegacyConsoleRedirect,
} from './use-console-redirect-preference'

describe('useConsoleRedirectPreference', () => {
  beforeEach(() => {
    localStorage.clear()
    document.cookie = 'qovery-console-preference=; Max-Age=0; Path=/'
  })

  it('should return the new console url for legacy console hosts', () => {
    expect(getNewConsoleUrl('https://console.qovery.com/organization/123?foo=bar#hash')).toBe(
      'https://new-console.qovery.com/organization/123?foo=bar#hash'
    )
  })

  it('should return null when current host is not the legacy console', () => {
    expect(getNewConsoleUrl('https://new-console.qovery.com/organization/123')).toBeNull()
    expect(getNewConsoleUrl('http://localhost:4200/organization/123')).toBeNull()
  })

  it('should read the preference from local storage first', () => {
    localStorage.setItem('qovery-console-preference', 'new')
    document.cookie = 'qovery-console-preference=legacy; Path=/'

    expect(getStoredConsolePreference()).toBe('new')
  })

  it('should fallback to cookies when local storage is empty', () => {
    document.cookie = 'qovery-console-preference=new; Path=/'

    expect(getStoredConsolePreference()).toBe('new')
  })

  it('should detect the redirect bypass query param', () => {
    expect(shouldBypassLegacyConsoleRedirect('?legacy=1')).toBe(true)
    expect(shouldBypassLegacyConsoleRedirect('?legacy=0')).toBe(false)
  })
})

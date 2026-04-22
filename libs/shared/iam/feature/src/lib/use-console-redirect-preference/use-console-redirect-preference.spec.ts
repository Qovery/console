import {
  getNewConsolePathname,
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

  it('should migrate legacy application paths to new service paths', () => {
    expect(
      getNewConsolePathname('/organization/org/project/project/environment/environment/application/application/general')
    ).toBe('/organization/org/project/project/environment/environment/service/application/overview')

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/application/application/settings/resources'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/application/settings/resources')
  })

  it('should migrate legacy database paths to new service paths', () => {
    expect(
      getNewConsolePathname('/organization/org/project/project/environment/environment/database/database/general')
    ).toBe('/organization/org/project/project/environment/environment/service/database/overview')

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/database/database/settings/danger-zone'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/database/settings/danger-zone')
  })

  it('should migrate legacy environment services paths to singular service paths', () => {
    expect(getNewConsolePathname('/organization/org/project/project/environment/environment/services/new')).toBe(
      '/organization/org/project/project/environment/environment/service/new'
    )

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/services/create/database/general'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/create/database/general')
  })

  it('should migrate legacy service creation step paths', () => {
    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/services/create/helm/values-override/repository-and-yaml'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/create/helm/values-override-file')

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/services/create/helm/values-override/arguments'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/create/helm/values-override-arguments')

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/services/create/terraform/basic-configuration'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/create/terraform/terraform-configuration')
  })

  it('should migrate legacy monitoring metric creation paths', () => {
    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/application/application/monitoring/metric/cpu'
      )
    ).toBe(
      '/organization/org/project/project/environment/environment/service/application/monitoring/alerts/create/metric/cpu'
    )
  })

  it('should migrate paths while building the new console url', () => {
    expect(
      getNewConsoleUrl(
        'https://console.qovery.com/organization/org/project/project/environment/environment/application/application/general?foo=bar#hash'
      )
    ).toBe(
      'https://new-console.qovery.com/organization/org/project/project/environment/environment/service/application/overview?foo=bar#hash'
    )
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

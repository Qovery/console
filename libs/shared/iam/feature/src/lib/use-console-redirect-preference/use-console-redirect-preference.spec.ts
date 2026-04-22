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

  it('should migrate legacy user settings to the organization overview fallback', () => {
    expect(getNewConsolePathname('/user/general')).toBe('/organization')
  })

  it('should migrate legacy overview aliases to overview routes', () => {
    expect(getNewConsolePathname('/organization/org/audit-logs/general')).toBe('/organization/org/audit-logs')

    expect(getNewConsolePathname('/organization/org/project/project/environments/general')).toBe(
      '/organization/org/project/project/overview'
    )

    expect(
      getNewConsolePathname('/organization/org/project/project/environment/environment/environments/general')
    ).toBe('/organization/org/project/project/environment/environment/overview')

    expect(getNewConsolePathname('/organization/org/project/project/environment/environment/services/general')).toBe(
      '/organization/org/project/project/environment/environment/overview'
    )
  })

  it('should migrate renamed organization sections', () => {
    expect(getNewConsolePathname('/organization/org/alerting/alert-rules')).toBe('/organization/org/alerts/alert-rules')

    expect(getNewConsolePathname('/organization/org/settings/api')).toBe('/organization/org/settings/api-token')
    expect(getNewConsolePathname('/organization/org/settings/credentials')).toBe(
      '/organization/org/settings/cloud-credentials'
    )
    expect(getNewConsolePathname('/organization/org/settings/billing-detail')).toBe(
      '/organization/org/settings/billing-details'
    )
    expect(getNewConsolePathname('/organization/org/settings/webhooks')).toBe('/organization/org/settings/webhook')
  })

  it('should migrate legacy project settings paths', () => {
    expect(getNewConsolePathname('/organization/org/settings/project/project/general')).toBe(
      '/organization/org/project/project/settings/general'
    )

    expect(getNewConsolePathname('/organization/org/settings/project/project/danger-zone')).toBe(
      '/organization/org/project/project/settings/danger-zone'
    )
  })

  it('should migrate legacy cluster paths', () => {
    expect(getNewConsolePathname('/organization/org/clusters/general')).toBe('/organization/org/clusters')
    expect(getNewConsolePathname('/organization/org/clusters/new')).toBe('/organization/org/cluster/new')

    expect(getNewConsolePathname('/organization/org/clusters/create/aws/access')).toBe(
      '/organization/org/cluster/create/aws/general'
    )

    expect(getNewConsolePathname('/organization/org/clusters/create/aws/summary')).toBe(
      '/organization/org/cluster/create/aws/summary'
    )

    expect(getNewConsolePathname('/organization/org/cluster/cluster/logs')).toBe(
      '/organization/org/cluster/cluster/cluster-logs'
    )
  })

  it('should migrate legacy project environment section paths', () => {
    expect(getNewConsolePathname('/organization/org/project/project/environments/variables')).toBe(
      '/organization/org/project/project/variables'
    )

    expect(getNewConsolePathname('/organization/org/project/project/environments/deployment-rules/edit/rule')).toBe(
      '/organization/org/project/project/deployment-rules/edit/rule'
    )
  })

  it('should migrate legacy environment services section paths', () => {
    expect(
      getNewConsolePathname('/organization/org/project/project/environment/environment/services/deployments')
    ).toBe('/organization/org/project/project/environment/environment/deployments')

    expect(getNewConsolePathname('/organization/org/project/project/environment/environment/services/variables')).toBe(
      '/organization/org/project/project/environment/environment/variables'
    )

    expect(
      getNewConsolePathname('/organization/org/project/project/environment/environment/services/settings/rules')
    ).toBe('/organization/org/project/project/environment/environment/settings/deployment-rules')

    expect(
      getNewConsolePathname('/organization/org/project/project/environment/environment/services/settings/pipeline')
    ).toBe('/organization/org/project/project/environment/environment/overview/pipeline')

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/services/settings/preview-environments'
      )
    ).toBe('/organization/org/project/project/environment/environment/settings/preview-environments')
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

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/application/application/monitoring/create/alerts/metric/cpu'
      )
    ).toBe(
      '/organization/org/project/project/environment/environment/service/application/monitoring/alerts/create/metric/cpu'
    )

    expect(
      getNewConsolePathname(
        '/organization/org/project/project/environment/environment/application/application/monitoring/create/alerts'
      )
    ).toBe('/organization/org/project/project/environment/environment/service/application/monitoring/alerts')
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

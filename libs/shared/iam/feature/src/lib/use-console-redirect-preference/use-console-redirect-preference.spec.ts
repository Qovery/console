import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import {
  getLegacyConsoleUrl,
  getNewConsolePathname,
  getNewConsoleUrl,
  getStoredConsolePreference,
  shouldBypassLegacyConsoleRedirect,
  useConsoleRedirectPreference,
} from './use-console-redirect-preference'

const ORGANIZATION_ID = '3d542888-3d2c-474a-b1ad-712556db66da'
const PROJECT_ID = 'd83a2f1f-d90b-461f-9a45-5e8aa2fe2bc0'
const ENVIRONMENT_ID = '857809d7-4e6e-4fa0-8f4e-aff1d8381028'
const CLUSTER_ID = '9f7691a9-40e7-48aa-b11d-749abfd4555d'
const SERVICE_ID = '53a015b0-c6b3-45ce-a958-8d4975368797'
const DATABASE_ID = '51f391cc-9fe0-44a0-98d7-642fd19e01f4'
const DEPLOYMENT_ID = '1284100d-6209-4065-a42d-d60cf5f384cc'
const EXECUTION_ID = 'a199113f-a0a3-44f9-ab6f-bb0fdf5cb4d1'

const ORGANIZATION_PATH = `/organization/${ORGANIZATION_ID}`
const PROJECT_PATH = `${ORGANIZATION_PATH}/project/${PROJECT_ID}`
const ENVIRONMENT_PATH = `${PROJECT_PATH}/environment/${ENVIRONMENT_ID}`

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

  it('should return the legacy console url for new console hosts', () => {
    expect(getLegacyConsoleUrl('https://new-console.qovery.com/organization/123?foo=bar#hash')).toBe(
      'https://console.qovery.com/organization/123?foo=bar#hash'
    )
  })

  it('should return null when current host is not the new console', () => {
    expect(getLegacyConsoleUrl('https://console.qovery.com/organization/123')).toBeNull()
    expect(getLegacyConsoleUrl('http://localhost:4200/organization/123')).toBeNull()
  })

  it('should migrate legacy user settings to the organization overview fallback', () => {
    expect(getNewConsolePathname('/user/general')).toBe('/organization')
  })

  it('should migrate legacy overview aliases to overview routes', () => {
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/audit-logs/general`)).toBe(`${ORGANIZATION_PATH}/audit-logs`)

    expect(getNewConsolePathname(`${PROJECT_PATH}/environments/general`)).toBe(`${PROJECT_PATH}/overview`)

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/environments/general`)).toBe(`${ENVIRONMENT_PATH}/overview`)

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/general`)).toBe(`${ENVIRONMENT_PATH}/overview`)
  })

  it('should migrate renamed organization sections', () => {
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/alerting/alert-rules`)).toBe(
      `${ORGANIZATION_PATH}/alerts/alert-rules`
    )

    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/settings/api`)).toBe(`${ORGANIZATION_PATH}/settings/api-token`)
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/settings/credentials`)).toBe(
      `${ORGANIZATION_PATH}/settings/cloud-credentials`
    )
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/settings/billing-detail`)).toBe(
      `${ORGANIZATION_PATH}/settings/billing-details`
    )
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/settings/webhooks`)).toBe(
      `${ORGANIZATION_PATH}/settings/webhook`
    )
  })

  it('should migrate legacy project settings paths', () => {
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/settings/${PROJECT_ID}/project/general`)).toBe(
      `${PROJECT_PATH}/settings/general`
    )

    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/settings/${PROJECT_ID}/project/danger-zone`)).toBe(
      `${PROJECT_PATH}/settings/danger-zone`
    )
  })

  it('should migrate legacy cluster paths', () => {
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/clusters/general`)).toBe(`${ORGANIZATION_PATH}/clusters`)
    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/clusters/new`)).toBe(`${ORGANIZATION_PATH}/cluster/new`)

    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/clusters/create/aws/access`)).toBe(
      `${ORGANIZATION_PATH}/cluster/create/aws/general`
    )

    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/clusters/create/aws/summary`)).toBe(
      `${ORGANIZATION_PATH}/cluster/create/aws/summary`
    )

    expect(getNewConsolePathname(`${ORGANIZATION_PATH}/cluster/${CLUSTER_ID}/logs`)).toBe(
      `${ORGANIZATION_PATH}/cluster/${CLUSTER_ID}/cluster-logs`
    )
  })

  it('should migrate legacy project environment section paths', () => {
    expect(getNewConsolePathname(`${PROJECT_PATH}/environments/variables`)).toBe(`${PROJECT_PATH}/variables`)

    expect(getNewConsolePathname(`${PROJECT_PATH}/environments/deployment-rules/edit/${DEPLOYMENT_ID}`)).toBe(
      `${PROJECT_PATH}/deployment-rules/edit/${DEPLOYMENT_ID}`
    )
  })

  it('should migrate legacy environment services section paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/deployments`)).toBe(`${ENVIRONMENT_PATH}/deployments`)

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/variables`)).toBe(`${ENVIRONMENT_PATH}/variables`)

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/settings/rules`)).toBe(
      `${ENVIRONMENT_PATH}/settings/deployment-rules`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/settings/pipeline`)).toBe(
      `${ENVIRONMENT_PATH}/overview/pipeline`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/settings/preview-environments`)).toBe(
      `${ENVIRONMENT_PATH}/settings/preview-environments`
    )
  })

  it('should migrate legacy environment logs paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/logs/${SERVICE_ID}/service-logs`)).toBe(
      `${ENVIRONMENT_PATH}/service/${SERVICE_ID}/service-logs`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/logs/${SERVICE_ID}/deployment-logs/${EXECUTION_ID}`)).toBe(
      `${ENVIRONMENT_PATH}/service/${SERVICE_ID}/deployments/logs/${EXECUTION_ID}`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/logs/pre-check-logs/${DEPLOYMENT_ID}`)).toBe(
      `${ENVIRONMENT_PATH}/deployment/${DEPLOYMENT_ID}/pre-check-logs`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/logs/stages/${DEPLOYMENT_ID}`)).toBe(
      `${ENVIRONMENT_PATH}/deployments`
    )
  })

  it('should migrate legacy application paths to new service paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/application/${SERVICE_ID}/general`)).toBe(
      `${ENVIRONMENT_PATH}/service/${SERVICE_ID}/overview`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/application/${SERVICE_ID}/settings/resources`)).toBe(
      `${ENVIRONMENT_PATH}/service/${SERVICE_ID}/settings/resources`
    )
  })

  it('should migrate legacy database paths to new service paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/database/${DATABASE_ID}/general`)).toBe(
      `${ENVIRONMENT_PATH}/service/${DATABASE_ID}/overview`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/database/${DATABASE_ID}/settings/danger-zone`)).toBe(
      `${ENVIRONMENT_PATH}/service/${DATABASE_ID}/settings/danger-zone`
    )
  })

  it('should migrate legacy environment services paths to singular service paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/new`)).toBe(`${ENVIRONMENT_PATH}/service/new`)

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/database/general`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/database/general`
    )
  })

  it('should migrate legacy service creation step aliases', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/cron-job/introduction`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/cron-job/general`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/cron-job/variable`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/cron-job/variables`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/database/post`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/database/summary`
    )
  })

  it('should migrate legacy service creation step paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/helm/values-override/repository-and-yaml`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/helm/values-override-file`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/helm/values-override/arguments`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/helm/values-override-arguments`
    )

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/services/create/terraform/basic-configuration`)).toBe(
      `${ENVIRONMENT_PATH}/service/create/terraform/terraform-configuration`
    )
  })

  it('should migrate legacy monitoring metric creation paths', () => {
    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/application/${SERVICE_ID}/monitoring/metric/cpu`)).toBe(
      `${ENVIRONMENT_PATH}/service/${SERVICE_ID}/monitoring/alerts/create/metric/cpu`
    )

    expect(
      getNewConsolePathname(`${ENVIRONMENT_PATH}/application/${SERVICE_ID}/monitoring/create/alerts/metric/cpu`)
    ).toBe(`${ENVIRONMENT_PATH}/service/${SERVICE_ID}/monitoring/alerts/create/metric/cpu`)

    expect(getNewConsolePathname(`${ENVIRONMENT_PATH}/application/${SERVICE_ID}/monitoring/create/alerts`)).toBe(
      `${ENVIRONMENT_PATH}/service/${SERVICE_ID}/monitoring/alerts`
    )
  })

  it('should migrate paths while building the new console url', () => {
    expect(
      getNewConsoleUrl(`https://console.qovery.com${ENVIRONMENT_PATH}/application/${SERVICE_ID}/general?foo=bar#hash`)
    ).toBe(`https://new-console.qovery.com${ENVIRONMENT_PATH}/service/${SERVICE_ID}/overview?foo=bar#hash`)
  })

  it('should redirect organization fallback targets to the new console root', () => {
    expect(getNewConsoleUrl('https://console.qovery.com/user/general')).toBe('https://new-console.qovery.com/')
    expect(getNewConsoleUrl('https://console.qovery.com/organization')).toBe('https://new-console.qovery.com/')
  })

  it('should read the preference from the shared cookie only', () => {
    // localStorage is per-origin and would be stale across console/new-console subdomains.
    // Regardless of what it contains, the cookie is the only source of truth.
    localStorage.setItem('qovery-console-preference', 'new')
    document.cookie = 'qovery-console-preference=legacy; Path=/'

    expect(getStoredConsolePreference()).toBe('legacy')
  })

  it('should default to legacy when the cookie is not set', () => {
    localStorage.setItem('qovery-console-preference', 'new')

    expect(getStoredConsolePreference()).toBe('legacy')
  })

  it('should purge any stale local storage preference on read', () => {
    localStorage.setItem('qovery-console-preference', 'new')

    getStoredConsolePreference()

    expect(localStorage.getItem('qovery-console-preference')).toBeNull()
  })

  it('should return the preference stored in the cookie', () => {
    document.cookie = 'qovery-console-preference=new; Path=/'

    expect(getStoredConsolePreference()).toBe('new')
  })

  it('should sync preference changes across hook instances', async () => {
    const { result: layoutPreference } = renderHook(() => useConsoleRedirectPreference())
    const { result: userSettingsPreference } = renderHook(() => useConsoleRedirectPreference())

    expect(layoutPreference.current.isNewConsoleDefault).toBe(false)

    act(() => {
      userSettingsPreference.current.setIsNewConsoleDefault(true)
    })

    await waitFor(() => {
      expect(layoutPreference.current.isNewConsoleDefault).toBe(true)
    })
  })

  it('should detect the redirect bypass query param', () => {
    expect(shouldBypassLegacyConsoleRedirect('?legacy=1')).toBe(true)
    expect(shouldBypassLegacyConsoleRedirect('?legacy=0')).toBe(false)
  })
})

import { type ClusterCloudProviderInfo, type ClusterCredentials } from 'qovery-typescript-axios'
import { getCloudProviderInfoRequest, getWidePermissionsRequest } from './save-cluster-credentials'

const credentials = [
  { id: 'static-1', name: 'static-credential', object_type: 'AWS' },
  { id: 'static-2', name: 'other-static-credential', object_type: 'AWS' },
  { id: 'role-1', name: 'role-credential', object_type: 'AWS_ROLE' },
  { id: 'role-2', name: 'other-role-credential', object_type: 'AWS_ROLE' },
] as ClusterCredentials[]

const cloudProviderInfo: ClusterCloudProviderInfo = {
  cloud_provider: 'AWS',
  region: 'eu-west-3',
  credentials: { id: 'static-1', name: 'static-credential' },
  wide_permission_credentials: { id: 'role-1', name: 'role-credential' },
}

describe('getCloudProviderInfoRequest', () => {
  it('should map configured credentials to wide and restricted credentials to credentials when enabled', () => {
    expect(
      getCloudProviderInfoRequest(
        { configured_credentials: 'role-2', restricted_credentials: 'static-2', using_restrictive_permissions: true },
        credentials,
        cloudProviderInfo
      )
    ).toEqual({
      cloud_provider: 'AWS',
      region: 'eu-west-3',
      credentials: { id: 'static-2', name: 'other-static-credential' },
      wide_permission_credentials: { id: 'role-2', name: 'other-role-credential' },
    })
  })

  it('should map configured credentials to credentials when restrictive permissions are off', () => {
    expect(
      getCloudProviderInfoRequest(
        { configured_credentials: 'static-2', restricted_credentials: 'role-2', using_restrictive_permissions: false },
        credentials,
        cloudProviderInfo
      )
    ).toEqual({
      cloud_provider: 'AWS',
      region: 'eu-west-3',
      credentials: { id: 'static-2', name: 'other-static-credential' },
    })
  })

  it('should return undefined when a selected credential is missing', () => {
    expect(
      getCloudProviderInfoRequest({ configured_credentials: 'unknown' }, credentials, cloudProviderInfo)
    ).toBeUndefined()
    expect(
      getCloudProviderInfoRequest(
        { configured_credentials: 'role-1', restricted_credentials: '', using_restrictive_permissions: true },
        credentials,
        cloudProviderInfo
      )
    ).toBeUndefined()
  })
})

describe('getWidePermissionsRequest', () => {
  it('should include a nonblank webhook URL when restrictive permissions are enabled', () => {
    expect(
      getWidePermissionsRequest(
        { using_restrictive_permissions: true, slack_webhook_url: '  https://hooks.slack.test/abc  ' },
        { using_restrictive_permissions: true, wide_scope_cloud_account_id: 'account-123' }
      )
    ).toEqual({
      using_restrictive_permissions: true,
      wide_scope_cloud_account_id: 'account-123',
      slack_webhook_url: 'https://hooks.slack.test/abc',
    })
  })

  it('should clear webhook and wide account values when restrictive permissions are disabled', () => {
    expect(
      getWidePermissionsRequest({
        using_restrictive_permissions: false,
        slack_webhook_url: 'https://hooks.slack.test/abc',
      })
    ).toEqual({
      using_restrictive_permissions: false,
      wide_scope_cloud_account_id: null,
      slack_webhook_url: null,
    })
  })

  it('should send null when the enabled webhook field is blank', () => {
    expect(getWidePermissionsRequest({ using_restrictive_permissions: true, slack_webhook_url: '  ' })).toEqual({
      using_restrictive_permissions: true,
      wide_scope_cloud_account_id: null,
      slack_webhook_url: null,
    })
  })
})

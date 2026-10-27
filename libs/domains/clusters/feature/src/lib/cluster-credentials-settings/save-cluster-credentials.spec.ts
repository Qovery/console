import { type Cluster, type ClusterCloudProviderInfo, type ClusterCredentials } from 'qovery-typescript-axios'
import {
  getCloudProviderInfoRequest,
  getClusterCredentialsFormValuesAfterSave,
  getWidePermissionsRequest,
} from './save-cluster-credentials'

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

describe('getClusterCredentialsFormValuesAfterSave', () => {
  it('should use the mutation responses for the saved form values', () => {
    expect(
      getClusterCredentialsFormValuesAfterSave({
        formValues: {
          configured_credentials: 'stale-wide-id',
          restricted_credentials: 'stale-restricted-id',
          using_restrictive_permissions: true,
          slack_webhook_url: 'https://hooks.slack.test/old',
        },
        editedCluster: {
          wide_permissions: { using_restrictive_permissions: true, slack_webhook_url: 'https://hooks.slack.test/new' },
        } as Cluster,
        editedCloudProviderInfo: {
          ...cloudProviderInfo,
          credentials: { id: 'saved-restricted-id', name: 'saved-restricted' },
          wide_permission_credentials: { id: 'saved-wide-id', name: 'saved-wide' },
        },
      })
    ).toEqual({
      configured_credentials: 'saved-wide-id',
      restricted_credentials: 'saved-restricted-id',
      using_restrictive_permissions: true,
      slack_webhook_url: 'https://hooks.slack.test/new',
    })
  })

  it('should retain submitted values when the save plan skipped a mutation', () => {
    expect(
      getClusterCredentialsFormValuesAfterSave({
        formValues: {
          configured_credentials: 'submitted-credential',
          restricted_credentials: 'unused-restricted-credential',
          using_restrictive_permissions: true,
          slack_webhook_url: 'https://hooks.slack.test/submitted',
        },
      })
    ).toEqual({
      configured_credentials: 'submitted-credential',
      restricted_credentials: 'unused-restricted-credential',
      using_restrictive_permissions: true,
      slack_webhook_url: 'https://hooks.slack.test/submitted',
    })
  })

  it('should clear wide-permission form values when the saved cluster has restrictive permissions off', () => {
    expect(
      getClusterCredentialsFormValuesAfterSave({
        formValues: {
          configured_credentials: 'submitted-credential',
          restricted_credentials: 'old-restricted-credential',
          using_restrictive_permissions: true,
          slack_webhook_url: 'https://hooks.slack.test/old',
        },
        editedCluster: {
          wide_permissions: {
            using_restrictive_permissions: false,
            wide_scope_cloud_account_id: null,
            slack_webhook_url: null,
          },
        } as Cluster,
      })
    ).toEqual({
      configured_credentials: 'submitted-credential',
      restricted_credentials: undefined,
      using_restrictive_permissions: false,
      slack_webhook_url: '',
    })
  })
})

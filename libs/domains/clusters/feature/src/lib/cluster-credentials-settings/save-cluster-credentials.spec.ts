import { type ClusterCloudProviderInfo, type ClusterCredentials } from 'qovery-typescript-axios'
import {
  getCloudProviderInfoRequest,
  getClusterCredentialsSavePlan,
  saveClusterCredentials,
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
  it('should send the restrictive and extended credentials when restrictive permissions are on', () => {
    expect(
      getCloudProviderInfoRequest(
        { credentials: 'static-2', wide_permission_credentials: 'role-2', using_restrictive_permissions: true },
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

  it('should not send the extended credentials when restrictive permissions are off', () => {
    expect(
      getCloudProviderInfoRequest(
        { credentials: 'static-2', wide_permission_credentials: 'role-2', using_restrictive_permissions: false },
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
    expect(getCloudProviderInfoRequest({ credentials: 'unknown' }, credentials, cloudProviderInfo)).toBeUndefined()
    expect(
      getCloudProviderInfoRequest(
        { credentials: 'static-1', wide_permission_credentials: '', using_restrictive_permissions: true },
        credentials,
        cloudProviderInfo
      )
    ).toBeUndefined()
  })
})

describe('getClusterCredentialsSavePlan', () => {
  const initialFormValues = {
    credentials: 'static-1',
    wide_permission_credentials: 'role-1',
    using_restrictive_permissions: true,
  }

  it.each([
    {
      case: 'restrictive credentials changed',
      formValues: { ...initialFormValues, credentials: 'static-2' },
      initialUsingRestrictivePermissions: true,
      expected: { shouldEditCluster: false, shouldEditCloudProviderInfo: true, shouldRedeploy: true },
    },
    {
      case: 'restrictive credentials and toggle changed',
      formValues: { ...initialFormValues, credentials: 'static-2', using_restrictive_permissions: false },
      initialUsingRestrictivePermissions: true,
      expected: { shouldEditCluster: true, shouldEditCloudProviderInfo: true, shouldRedeploy: true },
    },
    {
      case: 'toggle turned off only',
      formValues: { ...initialFormValues, using_restrictive_permissions: false },
      initialUsingRestrictivePermissions: true,
      expected: { shouldEditCluster: true, shouldEditCloudProviderInfo: false, shouldRedeploy: false },
    },
    {
      case: 'extended credentials changed only',
      formValues: { ...initialFormValues, wide_permission_credentials: 'role-2' },
      initialUsingRestrictivePermissions: true,
      expected: { shouldEditCluster: false, shouldEditCloudProviderInfo: true, shouldRedeploy: false },
    },
    {
      case: 'toggle turned on with extended credentials',
      formValues: { ...initialFormValues, wide_permission_credentials: 'role-2' },
      initialUsingRestrictivePermissions: false,
      expected: { shouldEditCluster: true, shouldEditCloudProviderInfo: true, shouldRedeploy: false },
    },
    {
      case: 'nothing changed',
      formValues: initialFormValues,
      initialUsingRestrictivePermissions: true,
      expected: { shouldEditCluster: false, shouldEditCloudProviderInfo: true, shouldRedeploy: false },
    },
  ])('should plan the save when $case', ({ formValues, initialUsingRestrictivePermissions, expected }) => {
    expect(
      getClusterCredentialsSavePlan({ formValues, cloudProviderInfo, initialUsingRestrictivePermissions })
    ).toEqual(expected)
  })

  it('should ignore extended credentials while restrictive permissions are off', () => {
    expect(
      getClusterCredentialsSavePlan({
        formValues: {
          credentials: 'static-1',
          wide_permission_credentials: 'role-2',
          using_restrictive_permissions: false,
        },
        cloudProviderInfo,
        initialUsingRestrictivePermissions: false,
      })
    ).toEqual({ shouldEditCluster: false, shouldEditCloudProviderInfo: true, shouldRedeploy: false })
  })
})

describe('saveClusterCredentials', () => {
  const plan = { shouldEditCluster: true, shouldEditCloudProviderInfo: true, shouldRedeploy: true }

  it('should update the cluster, then the cloud provider info, then redeploy', async () => {
    const calls: string[] = []
    await saveClusterCredentials({
      plan,
      editCluster: async () => calls.push('editCluster'),
      editCloudProviderInfo: async () => calls.push('editCloudProviderInfo'),
      deployCluster: async () => calls.push('deployCluster'),
    })

    expect(calls).toEqual(['editCluster', 'editCloudProviderInfo', 'deployCluster'])
  })

  it('should not update the cloud provider info nor redeploy when the cluster update fails', async () => {
    const editCloudProviderInfo = jest.fn()
    const deployCluster = jest.fn()

    await expect(
      saveClusterCredentials({
        plan,
        editCluster: () => Promise.reject(new Error('cluster update failed')),
        editCloudProviderInfo,
        deployCluster,
      })
    ).rejects.toThrow('cluster update failed')

    expect(editCloudProviderInfo).not.toHaveBeenCalled()
    expect(deployCluster).not.toHaveBeenCalled()
  })

  it('should not redeploy when the cloud provider info update fails', async () => {
    const deployCluster = jest.fn()

    await expect(
      saveClusterCredentials({
        plan,
        editCluster: jest.fn().mockResolvedValue(undefined),
        editCloudProviderInfo: () => Promise.reject(new Error('credentials update failed')),
        deployCluster,
      })
    ).rejects.toThrow('credentials update failed')

    expect(deployCluster).not.toHaveBeenCalled()
  })

  it('should only run the planned steps', async () => {
    const editCluster = jest.fn()
    const editCloudProviderInfo = jest.fn()
    const deployCluster = jest.fn()

    await saveClusterCredentials({
      plan: { shouldEditCluster: true, shouldEditCloudProviderInfo: false, shouldRedeploy: false },
      editCluster,
      editCloudProviderInfo,
      deployCluster,
    })

    expect(editCluster).toHaveBeenCalledTimes(1)
    expect(editCloudProviderInfo).not.toHaveBeenCalled()
    expect(deployCluster).not.toHaveBeenCalled()
  })
})

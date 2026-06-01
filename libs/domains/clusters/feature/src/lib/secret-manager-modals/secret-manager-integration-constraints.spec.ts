import { CloudVendorEnum, type Cluster, type SecretManagerAccess } from 'qovery-typescript-axios'
import { getSecretManagerIntegrationConstraints } from './secret-manager-integration-constraints'
import { type SecretManagerOption } from './secret-manager-integration.types'

const awsOption: SecretManagerOption = {
  value: 'AWS_SECRET_MANAGER',
  label: 'AWS Secret manager',
  icon: 'AWS',
  typeLabel: 'AWS Secret manager',
}

const gcpOption: SecretManagerOption = {
  value: 'GCP_SECRET_MANAGER',
  label: 'GCP Secret manager',
  icon: 'GCP',
  typeLabel: 'GCP Secret manager',
}

const awsCluster = { cloud_provider: CloudVendorEnum.AWS } as Cluster
const installedAwsCluster: Cluster = {
  ...awsCluster,
  infrastructure_outputs: {
    kind: 'EKS',
    cluster_name: 'my-cluster',
    cluster_arn: 'arn:aws:eks:eu-west-3:123456789012:cluster/my-cluster',
    cluster_oidc_issuer: 'https://oidc.eks.eu-west-3.amazonaws.com/id/1234567890',
    vpc_id: 'vpc-1234567890',
  },
}
const gcpCluster = { cloud_provider: CloudVendorEnum.GCP } as Cluster

const awsStaticIntegration = {
  id: 'sm-static',
  endpoint: { mode: 'AWS_SECRET_MANAGER' },
  authentication: { mode: 'AWS_STATIC_CREDENTIALS' },
} as SecretManagerAccess

const awsAssumeRoleIntegration = {
  id: 'sm-sts',
  endpoint: { mode: 'AWS_SECRET_MANAGER' },
  authentication: { mode: 'AWS_ROLE_ARN' },
} as SecretManagerAccess

const awsAutomaticIntegration = {
  id: 'sm-auto',
  endpoint: { mode: 'AWS_SECRET_MANAGER' },
  authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
} as SecretManagerAccess

const gcpAutomaticIntegration = {
  id: 'sm-gcp-auto',
  endpoint: { mode: 'GCP_SECRET_MANAGER' },
  authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
} as SecretManagerAccess

describe('getSecretManagerIntegrationConstraints', () => {
  it('should allow all AWS options when no integration exists yet', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...installedAwsCluster, secret_manager_accesses: [] },
    })

    expect(constraints.activeProvider).toBe('aws')
    expect(constraints.aws?.automatic.disabled).toBe(false)
    expect(constraints.aws?.manual.disabled).toBe(false)
    expect(constraints.navigation.defaultTab).toBe('automatic')
    expect(constraints.aws?.manual.authenticationTypeSelect.options.map((option) => option.value)).toEqual([
      'AWS_ROLE_ARN',
      'AWS_STATIC_CREDENTIALS',
    ])
    expect(constraints.aws?.manual.authenticationTypeSelect.disabled).toBe(false)
    expect(constraints.aws?.manual.authenticationTypeSelect.defaultValue).toBeUndefined()
    expect(constraints.defaultAuthenticationMode).toBeUndefined()
  })

  it('should disable assume role when the cluster has not been successfully deployed yet', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [] },
    })

    expect(constraints.aws?.manual.authenticationTypeSelect.options).toEqual([
      {
        label: 'Assume role via STS',
        value: 'AWS_ROLE_ARN',
        isDisabled: true,
        disabledTooltip:
          'The cluster must be successfully deployed before setting up a Secret Manager with Assume role via STS.',
      },
      { label: 'Static credentials', value: 'AWS_STATIC_CREDENTIALS' },
    ])
    expect(constraints.aws?.manual.authenticationTypeSelect.defaultValue).toBe('AWS_STATIC_CREDENTIALS')
    expect(constraints.defaultAuthenticationMode).toBe('AWS_STATIC_CREDENTIALS')
  })

  it('should disable assume role when infrastructure outputs do not include a cluster OIDC issuer', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: {
        ...installedAwsCluster,
        infrastructure_outputs: {
          ...installedAwsCluster.infrastructure_outputs,
          cluster_oidc_issuer: '',
        },
        secret_manager_accesses: [],
      },
    })

    expect(constraints.aws?.manual.authenticationTypeSelect.options[0]).toEqual({
      label: 'Assume role via STS',
      value: 'AWS_ROLE_ARN',
      isDisabled: true,
      disabledTooltip:
        'The cluster must be successfully deployed before setting up a Secret Manager with Assume role via STS.',
    })
    expect(constraints.aws?.manual.authenticationTypeSelect.defaultValue).toBe('AWS_STATIC_CREDENTIALS')
  })

  it('should only allow static credentials when an automatic AWS integration already exists', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [awsAutomaticIntegration] },
    })

    expect(constraints.aws?.automatic.disabled).toBe(true)
    expect(constraints.aws?.automatic.disabledTooltip).toBe(
      'Static credentials are the only available option while an automatic integration is configured.'
    )
    expect(constraints.navigation.defaultTab).toBe('manual')
    expect(constraints.aws?.manual.authenticationTypeSelect.options).toEqual([
      { label: 'Static credentials', value: 'AWS_STATIC_CREDENTIALS' },
    ])
    expect(constraints.aws?.manual.authenticationTypeSelect.disabled).toBe(true)
    expect(constraints.aws?.manual.authenticationTypeSelect.defaultValue).toBe('AWS_STATIC_CREDENTIALS')
    expect(constraints.defaultAuthenticationMode).toBe('AWS_STATIC_CREDENTIALS')
  })

  it('should only allow static credentials when an assume role AWS integration already exists', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [awsAssumeRoleIntegration] },
    })

    expect(constraints.aws?.automatic.disabled).toBe(true)
    expect(constraints.aws?.automatic.disabledTooltip).toBe(
      'Static credentials are the only available option while an assume role integration is configured.'
    )
    expect(constraints.aws?.manual.authenticationTypeSelect.options).toEqual([
      { label: 'Static credentials', value: 'AWS_STATIC_CREDENTIALS' },
    ])
    expect(constraints.aws?.manual.authenticationTypeSelect.disabled).toBe(true)
    expect(constraints.defaultAuthenticationMode).toBe('AWS_STATIC_CREDENTIALS')
  })

  it('should allow assume role and automatic when only static AWS integrations exist', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [awsStaticIntegration] },
    })

    expect(constraints.aws?.automatic.disabled).toBe(false)
    expect(constraints.aws?.manual.authenticationTypeSelect.options.map((option) => option.value)).toEqual([
      'AWS_ROLE_ARN',
      'AWS_STATIC_CREDENTIALS',
    ])
  })

  it('should keep assume role editable when editing an existing assume role integration', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [awsAssumeRoleIntegration] },
      mode: 'edit',
      initialValues: awsAssumeRoleIntegration,
    })

    expect(constraints.aws?.manual.authenticationTypeSelect.options.map((option) => option.value)).toEqual([
      'AWS_ROLE_ARN',
      'AWS_STATIC_CREDENTIALS',
    ])
    expect(constraints.aws?.manual.authenticationTypeSelect.disabled).toBe(false)
  })

  it('should open the manual tab when editing an existing static credentials integration', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [awsStaticIntegration] },
      mode: 'edit',
      initialValues: awsStaticIntegration,
    })

    expect(constraints.aws?.automatic.disabled).toBe(false)
    expect(constraints.navigation.defaultTab).toBe('manual')
    expect(constraints.defaultAuthenticationMode).toBe('AWS_STATIC_CREDENTIALS')
  })

  it('should keep automatic tab available when editing the existing automatic integration', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: awsOption,
      cluster: { ...awsCluster, secret_manager_accesses: [awsAutomaticIntegration] },
      mode: 'edit',
      initialValues: awsAutomaticIntegration,
    })

    expect(constraints.aws?.automatic.disabled).toBe(false)
    expect(constraints.navigation.defaultTab).toBe('automatic')
  })

  it('should disable GCP automatic tab when another automatic GCP integration exists', () => {
    const constraints = getSecretManagerIntegrationConstraints({
      option: gcpOption,
      cluster: { ...gcpCluster, secret_manager_accesses: [gcpAutomaticIntegration] },
    })

    expect(constraints.activeProvider).toBe('gcp')
    expect(constraints.gcp?.automatic.disabled).toBe(true)
    expect(constraints.gcp?.automatic.disabledTooltip).toBe(
      'Automatic integration is unavailable because an automatic integration is already configured.'
    )
    expect(constraints.gcp?.manual.disabled).toBe(false)
    expect(constraints.navigation.defaultTab).toBe('manual')
    expect(constraints.aws).toBeNull()
  })
})

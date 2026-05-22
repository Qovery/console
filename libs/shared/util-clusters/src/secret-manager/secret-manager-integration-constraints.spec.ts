import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { hasAwsAutomaticIntegrationConfigured } from './hasAwsAutomaticIntegrationConfigured'
import { hasAwsManualStsIntegrationConfigured } from './hasAwsManualStsIntegrationConfigured'
import { hasGcpAutomaticIntegrationConfigured } from './hasGcpAutomaticIntegrationConfigured'

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

const gcpJsonIntegration = {
  id: 'sm-gcp-json',
  endpoint: { mode: 'GCP_SECRET_MANAGER' },
  authentication: { mode: 'GCP_JSON_CREDENTIALS' },
} as SecretManagerAccess

describe('secret manager integration constraints', () => {
  it('should not treat static credentials as an assume role integration', () => {
    expect(hasAwsManualStsIntegrationConfigured([awsStaticIntegration])).toBe(false)
  })

  it('should detect assume role integrations', () => {
    expect(hasAwsManualStsIntegrationConfigured([awsAssumeRoleIntegration])).toBe(true)
  })

  it('should detect automatic AWS integrations', () => {
    expect(hasAwsAutomaticIntegrationConfigured([awsAutomaticIntegration])).toBe(true)
    expect(hasAwsAutomaticIntegrationConfigured([awsStaticIntegration])).toBe(false)
  })

  it('should detect automatic GCP integrations only for GCP secret managers', () => {
    expect(hasGcpAutomaticIntegrationConfigured([gcpJsonIntegration])).toBe(false)
    expect(
      hasGcpAutomaticIntegrationConfigured([
        {
          ...gcpJsonIntegration,
          authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
        },
      ])
    ).toBe(true)
  })
})

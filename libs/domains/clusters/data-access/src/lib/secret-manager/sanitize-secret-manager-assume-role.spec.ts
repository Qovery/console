import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { sanitizeSecretManagerAssumeRole } from './sanitize-secret-manager-assume-role'

const baseSecretManager = {
  name: 'cross-account',
  endpoint: { mode: 'AWS_PARAMETER_STORE', region: 'eu-west-3' },
} as Pick<SecretManagerAccess, 'name' | 'endpoint'>

const roleArnSecretManager = (assumeRole?: { role_arn?: string; external_id?: string | null } | null) =>
  ({
    ...baseSecretManager,
    authentication: {
      mode: 'AWS_ROLE_ARN',
      role_arn: 'arn:aws:iam::111111111111:role/base',
      assume_role: assumeRole,
    },
  }) as SecretManagerAccess

describe('sanitizeSecretManagerAssumeRole', () => {
  it('should keep the assume role and external id of a role ARN authentication', () => {
    const result = sanitizeSecretManagerAssumeRole(
      roleArnSecretManager({ role_arn: 'arn:aws:iam::222222222222:role/reader', external_id: 'prod-eu-1' })
    )

    expect(result.authentication).toEqual({
      mode: 'AWS_ROLE_ARN',
      role_arn: 'arn:aws:iam::111111111111:role/base',
      assume_role: { role_arn: 'arn:aws:iam::222222222222:role/reader', external_id: 'prod-eu-1' },
    })
  })

  it('should drop an empty external id', () => {
    const result = sanitizeSecretManagerAssumeRole(
      roleArnSecretManager({ role_arn: 'arn:aws:iam::222222222222:role/reader', external_id: '' })
    )

    expect(result.authentication).toEqual({
      mode: 'AWS_ROLE_ARN',
      role_arn: 'arn:aws:iam::111111111111:role/base',
      assume_role: { role_arn: 'arn:aws:iam::222222222222:role/reader' },
    })
  })

  it('should drop the assume role when its role ARN is empty', () => {
    const result = sanitizeSecretManagerAssumeRole(roleArnSecretManager({ role_arn: '', external_id: 'prod-eu-1' }))

    expect(result.authentication).toEqual({
      mode: 'AWS_ROLE_ARN',
      role_arn: 'arn:aws:iam::111111111111:role/base',
      assume_role: undefined,
    })
  })

  it('should drop an assume role left over from another authentication type', () => {
    const secretManager = {
      ...baseSecretManager,
      authentication: {
        mode: 'AWS_STATIC_CREDENTIALS',
        region: 'eu-west-3',
        access_key: 'AKIA',
        secret_key: 'secret',
        assume_role: { role_arn: 'arn:aws:iam::222222222222:role/reader' },
      },
    } as unknown as SecretManagerAccess

    const result = sanitizeSecretManagerAssumeRole(secretManager)

    expect(result.authentication).toEqual({
      mode: 'AWS_STATIC_CREDENTIALS',
      region: 'eu-west-3',
      access_key: 'AKIA',
      secret_key: 'secret',
    })
    expect(secretManager.authentication).toHaveProperty('assume_role')
  })

  it('should return other authentications unchanged', () => {
    const secretManager = {
      ...baseSecretManager,
      authentication: { mode: 'AUTOMATICALLY_CONFIGURED' },
    } as SecretManagerAccess

    expect(sanitizeSecretManagerAssumeRole(secretManager)).toBe(secretManager)
  })
})

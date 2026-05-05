import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'

export const getReadableSecretManagerAuth = (secretManager: SecretManagerAccess | undefined) => {
  return match(secretManager?.authentication.mode)
    .with('AUTOMATICALLY_CONFIGURED', () => 'Automatic')
    .with('AWS_ROLE_ARN', () => 'Assume role via STS')
    .with('AWS_STATIC_CREDENTIALS', () => 'Static credentials')
    .with('GCP_JSON_CREDENTIALS', () => 'JSON credentials')
    .with(P.nullish, () => undefined)
    .exhaustive()
}

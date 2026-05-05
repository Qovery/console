import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'

export const getReadableSecretManagerProvider = (secretManager: SecretManagerAccess | undefined) => {
  return match(secretManager?.endpoint?.mode)
    .with('AWS_SECRET_MANAGER', () => 'AWS Secret manager')
    .with('AWS_PARAMETER_STORE', () => 'AWS Parameter store')
    .with('GCP_SECRET_MANAGER', () => 'GCP Secret manager')
    .with(P.nullish, () => undefined)
    .exhaustive()
}

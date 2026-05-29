import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'

export const getSecretManagerProvider = (
  secretManager: SecretManagerAccess | undefined
): 'AWS' | 'GCP' | undefined =>
  match(secretManager?.endpoint?.mode)
    .with('AWS_PARAMETER_STORE', 'AWS_SECRET_MANAGER', () => 'AWS' as const)
    .with('GCP_SECRET_MANAGER', () => 'GCP' as const)
    .with(P.nullish, () => undefined)
    .exhaustive()

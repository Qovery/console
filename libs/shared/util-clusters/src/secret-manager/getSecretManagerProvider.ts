import { type SecretManagerAccess } from 'qovery-typescript-axios'

export const getSecretManagerProvider = (secretManager: SecretManagerAccess | undefined) =>
  secretManager?.endpoint?.mode?.includes('AWS') ? 'AWS' : 'GCP'

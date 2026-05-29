import { type SecretManagerAccess } from 'qovery-typescript-axios'

export const isGcpSecretManager = (secretManager: SecretManagerAccess | undefined) =>
  secretManager?.endpoint?.mode === 'GCP_SECRET_MANAGER'

import { type SecretManagerAccess } from 'qovery-typescript-axios'

export const isAwsSecretManager = (secretManager: SecretManagerAccess | undefined) =>
  secretManager?.endpoint?.mode === 'AWS_SECRET_MANAGER'

import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { isAwsSecretManager } from './is-aws-secret-manager'

export const hasAwsAutomaticIntegrationConfigured = (secretManagers: SecretManagerAccess[]) =>
  secretManagers.some(
    (secretManager) =>
      isAwsSecretManager(secretManager) && secretManager.authentication.mode === 'AUTOMATICALLY_CONFIGURED'
  )

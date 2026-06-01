import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { isGcpSecretManager } from './is-gcp-secret-manager'

export const hasGcpAutomaticIntegrationConfigured = (secretManagers: SecretManagerAccess[]) =>
  secretManagers.some(
    (secretManager) =>
      isGcpSecretManager(secretManager) && secretManager.authentication.mode === 'AUTOMATICALLY_CONFIGURED'
  )

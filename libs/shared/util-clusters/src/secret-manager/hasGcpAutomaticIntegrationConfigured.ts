import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { isGcpSecretManager } from './isGcpSecretManager'

export const hasGcpAutomaticIntegrationConfigured = (secretManagers: SecretManagerAccess[]) =>
  secretManagers.some(
    (secretManager) =>
      isGcpSecretManager(secretManager) && secretManager.authentication.mode === 'AUTOMATICALLY_CONFIGURED'
  )

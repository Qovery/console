import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { isAwsSecretManager } from './is-aws-secret-manager'

export const hasAwsManualStsIntegrationConfigured = (secretManagers: SecretManagerAccess[]) =>
  secretManagers.some(
    (secretManager) => isAwsSecretManager(secretManager) && secretManager.authentication.mode === 'AWS_ROLE_ARN'
  )

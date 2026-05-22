import { type SecretManagerAccess } from 'qovery-typescript-axios'

export const excludeSecretManagerAccess = (
  secretManagers: SecretManagerAccess[],
  secretManagerId: string | undefined
) => (secretManagerId ? secretManagers.filter((secretManager) => secretManager.id !== secretManagerId) : secretManagers)

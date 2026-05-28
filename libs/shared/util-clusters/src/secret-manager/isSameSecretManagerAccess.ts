import { type SecretManagerAccess } from 'qovery-typescript-axios'

export const isSameSecretManagerAccess = (
  secretManager: SecretManagerAccess,
  targetSecretManager: SecretManagerAccess
) => {
  if (secretManager.id && targetSecretManager.id) {
    return secretManager.id === targetSecretManager.id
  }

  // New integrations do not get a backend id until the cluster is saved.
  return secretManager === targetSecretManager
}

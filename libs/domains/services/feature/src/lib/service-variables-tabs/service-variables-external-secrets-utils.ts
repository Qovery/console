import { type SecretManagerAccess, type VariableResponse } from 'qovery-typescript-axios'
import { getSecretManagerProvider } from '@qovery/shared/util-clusters'
import { generateScopeLabel } from '@qovery/shared/util-js'

export type SyncStatus = 'synced' | 'broken' | 'detached'

export interface ExternalSecretRow {
  id: string
  name: string
  description?: string
  filePath?: string
  isFile?: boolean
  reference: string
  status: SyncStatus
  source: string | null
  sourceIcon?: 'aws' | 'gcp'
  scope: string
}

export function mapVariableToExternalSecretRow(
  variable: VariableResponse,
  secretManagers: SecretManagerAccess[]
): ExternalSecretRow {
  const secretManager = secretManagers.find((manager) => manager.id === variable.secret_manager_access_id)
  const provider = secretManager ? getSecretManagerProvider(secretManager) : undefined

  return {
    id: variable.id,
    name: variable.key,
    description: variable.description,
    filePath: variable.mount_path ?? undefined,
    isFile: Boolean(variable.mount_path),
    reference: variable.value ?? '',
    status: variable.secret_manager_access_id ? 'synced' : 'detached',
    source: secretManager?.name ?? null,
    sourceIcon: provider === 'AWS' ? 'aws' : provider === 'GCP' ? 'gcp' : undefined,
    scope: generateScopeLabel(variable.scope),
  }
}

export function isExternalSecretVariable(variable: VariableResponse) {
  return variable.variable_type === 'EXTERNAL_SECRET'
}

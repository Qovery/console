import { type SecretManagerAccess } from 'qovery-typescript-axios'
import { getSecretManagerProvider } from '@qovery/domains/clusters/data-access'
import { type VariableScope } from '@qovery/domains/variables/data-access'
import { generateScopeLabel } from '@qovery/shared/util-js'

// UI model only. Replace the local preview storage when the API contract is available.
// Reference metadata only: never fetch or store the JSON secret's contents.
export interface ExternalSecretJSON {
  id: string
  name: string
  reference: string
  description?: string
  isJson: true
  keyPrefix?: string
  source: string | null
  sourceIcon?: 'AWS' | 'GCP'
  secretManagerAccessId?: string
  scope: string
  previewParentId: string
}

// TODO(secret-manager-json): REMOVE BEFORE PRODUCTION: this entire fixture, its export, and its usages in the variables tab and service creation.
export function createJsonSecretPreview(
  parentId: string,
  scope: VariableScope,
  manager?: SecretManagerAccess
): ExternalSecretJSON[] {
  if (
    window.location.hostname !== 'localhost' ||
    !['ddb7eba1-a074-485f-b8f2-a7c1c2ad5719', 'a40ee878-05a1-434c-adba-0c03ed54a4bd'].includes(parentId)
  )
    return []

  return [
    {
      id: 'local-json-example',
      name: 'Lucis application secrets',
      reference: 'lucis/production/application',
      description: 'Example JSON secret reference.',
      isJson: true,
      source: manager?.name ?? 'Example secret manager',
      sourceIcon: getSecretManagerProvider(manager),
      secretManagerAccessId: manager?.id,
      scope: generateScopeLabel(scope),
      previewParentId: parentId,
    },
  ]
}

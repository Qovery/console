import { type BlueprintItem } from 'qovery-typescript-axios'

const BLUEPRINT_NAME_PARTS: Record<string, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  rabbitmq: 'RabbitMQ',
  rds: 'RDS',
  s3: 'S3',
}

const CLUSTER_AGNOSTIC_BLUEPRINT_PROVIDERS = new Set(['EXTERNAL', 'HELM'])

export function formatBlueprintName(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => {
      const normalizedPart = part.toLowerCase()

      return BLUEPRINT_NAME_PARTS[normalizedPart] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    })
    .join(' ')
}

/**
 * The catalog's stable name is an identifier. Prefer its optional display name
 * when available, while preserving the label generated for older catalog entries.
 */
export function getBlueprintDisplayName(blueprint: BlueprintItem): string {
  const { displayName } = blueprint as BlueprintItem & { displayName?: string }

  return displayName || formatBlueprintName(blueprint.name)
}

export function getBlueprintPrimaryCategory(blueprint: BlueprintItem): string {
  const { primaryCategory } = blueprint as BlueprintItem & { primaryCategory?: string }

  return primaryCategory || 'Other'
}

export function isBlueprintCompatibleWithCluster(blueprintProvider: string, clusterCloudProvider?: string): boolean {
  if (!clusterCloudProvider) return true

  const normalizedBlueprintProvider = blueprintProvider.toUpperCase()

  return (
    CLUSTER_AGNOSTIC_BLUEPRINT_PROVIDERS.has(normalizedBlueprintProvider) ||
    normalizedBlueprintProvider === clusterCloudProvider.toUpperCase()
  )
}

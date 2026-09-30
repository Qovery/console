import { type BlueprintDetailsResponse, type BlueprintItem } from 'qovery-typescript-axios'
import { type AnyService, isBlueprintService } from '@qovery/domains/services/data-access'

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

export const OTHER_BLUEPRINT_CATEGORY = 'Other'

export type RdsBlueprintEngine = 'MYSQL' | 'POSTGRESQL'

/** Only catalog RDS blueprints backed by Terraform can use the RDS CloudWatch dashboard. */
export function getRdsBlueprintEngine(
  service?: AnyService,
  blueprint?: BlueprintDetailsResponse
): RdsBlueprintEngine | undefined {
  if (
    !service ||
    !isBlueprintService(service) ||
    service.service_type !== 'TERRAFORM' ||
    blueprint?.id !== service.blueprint_id ||
    blueprint.service_id !== service.id ||
    blueprint.service_type !== 'TERRAFORM' ||
    blueprint.catalog_url.replace(/\.git$/, '') !== 'https://github.com/Qovery/service-catalog'
  ) {
    return undefined
  }

  const segments = blueprint.tag.split('/')
  if (segments.length !== 4) return undefined
  const [provider, family, major, version] = segments
  if (provider !== 'AWS' || !major || !version) return undefined

  if (family === 'mysql') return 'MYSQL'
  if (family === 'postgres') return 'POSTGRESQL'
  return undefined
}

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
 * The catalog's stable name is an identifier. Prefer its customer-facing display name,
 * while preserving the label generated for stale cached catalog entries.
 */
export function getBlueprintDisplayName(blueprint: BlueprintItem): string {
  return blueprint.displayName || formatBlueprintName(blueprint.name)
}

export function getBlueprintPrimaryCategory(blueprint: BlueprintItem): string {
  return blueprint.primaryCategory || OTHER_BLUEPRINT_CATEGORY
}

export function isBlueprintCompatibleWithCluster(blueprintProvider: string, clusterCloudProvider?: string): boolean {
  if (!clusterCloudProvider) return true

  const normalizedBlueprintProvider = blueprintProvider.toUpperCase()

  return (
    CLUSTER_AGNOSTIC_BLUEPRINT_PROVIDERS.has(normalizedBlueprintProvider) ||
    normalizedBlueprintProvider === clusterCloudProvider.toUpperCase()
  )
}

import { type Database } from '@qovery/domains/services/data-access'

/**
 * Generates the RDS database instance identifier from service properties
 * Format: z{first_part_of_id}-{type_lowercase}
 * Example: "b4b3b048-9605-4ca5-9518-8cd2df85f734" + "POSTGRESQL" -> "zb4b3b048-postgresql"
 */
export function generateDbInstance(service: Database): string {
  const idPrefix = service.id.split('-')[0] // Get first part before first dash
  const typeInLowercase = service.type.toLowerCase()

  return `z${idPrefix}-${typeInLowercase}`
}

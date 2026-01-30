import { type TerraformResource } from '@qovery/domains/service-terraform/data-access'

export function matchesSearch(resource: TerraformResource, query: string): boolean {
  const lowerQuery = query.toLowerCase()

  if (resource.name.toLowerCase().includes(lowerQuery)) return true
  if (resource.resourceType.toLowerCase().includes(lowerQuery)) return true
  if (resource.displayName.toLowerCase().includes(lowerQuery)) return true
  if (resource.address.toLowerCase().includes(lowerQuery)) return true

  const attributeKeys = Object.keys(resource.attributes)
  if (attributeKeys.some((key) => key.toLowerCase().includes(lowerQuery))) return true

  const attributeValues = Object.values(resource.attributes).map((v) => String(v))
  if (attributeValues.some((val) => val.toLowerCase().includes(lowerQuery))) return true

  return false
}

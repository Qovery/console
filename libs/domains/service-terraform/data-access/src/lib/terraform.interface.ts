/**
 * Terraform resource interfaces for displaying infrastructure resources
 * created by Terraform deployments in the Qovery Console.
 */

export interface TerraformResource {
  id: string
  resourceType: string
  name: string
  address: string
  provider: string
  mode: string
  attributes: Record<string, unknown>
  extractedAt: string
  displayName: string
}

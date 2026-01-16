/**
 * Terraform resource interfaces for displaying infrastructure resources
 * created by Terraform deployments in the Qovery Console.
 */

export interface TerraformResourceKeyAttribute {
  key: string
  value: string
  displayName: string
}

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
  keyAttributes: TerraformResourceKeyAttribute[]
}

export interface TerraformResourcesResponse {
  resources: TerraformResource[]
}

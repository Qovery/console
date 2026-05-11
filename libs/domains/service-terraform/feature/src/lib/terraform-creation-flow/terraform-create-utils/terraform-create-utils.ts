import { serviceTemplates } from '@qovery/domains/services/feature'

export interface TerraformTemplateMatch {
  templateTitle?: string
  iconUri?: string
}

export function findTerraformTemplateMatch(template?: string): TerraformTemplateMatch {
  if (!template) {
    return {}
  }

  const terraformTemplate = serviceTemplates.find((serviceTemplate) => serviceTemplate.slug === template)

  return {
    templateTitle: terraformTemplate?.title,
    iconUri: terraformTemplate?.icon_uri,
  }
}

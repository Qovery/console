import { serviceTemplates } from '@qovery/domains/services/feature'

export interface HelmTemplateMatch {
  templateTitle?: string
  iconUri?: string
}

export function findHelmTemplateMatch(template?: string): HelmTemplateMatch {
  if (!template) {
    return {}
  }

  const helmTemplate = serviceTemplates.find((serviceTemplate) => serviceTemplate.slug === template)

  return {
    templateTitle: helmTemplate?.title,
    iconUri: helmTemplate?.icon_uri,
  }
}

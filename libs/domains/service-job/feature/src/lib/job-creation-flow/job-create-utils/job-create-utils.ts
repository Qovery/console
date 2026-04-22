import { serviceTemplates } from '@qovery/domains/services/feature'

export const findTemplateData = (slug?: string, option?: string) => {
  return serviceTemplates.flatMap((template) => {
    if (template.slug === slug && !template.options) {
      return template
    }

    if (template.slug === slug && template.options?.length) {
      return template.options.find((o) => o.slug === option)
    }

    return []
  })[0]
}

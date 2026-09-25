import { type PlatformTemplateComponentResponse, type PlatformTemplateSummaryResponse } from 'qovery-typescript-axios'

export type ProfileComponent = PlatformTemplateComponentResponse & {
  id: string
  label: string
}

export type ProfileTreeItem = {
  id: string
  label: string
  description?: string | null
  status: 'disabled' | 'success' | 'warning'
  children: readonly ProfileComponent[]
}

export function formatProfileLabel(value: string) {
  const label = value.replace(/[-_]+/g, ' ').trim().toLowerCase()
  return label ? `${label[0].toUpperCase()}${label.slice(1)}` : value
}

export function getProfileTree(template: PlatformTemplateSummaryResponse | undefined): ProfileTreeItem[] {
  return (
    template?.layers.map((layer) => {
      const label = formatProfileLabel(layer.key)
      const normalizedLabel = label.toLowerCase()
      const isDisabled = normalizedLabel === 'infrastructure' || normalizedLabel === 'qovery stack'

      return {
        id: layer.key,
        label,
        description: layer.description,
        status: isDisabled ? 'disabled' : normalizedLabel === 'gateway api' ? 'warning' : 'success',
        children: layer.components.map((component) => ({
          ...component,
          id: `${layer.key}/${component.key}`,
          key: component.key,
          label: formatProfileLabel(component.key),
        })),
      }
    }) ?? []
  )
}

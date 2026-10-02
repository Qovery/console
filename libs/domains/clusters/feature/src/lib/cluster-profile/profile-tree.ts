import {
  type ClusterPlatformBindingLayerResponse,
  type PlatformTemplateComponentResponse,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'

export type ProfileComponent = PlatformTemplateComponentResponse & {
  id: string
  label: string
  // Without fields of its own or sourced from another component, there is nothing to configure.
  configurable: boolean
}

export type ProfileTreeItem = {
  id: string
  label: string
  description?: string | null
  status: 'disabled' | 'success'
  // Why a disabled layer cannot be opened.
  disabledReason?: string
  configurable: boolean
  children: readonly ProfileComponent[]
}

export function isProfileComponentConfigurable(component: PlatformTemplateComponentResponse) {
  return component.fields.length > 0 || Boolean(component.configurationSections?.length)
}

// The component a layer opens on: its first configurable one, if any.
export function getFirstConfigurableComponent(components: readonly ProfileComponent[] | undefined) {
  return components?.find((component) => component.configurable) ?? components?.[0]
}

export function formatProfileLabel(value: string) {
  const label = value.replace(/[-_]+/g, ' ').trim().toLowerCase()
  return label ? `${label[0].toUpperCase()}${label.slice(1)}` : value
}

export const SKIPPED_LAYER_REASON = 'This layer does not apply to this cluster'
export const QOVERY_MANAGED_LAYER_REASON = 'These values are currently managed by Qovery'

// A DISABLED layer is managed by Qovery and read-only for the customer.
function getLayerDisabledReason(resolvedLayer?: ClusterPlatformBindingLayerResponse) {
  if (resolvedLayer?.status === 'SKIPPED') return SKIPPED_LAYER_REASON
  if (resolvedLayer?.status === 'DISABLED') return QOVERY_MANAGED_LAYER_REASON
  return undefined
}

// Layer statuses come from the cluster configuration, resolved by q-core against the cluster mode and provider.
export function getProfileTree(
  template: PlatformTemplateSummaryResponse | undefined,
  resolvedLayers: readonly ClusterPlatformBindingLayerResponse[] = []
): ProfileTreeItem[] {
  return (
    template?.layers.map((layer) => {
      const label = formatProfileLabel(layer.key)
      const disabledReason = getLayerDisabledReason(resolvedLayers.find(({ key }) => key === layer.key))
      const isDisabled = Boolean(disabledReason)
      const children = layer.components.map((component) => ({
        ...component,
        id: `${layer.key}/${component.key}`,
        key: component.key,
        label: formatProfileLabel(component.key),
        configurable: isProfileComponentConfigurable(component),
      }))

      return {
        id: layer.key,
        label,
        description: layer.description,
        status: isDisabled ? 'disabled' : 'success',
        disabledReason,
        configurable: children.some((component) => component.configurable),
        children,
      }
    }) ?? []
  )
}

function findProfileComponent(profileTree: ProfileTreeItem[], requestedKey?: string) {
  if (!requestedKey) return undefined

  return profileTree
    .flatMap((item) => item.children ?? [])
    .find((component) => component.key === requestedKey || component.id === requestedKey)
}

function findProfileLayer(profileTree: ProfileTreeItem[], requestedKey?: string) {
  if (!requestedKey) return undefined

  return profileTree.find((item) => item.id === requestedKey)
}

// Skipped or Qovery-managed layers, and layers with nothing to configure, cannot be opened.
const isOpenableLayer = (item: ProfileTreeItem) => item.status !== 'disabled' && item.configurable

function getDefaultProfileComponent(profileTree: ProfileTreeItem[]) {
  return getFirstConfigurableComponent(
    (
      profileTree.find((item) => item.label.toLowerCase() === 'log infra' && isOpenableLayer(item)) ??
      profileTree.find(isOpenableLayer) ??
      profileTree.find((item) => item.children?.length)
    )?.children
  )
}

export function resolveProfileSelection(profileTree: ProfileTreeItem[], requestedKey?: string) {
  const requestedComponent = findProfileComponent(profileTree, requestedKey)
  const requestedLayer =
    findProfileLayer(profileTree, requestedKey) ??
    profileTree.find((item) => item.children?.some((child) => child.id === requestedComponent?.id))
  // The URL cannot open what the sidebar disables: a disabled layer falls back to the default selection, and a
  // component with nothing to configure to the first configurable component of its layer.
  const openableLayer = requestedLayer && isOpenableLayer(requestedLayer) ? requestedLayer : undefined
  const openableComponent = openableLayer && requestedComponent?.configurable ? requestedComponent : undefined
  const defaultComponent = getDefaultProfileComponent(profileTree)
  const layer =
    openableLayer ?? profileTree.find((item) => item.children?.some((child) => child.id === defaultComponent?.id))

  return {
    layer,
    component:
      openableComponent ?? (openableLayer ? getFirstConfigurableComponent(openableLayer.children) : defaultComponent),
  }
}

import {
  type ClusterPlatformBindingResponse,
  type PlatformCloudVendor,
  type PlatformClusterMode,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Accordion, Badge, Button, Checkbox, Heading, Icon } from '@qovery/shared/ui'
import { formatCatalogKey } from '@qovery/shared/util-js'
import { hasConfigurableFields } from './platform-configuration-utils'

interface PlatformConfigurationCatalogProps {
  binding: ClusterPlatformBindingResponse | null | undefined
  cloudProvider?: PlatformCloudVendor
  clusterMode?: PlatformClusterMode
  componentsConfigurable?: boolean
  description?: string
  layerSelections: Record<string, boolean>
  isSaving: boolean
  onComponentSelect: (componentKey: string) => void
  onLayerSelectionChange: (layerKey: string, enabled: boolean) => void
  onPrevious?: () => void
  onSave: () => void
  saveLabel?: string
  template: PlatformTemplateSummaryResponse
}

function layerStatusColor(status: ClusterPlatformBindingResponse['layers'][number]['status']) {
  return match(status)
    .with('ENABLED', () => 'green' as const)
    .with('DISABLED', () => 'neutral' as const)
    .with('SKIPPED', () => 'yellow' as const)
    .exhaustive()
}

export function PlatformConfigurationCatalog({
  binding,
  cloudProvider,
  clusterMode,
  componentsConfigurable = true,
  description = 'Enable the layers to include in the next cluster deployment, then configure their components.',
  layerSelections,
  isSaving,
  onComponentSelect,
  onLayerSelectionChange,
  onPrevious,
  onSave,
  saveLabel = 'Save layers',
  template,
}: PlatformConfigurationCatalogProps) {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={2}>Platform layers</Heading>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </div>

      <Accordion.Root
        className="flex flex-col gap-3"
        type="multiple"
        defaultValue={template.layers.map((layer) => layer.key)}
      >
        {template.layers.map((layer) => {
          const bindingLayer = binding?.layers.find((candidate) => candidate.key === layer.key)
          const applicableToCluster =
            (!clusterMode || layer.modes.includes(clusterMode)) &&
            (!cloudProvider || !layer.providers?.length || layer.providers.includes(cloudProvider))
          const skipped = bindingLayer?.status === 'SKIPPED' || !applicableToCluster
          const resolvedEnabled = bindingLayer ? bindingLayer.status === 'ENABLED' : undefined
          const enabled =
            !skipped && (layer.mandatory || (layerSelections[layer.key] ?? resolvedEnabled ?? layer.enabledByDefault))
          const status = skipped ? 'SKIPPED' : enabled ? 'ENABLED' : 'DISABLED'

          return (
            <Accordion.Item
              key={layer.key}
              value={layer.key}
              className="overflow-hidden rounded-lg border border-neutral"
            >
              <Accordion.Trigger className="min-h-12 w-full justify-between gap-3 px-4 py-3">
                <span className="flex flex-1 flex-wrap items-center gap-2 text-left">
                  <span className="font-medium text-neutral">{formatCatalogKey(layer.key)}</span>
                  <Badge size="sm" variant="surface" color={layer.mandatory ? 'brand' : 'neutral'}>
                    {layer.mandatory ? 'Mandatory' : 'Optional'}
                  </Badge>
                </span>
                <Badge size="sm" variant="surface" color={layerStatusColor(status)}>
                  {formatCatalogKey(status)}
                </Badge>
              </Accordion.Trigger>
              <Accordion.Content className="border-t border-neutral px-4 py-3">
                {layer.description ? <p className="mb-3 text-sm text-neutral-subtle">{layer.description}</p> : null}

                {layer.providers?.length ? (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {layer.providers?.map((provider) => (
                      <Badge key={provider} size="sm" variant="surface" color="neutral">
                        {formatCatalogKey(provider)}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {!layer.mandatory ? (
                  <div className="mb-3 flex items-start gap-2 rounded-md bg-surface-neutral-subtle p-3">
                    <Checkbox
                      id={`platform-layer-${layer.key}`}
                      checked={enabled}
                      disabled={skipped}
                      onCheckedChange={(checked) => {
                        if (checked === 'indeterminate') return
                        onLayerSelectionChange(layer.key, checked)
                      }}
                    />
                    <label htmlFor={`platform-layer-${layer.key}`} className="cursor-pointer text-sm text-neutral">
                      Enable this layer
                    </label>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  {layer.components.map((component) => {
                    const content = (
                      <>
                        <span>
                          <span className="block">{formatCatalogKey(component.key)}</span>
                          {component.description ? (
                            <span className="mt-0.5 block text-ssm font-normal text-neutral-subtle">
                              {component.description}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <Badge size="sm" variant="surface" color="neutral">
                            {formatCatalogKey(component.kind)}
                          </Badge>
                          {componentsConfigurable && hasConfigurableFields(component) ? (
                            <Icon iconName="chevron-right" className="text-xs text-neutral-subtle" />
                          ) : null}
                        </span>
                      </>
                    )

                    return componentsConfigurable && hasConfigurableFields(component) ? (
                      <Button
                        key={component.key}
                        type="button"
                        variant="outline"
                        color="neutral"
                        disabled={!enabled}
                        className="h-auto min-h-10 w-full justify-between px-3 py-2 text-left"
                        onClick={() => onComponentSelect(component.key)}
                      >
                        {content}
                      </Button>
                    ) : (
                      <div
                        key={component.key}
                        className="flex min-h-10 w-full items-center justify-between rounded border border-neutral px-3 py-2 text-left text-sm text-neutral"
                      >
                        {content}
                      </div>
                    )
                  })}
                </div>

                {skipped ? (
                  <p className="mt-3 text-ssm text-neutral-subtle">
                    {bindingLayer?.reason ?? 'Not applicable to this cluster.'}
                  </p>
                ) : null}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>

      <div className="flex justify-between border-t border-neutral pt-4">
        {onPrevious ? (
          <Button type="button" size="lg" color="neutral" variant="plain" onClick={onPrevious}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" size="lg" loading={isSaving} onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}

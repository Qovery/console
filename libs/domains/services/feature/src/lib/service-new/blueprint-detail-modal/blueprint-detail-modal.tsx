import { Badge, Button, Heading, Icon, Section } from '@qovery/shared/ui'
import {
  type BlueprintEntry,
  CATEGORY_LABELS,
  ENGINE_LABELS,
  PROVIDER_CONFIG,
} from '../blueprints'

export interface BlueprintDetailModalProps {
  blueprint: BlueprintEntry
  onClose: () => void
  onUse: (blueprintId: string) => void
}

export function BlueprintDetailModal({ blueprint, onClose, onUse }: BlueprintDetailModalProps) {
  const providerCfg = PROVIDER_CONFIG[blueprint.provider]

  return (
    <Section className="p-6">
      {/* Header zone */}
      <div className="mb-6">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-neutral-component">
            {providerCfg.icon ? (
              <img src={providerCfg.icon} alt={providerCfg.label} className="h-6 w-6 select-none object-contain" />
            ) : (
              <Icon iconName="layer-group" className="text-base text-brand" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <Heading className="text-2xl text-neutral">{blueprint.name}</Heading>
          </div>
          {blueprint.isNew && (
            <Badge size="sm" color="brand" variant="surface">
              New
            </Badge>
          )}
        </div>
        <p className="text-sm leading-normal text-neutral-subtle">{blueprint.description}</p>

        {/* Metadata strip */}
        <div className="mt-4 flex flex-wrap items-center gap-1">
          <Badge size="sm" color={providerCfg.color} variant="surface">
            {providerCfg.label}
          </Badge>
          <Badge size="sm" color="neutral" variant="outline">
            {ENGINE_LABELS[blueprint.engine]}
          </Badge>
          {blueprint.categories.map((cat) => (
            <Badge key={cat} size="sm" color="neutral" variant="outline">
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Available versions */}
      <div className="mb-6">
        <Heading className="mb-3 text-base">Available versions</Heading>
        <div className="overflow-hidden rounded-lg border border-neutral">
          {blueprint.versions.map((v, i) => (
            <div
              key={v.version}
              className="flex items-center justify-between border-b border-neutral px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-neutral">v{v.version}</span>
                {i === 0 && (
                  <Badge size="sm" color="brand" variant="surface">
                    Latest
                  </Badge>
                )}
              </div>
              <span className="font-mono text-xs text-neutral-subtle">{v.releaseDate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="-mx-6 flex justify-end gap-2 border-t border-neutral px-6 pt-4">
        <Button size="lg" color="neutral" variant="surface" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="lg"
          color="brand"
          variant="solid"
          radius="rounded"
          onClick={() => {
            onUse(blueprint.id)
            onClose()
          }}
        >
          Use this blueprint
        </Button>
      </div>
    </Section>
  )
}

export default BlueprintDetailModal

import { useState } from 'react'
import { Badge, Button, Callout, Icon, Tooltip } from '@qovery/shared/ui'
import { type BlueprintEntry, PROVIDER_CONFIG } from '../blueprints'

export interface BlueprintServiceContextCardProps {
  blueprint: BlueprintEntry
  /** Version currently deployed for this service. */
  currentVersion: string
  /** A new blueprint version available within the same major track — null = up to date. */
  updateAvailable: { version: string; releaseDate: string } | null
  /** A newer major service version exists in the catalog (e.g. Postgres 17 vs current 15). */
  majorVersionAvailable: { name: string } | null
  /** Source repo URL for this blueprint. */
  sourceUrl?: string
  onUpdate: () => void
  onDetach?: () => void
}

export function BlueprintServiceContextCard({
  blueprint,
  currentVersion,
  updateAvailable,
  majorVersionAvailable,
  sourceUrl,
  onUpdate,
  onDetach,
}: BlueprintServiceContextCardProps) {
  const [dismissedUpdate, setDismissedUpdate] = useState(false)
  const [dismissedMajor, setDismissedMajor] = useState(false)
  const providerCfg = PROVIDER_CONFIG[blueprint.provider]

  const showUpdateNotice = updateAvailable && !dismissedUpdate
  const showMajorNotice = majorVersionAvailable && !dismissedMajor

  return (
    <div className="flex flex-col gap-3">
      {/* Identity strip */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral bg-surface-neutral-subtle px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-neutral-component">
            {providerCfg.icon ? (
              <img src={providerCfg.icon} alt={providerCfg.label} className="h-5 w-5 select-none object-contain" />
            ) : (
              <Icon iconName="layer-group" className="text-sm text-brand" />
            )}
          </span>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral">{blueprint.name}</span>
              <Badge size="sm" color="neutral" variant="outline">
                <span className="font-mono">v{currentVersion}</span>
              </Badge>
            </div>
            <span className="text-xs text-neutral-subtle">Provisioned from blueprint</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {sourceUrl && (
            <Tooltip content="Open blueprint source" side="top">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open blueprint source"
                className="flex h-7 w-7 items-center justify-center rounded text-neutral-subtle hover:bg-surface-neutral-component hover:text-neutral"
              >
                <Icon iconName="arrow-up-right-from-square" iconStyle="regular" className="text-xs" />
              </a>
            </Tooltip>
          )}
          {onDetach && (
            <Tooltip content="Detach from blueprint (coming soon)" side="top">
              <span>
                <Button
                  size="sm"
                  color="neutral"
                  variant="plain"
                  radius="rounded"
                  onClick={onDetach}
                  disabled
                  aria-label="Detach from blueprint"
                >
                  <Icon iconName="link-slash" iconStyle="regular" />
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Update notice — actionable, distinguished from purely-informational major notice */}
      {showUpdateNotice && updateAvailable && (
        <Callout.Root color="green">
          <Callout.Icon>
            <Icon iconName="arrow-up" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>
              Update available — <span className="font-mono">v{updateAvailable.version}</span>
            </Callout.TextHeading>
            <Callout.TextDescription>
              A new version of this blueprint is available within your current major service version track. Released{' '}
              {updateAvailable.releaseDate}.
            </Callout.TextDescription>
          </Callout.Text>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button size="sm" color="brand" variant="solid" radius="rounded" onClick={onUpdate}>
              Review update
            </Button>
            <Button
              size="sm"
              color="neutral"
              variant="plain"
              radius="rounded"
              aria-label="Dismiss update notice"
              onClick={() => setDismissedUpdate(true)}
            >
              <Icon iconName="xmark" iconStyle="regular" />
            </Button>
          </div>
        </Callout.Root>
      )}

      {/* Major version notification — informational only */}
      {showMajorNotice && majorVersionAvailable && (
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>{majorVersionAvailable.name} is now in the catalog</Callout.TextHeading>
            <Callout.TextDescription>
              The major service version cannot be changed for an existing service. To use it, provision a new service
              from the catalog.
            </Callout.TextDescription>
          </Callout.Text>
          <div className="ml-auto flex shrink-0 items-center">
            <Button
              size="sm"
              color="neutral"
              variant="plain"
              radius="rounded"
              aria-label="Dismiss notification"
              onClick={() => setDismissedMajor(true)}
            >
              <Icon iconName="xmark" iconStyle="regular" />
            </Button>
          </div>
        </Callout.Root>
      )}
    </div>
  )
}

export default BlueprintServiceContextCard

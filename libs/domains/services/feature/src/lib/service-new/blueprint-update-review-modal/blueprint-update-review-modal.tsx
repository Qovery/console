import { useState } from 'react'
import { Badge, Button, Callout, Heading, Icon, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { type BlueprintEntry } from '../blueprints'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UpdateChange {
  kind: 'added' | 'changed' | 'removed'
  category: 'config' | 'infrastructure'
  label: string
  before?: string
  after?: string
  /** Field had a user override that conflicts with a new default. */
  hasOverride?: boolean
}

export interface NewSetupParameter {
  id: string
  label: string
  helper?: string
  required?: boolean
  defaultValue?: string
}

export interface BlueprintUpdateReviewModalProps {
  blueprint: BlueprintEntry
  /** The version currently deployed for this service. */
  currentVersion: string
  /** Default target — the latest in the major track. User can switch via selector. */
  defaultTargetVersion: string
  /** Mock change set keyed by target version. Real impl: fetched from API. */
  changesByTargetVersion: Record<string, UpdateChange[]>
  /** Mock new-setup params keyed by target version. Empty = skip the setup phase. */
  newSetupByTargetVersion: Record<string, NewSetupParameter[]>
  onCancel: () => void
  onApprove: (targetVersion: string, newSetupValues: Record<string, string>) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BlueprintUpdateReviewModal({
  blueprint,
  currentVersion,
  defaultTargetVersion,
  changesByTargetVersion,
  newSetupByTargetVersion,
  onCancel,
  onApprove,
}: BlueprintUpdateReviewModalProps) {
  const [phase, setPhase] = useState<'review' | 'setup'>('review')
  const [targetVersion, setTargetVersion] = useState(defaultTargetVersion)
  const [setupValues, setSetupValues] = useState<Record<string, string>>({})

  const changes = changesByTargetVersion[targetVersion] ?? []
  const newSetupParams = newSetupByTargetVersion[targetVersion] ?? []
  const hasNewSetup = newSetupParams.length > 0

  const versionOptions = blueprint.versions
    // Show only versions equal to or newer than the current one — and the current too, for revert.
    .map((v) => ({
      value: v.version,
      label:
        v.version === blueprint.versions[0]?.version
          ? `${v.version} (latest)`
          : v.version === currentVersion
            ? `${v.version} (current)`
            : v.version,
    }))

  const added = changes.filter((c) => c.kind === 'added')
  const changed = changes.filter((c) => c.kind === 'changed')
  const removed = changes.filter((c) => c.kind === 'removed')
  const hasDestructive = removed.length > 0

  const handleContinue = () => {
    if (hasNewSetup) {
      setPhase('setup')
    } else {
      onApprove(targetVersion, {})
    }
  }

  const handleApproveSetup = () => {
    // Validate required fields
    const missing = newSetupParams.filter((p) => p.required && !(setupValues[p.id] || p.defaultValue))
    if (missing.length > 0) return
    onApprove(targetVersion, setupValues)
  }

  return (
    <Section className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Heading className="text-2xl text-neutral">
            {phase === 'review' ? `Update ${blueprint.name}` : 'New parameters'}
          </Heading>
          <p className="mt-1 text-sm text-neutral-subtle">
            {phase === 'review' ? (
              <>
                Review what changes between <span className="font-mono text-xs">v{currentVersion}</span>
                {' → '}
                <span className="font-mono text-xs">v{targetVersion}</span>.
              </>
            ) : (
              <>This version introduces parameters that need your input before deploying.</>
            )}
          </p>
        </div>
      </div>

      {phase === 'review' && (
        <>
          {/* Target version selector */}
          <div className="mb-6">
            <InputSelect
              label="Target version"
              value={targetVersion}
              onChange={(v) => typeof v === 'string' && setTargetVersion(v)}
              options={versionOptions}
              hint="Pin to an older version, jump ahead, or revert."
            />
          </div>

          {/* Destructive callout */}
          {hasDestructive && (
            <div className="mb-4">
              <Callout.Root color="red">
                <Callout.Icon>
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Destructive changes</Callout.TextHeading>
                  <Callout.TextDescription>
                    {removed.length} resource{removed.length !== 1 && 's'} will be removed when you deploy. This cannot
                    be undone.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            </div>
          )}

          {/* Change groups */}
          <div className="flex flex-col gap-3">
            {added.length > 0 && <ChangeGroup title="Added" tone="positive" changes={added} />}
            {changed.length > 0 && <ChangeGroup title="Changed" tone="neutral" changes={changed} />}
            {removed.length > 0 && <ChangeGroup title="Removed" tone="negative" changes={removed} />}
            {changes.length === 0 && (
              <p className="text-sm text-neutral-subtle">No changes detected for this version jump.</p>
            )}
          </div>

          {/* Footer */}
          <div className="-mx-6 mt-6 flex justify-end gap-2 border-t border-neutral px-6 pt-4">
            <Button size="lg" color="neutral" variant="surface" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="lg" color="brand" variant="solid" radius="rounded" onClick={handleContinue}>
              {hasNewSetup ? 'Continue' : 'Apply update'}
            </Button>
          </div>
        </>
      )}

      {phase === 'setup' && (
        <>
          <div className="flex flex-col gap-4">
            {newSetupParams.map((p) => (
              <InputText
                key={p.id}
                name={p.id}
                label={p.label}
                value={setupValues[p.id] ?? p.defaultValue ?? ''}
                onChange={(e) => setSetupValues((s) => ({ ...s, [p.id]: e.target.value }))}
                hint={p.helper}
                error={p.required && !(setupValues[p.id] || p.defaultValue) ? 'Required.' : undefined}
              />
            ))}
          </div>

          <div className="-mx-6 mt-6 flex justify-between gap-2 border-t border-neutral px-6 pt-4">
            <Button size="lg" color="neutral" variant="surface" onClick={() => setPhase('review')}>
              Back
            </Button>
            <Button size="lg" color="brand" variant="solid" radius="rounded" onClick={handleApproveSetup}>
              Apply update
            </Button>
          </div>
        </>
      )}
    </Section>
  )
}

// ─── ChangeGroup ─────────────────────────────────────────────────────────────

function ChangeGroup({
  title,
  tone,
  changes,
}: {
  title: string
  tone: 'positive' | 'neutral' | 'negative'
  changes: UpdateChange[]
}) {
  const indicator =
    tone === 'positive' ? (
      <Badge size="sm" color="green" variant="surface">
        + Added
      </Badge>
    ) : tone === 'negative' ? (
      <Badge size="sm" color="red" variant="surface">
        − Removed
      </Badge>
    ) : (
      <Badge size="sm" color="neutral" variant="surface">
        ~ Changed
      </Badge>
    )

  return (
    <div className="overflow-hidden rounded-lg border border-neutral">
      <div className="flex items-center gap-2 border-b border-neutral bg-surface-neutral-subtle px-4 py-2">
        {indicator}
        <span className="text-xs text-neutral-subtle">
          {changes.length} {title.toLowerCase()}
        </span>
      </div>
      <div className="px-4">
        {changes.map((c, i) => (
          <div
            key={`${c.label}-${i}`}
            className="flex items-start justify-between gap-4 border-b border-neutral py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral">{c.label}</span>
                {c.hasOverride && (
                  <Badge size="sm" color="yellow" variant="surface">
                    Override preserved
                  </Badge>
                )}
                <span className="text-xs text-neutral-subtle">
                  {c.category === 'config' ? 'Config' : 'Infrastructure'}
                </span>
              </div>
              {(c.before !== undefined || c.after !== undefined) && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {c.before !== undefined && (
                    <code className="rounded bg-surface-neutral-component px-1 text-neutral-subtle line-through">
                      {c.before}
                    </code>
                  )}
                  {c.before !== undefined && c.after !== undefined && (
                    <Icon iconName="arrow-right" iconStyle="regular" className="text-xs text-neutral-subtle" />
                  )}
                  {c.after !== undefined && (
                    <code className="rounded bg-surface-neutral-component px-1 text-neutral">{c.after}</code>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BlueprintUpdateReviewModal

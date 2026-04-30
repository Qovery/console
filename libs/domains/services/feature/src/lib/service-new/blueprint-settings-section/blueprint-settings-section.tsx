import { useState } from 'react'
import { Button, Heading, Icon, InputSelect, InputText, Section, Tooltip } from '@qovery/shared/ui'
import { type BlueprintEntry } from '../blueprints'

export interface BlueprintSettingsSectionProps {
  blueprint: BlueprintEntry
  /** The version currently deployed for this service. */
  currentVersion: string
  /** The major service version the service was provisioned with — fixed at creation. */
  majorServiceVersion: string
  /** Triggered when the user selects a different blueprint version — enters the version flexibility flow. */
  onVersionChange: (targetVersion: string) => void
  onViewDetails: () => void
  onDetach?: () => void
}

export function BlueprintSettingsSection({
  blueprint,
  currentVersion,
  majorServiceVersion,
  onVersionChange,
  onViewDetails,
  onDetach,
}: BlueprintSettingsSectionProps) {
  const [pendingVersion, setPendingVersion] = useState(currentVersion)

  const versionOptions = blueprint.versions.map((v, i) => ({
    value: v.version,
    label:
      v.version === blueprint.versions[0]?.version
        ? `${v.version} (latest)`
        : v.version === currentVersion
          ? `${v.version} (current)`
          : v.version,
  }))

  const isDirty = pendingVersion !== currentVersion

  return (
    <Section className="gap-4">
      <div>
        <Heading className="text-base">Blueprint</Heading>
        <p className="mt-1 text-ssm text-neutral-subtle">
          This service was provisioned from a blueprint. Update the blueprint version to apply new defaults and
          infrastructure changes.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <InputText
          name="blueprint-name"
          label="Blueprint"
          value={blueprint.name}
          onChange={() => undefined}
          disabled
        />

        <InputText
          name="major-service-version"
          label="Service version"
          value={majorServiceVersion}
          onChange={() => undefined}
          disabled
          hint="Fixed at provisioning. To change, create a new service."
        />

        <InputSelect
          label="Blueprint version"
          value={pendingVersion}
          onChange={(v) => typeof v === 'string' && setPendingVersion(v)}
          options={versionOptions}
          hint="Pin to a specific version, jump ahead, or revert. Selecting a different version opens the update review."
        />

        {isDirty && (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              color="neutral"
              variant="surface"
              radius="rounded"
              onClick={() => setPendingVersion(currentVersion)}
            >
              Reset
            </Button>
            <Button
              size="sm"
              color="brand"
              variant="solid"
              radius="rounded"
              onClick={() => onVersionChange(pendingVersion)}
            >
              Review change
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral pt-4">
        <Button size="sm" color="neutral" variant="plain" radius="rounded" onClick={onViewDetails}>
          <Icon iconName="circle-info" iconStyle="regular" className="mr-2 text-xs" />
          View blueprint details
        </Button>
        {onDetach && (
          <Tooltip content="Detach removes catalog tracking. Coming soon." side="top">
            <span>
              <Button size="sm" color="neutral" variant="outline" radius="rounded" onClick={onDetach} disabled>
                <Icon iconName="link-slash" iconStyle="regular" className="mr-2 text-xs" />
                Detach
              </Button>
            </span>
          </Tooltip>
        )}
      </div>
    </Section>
  )
}

export default BlueprintSettingsSection

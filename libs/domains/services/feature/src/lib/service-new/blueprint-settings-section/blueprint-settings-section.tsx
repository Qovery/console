import { useState } from 'react'
import { Button, Heading, Icon, InputSelect, InputText, Section, Tooltip } from '@qovery/shared/ui'
import { type BlueprintEntry } from '../blueprints'
import { type SetupParameter, getSetupParameters } from '../blueprint-wizard/types'

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
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const params = getSetupParameters(blueprint)
    return params.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.defaultValue ?? ''
      return acc
    }, {})
  })

  const setupParams = getSetupParameters(blueprint)
  const versionOptions = blueprint.versions.map((v) => ({
    value: v.version,
    label:
      v.version === blueprint.versions[0]?.version
        ? `${v.version} (latest)`
        : v.version === currentVersion
          ? `${v.version} (current)`
          : v.version,
  }))

  const isVersionDirty = pendingVersion !== currentVersion

  return (
    <Section className="gap-6">
      <div>
        <Heading className="text-base">Blueprint</Heading>
        <p className="mt-1 text-ssm text-neutral-subtle">
          This service was provisioned from a blueprint. Update the blueprint version to apply new defaults and
          infrastructure changes.
        </p>
      </div>

      {/* Identity — read-only metadata */}
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

        {isVersionDirty && (
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

      {/* Blueprint parameters — editable, pre-filled from the blueprint manifest. */}
      {setupParams.length > 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-neutral">Blueprint parameters</h3>
            <p className="mt-0.5 text-ssm text-neutral-subtle">
              Values configured at provisioning. Edit and save to apply on the next deploy.
            </p>
          </div>
          {setupParams.map((p) => (
            <ParameterField
              key={p.id}
              parameter={p}
              value={paramValues[p.id] ?? ''}
              onChange={(v) => setParamValues((s) => ({ ...s, [p.id]: v }))}
            />
          ))}
        </div>
      )}

      {/* Footer actions */}
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

function ParameterField({
  parameter,
  value,
  onChange,
}: {
  parameter: SetupParameter
  value: string
  onChange: (v: string) => void
}) {
  if (parameter.type === 'select' && parameter.options) {
    return (
      <InputSelect
        label={parameter.label}
        value={value}
        onChange={(v) => typeof v === 'string' && onChange(v)}
        options={parameter.options}
        hint={parameter.helper}
      />
    )
  }
  return (
    <InputText
      name={parameter.id}
      label={parameter.label}
      type={parameter.type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      hint={parameter.helper}
    />
  )
}

export default BlueprintSettingsSection

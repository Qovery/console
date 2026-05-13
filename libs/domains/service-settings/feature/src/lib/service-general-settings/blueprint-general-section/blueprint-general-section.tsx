import { type BlueprintEntry } from '@qovery/domains/services/feature'
import { Button, Callout, ExternalLink, Icon, InputSelect, InputText } from '@qovery/shared/ui'

export interface BlueprintGeneralSectionProps {
  blueprint: BlueprintEntry
  blueprintVersion: string
  serviceVersion: string
  onOpenBlueprintDetails: () => void
  onUpdateBlueprint: () => void
}

export function BlueprintGeneralSection({
  blueprint,
  blueprintVersion,
  serviceVersion,
  onOpenBlueprintDetails,
  onUpdateBlueprint,
}: BlueprintGeneralSectionProps) {
  return (
    <div>
      <p className="text-sm text-neutral-subtle">
        Provisioned from{' '}
        <button
          type="button"
          className="underline decoration-neutral-component underline-offset-2 hover:text-neutral"
          onClick={onOpenBlueprintDetails}
        >
          {blueprint.name}
        </button>{' '}
        blueprint
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <InputText
            label="Repository"
            name="blueprint-repository"
            value={blueprint.repositorySlug}
            onChange={() => undefined}
            disabled
          />
          <ExternalLink href={blueprint.repositoryUrl} size="xs" className="mt-1 gap-0.5">
            Go to repository
          </ExternalLink>
        </div>

        <InputSelect
          label="Blueprint version"
          value={blueprintVersion}
          options={[{ value: blueprintVersion, label: blueprintVersion }]}
          onChange={() => undefined}
          disabled
        />

        <InputSelect
          label="Service version"
          value={serviceVersion}
          options={[{ value: serviceVersion, label: serviceVersion }]}
          onChange={() => undefined}
          disabled
        />

        <Callout.Root color="sky" className="items-center">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text className="flex-1 text-info">New blueprint version available</Callout.Text>
          <Button
            type="button"
            size="sm"
            color="brand"
            variant="solid"
            onClick={onUpdateBlueprint}
            className="border-info-component bg-surface-info-solid hover:bg-surface-info-solidHover"
          >
            Update
          </Button>
        </Callout.Root>
      </div>
    </div>
  )
}

export default BlueprintGeneralSection

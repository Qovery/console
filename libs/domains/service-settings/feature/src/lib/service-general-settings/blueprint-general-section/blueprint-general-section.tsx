import { type OrganizationApiToken } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { CrudModalFeature, useApiTokens } from '@qovery/domains/organizations/feature'
import { type BlueprintEntry } from '@qovery/domains/services/feature'
import { Button, Callout, ExternalLink, Icon, InputSelect, InputText, useModal } from '@qovery/shared/ui'

export interface BlueprintGeneralSectionProps {
  organizationId: string
  blueprint: BlueprintEntry
  blueprintVersion: string
  serviceVersion: string
  onOpenBlueprintDetails: () => void
  onUpdateBlueprint: () => void
}

export function BlueprintGeneralSection({
  organizationId,
  blueprint,
  blueprintVersion,
  serviceVersion,
  onOpenBlueprintDetails,
  onUpdateBlueprint,
}: BlueprintGeneralSectionProps) {
  const { control, watch, setValue } = useFormContext<{
    api_token_id?: string | null
    api_token_name?: string | null
  }>()
  const { data: apiTokens = [] } = useApiTokens({ organizationId })
  const { openModal, closeModal } = useModal()
  const selectedApiTokenId = watch('api_token_id')

  useEffect(() => {
    if (selectedApiTokenId || apiTokens.length === 0) return
    const fallbackToken = apiTokens[0]
    setValue('api_token_id', fallbackToken.id, { shouldDirty: false })
    setValue('api_token_name', fallbackToken.name, { shouldDirty: false })
  }, [apiTokens, selectedApiTokenId, setValue])

  const tokenOptions = apiTokens.map((token) => ({
    value: token.id,
    label: token.name,
  }))

  const handleTokenSelection = (tokenId: string, fieldOnChange: (value: string) => void) => {
    const token = apiTokens.find(({ id }) => id === tokenId)
    fieldOnChange(tokenId)
    setValue('api_token_name', token?.name ?? null)
  }

  const handleCreateToken = () => {
    closeModal()
  }

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
        <Controller
          name="api_token_id"
          control={control}
          rules={{ required: 'Please select an API token.' }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="API Token"
              value={field.value ?? undefined}
              options={tokenOptions}
              onChange={(value) => {
                if (typeof value === 'string') {
                  handleTokenSelection(value, field.onChange)
                }
              }}
              error={error?.message}
              menuListButton={{
                title: 'Select token',
                label: 'Create API token',
                onClick: () =>
                  openModal({
                    content: (
                      <CrudModalFeature
                        organizationId={organizationId}
                        onClose={handleCreateToken}
                      />
                    ),
                    options: { fakeModal: true },
                  }),
              }}
              isSearchable
            />
          )}
        />

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

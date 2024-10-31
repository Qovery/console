import {
  EnvironmentModeEnum,
  type OrganizationWebhookCreateRequest,
  OrganizationWebhookEventEnum,
  OrganizationWebhookKindEnum,
} from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { Icon, InputSelect, InputTags, InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'

export interface WebhookCrudModalProps {
  closeModal: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdition?: boolean
  isLoading?: boolean
}

export function WebhookCrudModal(props: WebhookCrudModalProps) {
  const { closeModal, onSubmit, isEdition, isLoading } = props
  const { control } = useFormContext<OrganizationWebhookCreateRequest>()

  return (
    <ModalCrud
      title="Create new webhook"
      onClose={closeModal}
      onSubmit={onSubmit}
      submitLabel={isEdition ? 'Update' : 'Create'}
      loading={isLoading}
    >
      <div className="mb-3 font-bold text-neutral-400">General</div>

      <Controller
        name="target_url"
        control={control}
        rules={{
          required: 'Please enter a target url.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="URL"
            error={error?.message}
          />
        )}
      />

      <Controller
        name="kind"
        control={control}
        rules={{
          required: 'Please select a kind.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            className="mb-3"
            portal
            options={[
              {
                label: 'Slack',
                value: OrganizationWebhookKindEnum.SLACK,
                icon: <Icon name={IconEnum.SLACK} className="h-4 w-4" />,
              },
              {
                label: 'Standard',
                value: OrganizationWebhookKindEnum.STANDARD,
                icon: <Icon name={IconEnum.QOVERY} className="h-4 w-4" />,
              },
            ]}
            onChange={field.onChange}
            value={field.value}
            label="Kind"
            error={error?.message}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <InputTextArea
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
          />
        )}
      />

      <Controller
        name="target_secret"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputText
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Secret"
            error={error?.message}
          />
        )}
      />

      <div className="mb-3 font-bold text-neutral-400">Event & filters</div>

      <div className="mb-3">
        <Controller
          name="events"
          control={control}
          rules={{
            required: 'Please enter events',
          }}
          render={({ field }) => (
            <InputSelect
              onChange={field.onChange}
              value={field.value}
              isMulti
              portal
              options={[
                {
                  label: OrganizationWebhookEventEnum.FAILURE,
                  value: OrganizationWebhookEventEnum.FAILURE,
                },
                {
                  label: OrganizationWebhookEventEnum.STARTED,
                  value: OrganizationWebhookEventEnum.STARTED,
                },
                {
                  label: OrganizationWebhookEventEnum.CANCELLED,
                  value: OrganizationWebhookEventEnum.CANCELLED,
                },
                {
                  label: OrganizationWebhookEventEnum.SUCCESSFUL,
                  value: OrganizationWebhookEventEnum.SUCCESSFUL,
                },
              ]}
              label="Events"
              dataTestId="events-input"
              hint="List all the events you want to be notified about."
            />
          )}
        />
      </div>

      <div className="mb-3">
        <Controller
          name="project_names_filter"
          control={control}
          render={({ field }) => (
            <InputTags
              onChange={field.onChange}
              tags={field.value || []}
              placeholder="Add project name"
              label="Project name filter"
              dataTestId="project-filter-input"
            />
          )}
        />
        <p className="ml-3 mt-0.5 text-xs text-neutral-350">
          Webhook will be triggered only for projects whose names match or, if you're using a wildcard, start with one
          of the values from your list.
          <br />
          Press Enter to add a new value.
        </p>
      </div>

      <div className="mb-3">
        <Controller
          name="environment_types_filter"
          control={control}
          render={({ field }) => (
            <InputSelect
              portal
              onChange={field.onChange}
              isMulti
              options={[
                {
                  label: EnvironmentModeEnum.DEVELOPMENT,
                  value: EnvironmentModeEnum.DEVELOPMENT,
                },
                {
                  label: EnvironmentModeEnum.STAGING,
                  value: EnvironmentModeEnum.STAGING,
                },
                {
                  label: EnvironmentModeEnum.PREVIEW,
                  value: EnvironmentModeEnum.PREVIEW,
                },
                {
                  label: EnvironmentModeEnum.PRODUCTION,
                  value: EnvironmentModeEnum.PRODUCTION,
                },
              ]}
              value={field.value}
              label="Environment type filter"
              dataTestId="environment-type-input"
              hint="Webhook will be triggered only for events happening on the environment with the selected environment type."
            />
          )}
        />
      </div>
    </ModalCrud>
  )
}

export default WebhookCrudModal

import {
  EnvironmentModeEnum,
  type OrganizationWebhookCreateRequest,
  OrganizationWebhookEventEnum,
  OrganizationWebhookKindEnum,
  type OrganizationWebhookResponse,
} from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { IconEnum } from '@qovery/shared/enums'
import { useModal } from '@qovery/shared/ui'
import { Icon, InputSelect, InputTags, InputText, InputTextArea, ModalCrud } from '@qovery/shared/ui'
import { useCreateWebhook } from '../../hooks/use-create-webhook/use-create-webhook'
import { useEditWebhook } from '../../hooks/use-edit-webhook/use-edit-webhook'

export interface WebhookCrudModalFeatureProps {
  organizationId: string
  closeModal: () => void
  webhook?: OrganizationWebhookResponse
}

export function WebhookCrudModal({ organizationId, closeModal, webhook }: WebhookCrudModalFeatureProps) {
  const { enableAlertClickOutside } = useModal()
  const { mutateAsync: createWebhook, isLoading: isLoadingCreateWebhook } = useCreateWebhook()
  const { mutateAsync: editWebhook, isLoading: isLoadingEditWebhook } = useEditWebhook()
  const isEdit = Boolean(webhook)
  const hasExistingSecret = Boolean(webhook?.target_secret_set)

  const methods = useForm<OrganizationWebhookCreateRequest>({
    mode: 'all',
    defaultValues: {
      kind: webhook?.kind ?? undefined,
      environment_types_filter: webhook?.environment_types_filter ?? [],
      project_names_filter: webhook?.project_names_filter ?? [],
      events: webhook?.events ?? [],
      description: webhook?.description ?? '',
      target_url: webhook?.target_url ?? '',
      target_secret: '',
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const isEditDirty = isEdit && methods.formState.isDirty

  const onSubmit = methods.handleSubmit(async (data) => {
    const trimmedData = {
      ...data,
      target_url: data.target_url.trim(),
      target_secret: data.target_secret || undefined,
    }
    try {
      if (webhook) {
        await editWebhook({
          organizationId,
          webhookId: webhook.id,
          webhookRequest: { ...webhook, ...trimmedData },
        })
        closeModal()
      } else {
        await createWebhook({
          organizationId,
          webhookRequest: trimmedData,
        })
        closeModal()
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Create new webhook"
        onClose={closeModal}
        onSubmit={onSubmit}
        submitLabel={isEdit ? 'Update' : 'Create'}
        loading={isLoadingCreateWebhook || isLoadingEditWebhook}
      >
        <div className="mb-3 text-base font-medium text-neutral">General</div>

        <Controller
          name="target_url"
          control={methods.control}
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
          control={methods.control}
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
          control={methods.control}
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

        {!isEdit && (
          <Controller
            name="target_secret"
            control={methods.control}
            render={({ field }) => (
              <InputText
                className="mb-3"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Secret"
                placeholder="Enter webhook secret"
              />
            )}
          />
        )}

        <div className="mb-3 mt-6 text-base font-medium text-neutral">Event & filters</div>

        <div className="mb-3">
          <Controller
            name="events"
            control={methods.control}
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
            control={methods.control}
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
          <p className="ml-3 mt-0.5 text-xs text-neutral-subtle">
            Webhook will be triggered only for projects whose names match or, if you're using a wildcard, start with one
            of the values from your list.
            <br />
            Press Enter to add a new value.
          </p>
        </div>

        <div className="mb-3">
          <Controller
            name="environment_types_filter"
            control={methods.control}
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

        {isEditDirty && hasExistingSecret && (
          <>
            <hr className="my-3 border-neutral" />
            <span className="text-sm text-neutral-subtle">Confirm your secret</span>
            <Controller
              name="target_secret"
              control={methods.control}
              rules={{
                required: 'Please enter a secret.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  className="mt-3"
                  type="password"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Secret"
                  error={error?.message}
                />
              )}
            />
          </>
        )}
      </ModalCrud>
    </FormProvider>
  )
}

export default WebhookCrudModal

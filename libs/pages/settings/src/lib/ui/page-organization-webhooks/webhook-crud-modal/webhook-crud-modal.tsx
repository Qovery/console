import {
  EnvironmentModeEnum,
  OrganizationWebhookCreateRequest,
  OrganizationWebhookEventEnum,
  OrganizationWebhookKindEnum,
} from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, ButtonSize, ButtonStyle, InputSelect, InputTags, InputText, InputTextArea } from '@qovery/shared/ui'

export interface WebhookCrudModalProps {
  closeModal: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdition?: boolean
}

export function WebhookCrudModal(props: WebhookCrudModalProps) {
  const { closeModal, onSubmit } = props
  const { control, formState } = useFormContext<OrganizationWebhookCreateRequest>()

  return (
    <div className="p-6">
      <h2 className="h4 text-text-600 max-w-sm truncate mb-6">Create new webhook</h2>

      <form onSubmit={onSubmit}>
        <div className="text-text-600 font-bold mb-3">General</div>

        <Controller
          name={'target_url'}
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
          name={'kind'}
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
                  //icon: <Icon name={IconEnum.SLACK} className="w-4 h-4" />,
                },
                {
                  label: 'Standard',
                  value: OrganizationWebhookKindEnum.STANDARD,
                  //icon: <Icon name={IconEnum.QOVERY} className="w-4 h-4" />,
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
          name={'description'}
          control={control}
          rules={{
            required: 'Please enter a description.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Description"
              error={error?.message}
            />
          )}
        />

        <Controller
          name={'target_secret'}
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

        <div className="text-text-600 font-bold mb-3">Event & filters</div>

        <div className="mb-3">
          <div data-testid={'test-debug'}>
            <Controller
              name={'events'}
              control={control}
              rules={{
                required: 'Please enter events',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputSelect
                  onChange={field.onChange}
                  value={field.value}
                  isMulti
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
                />
              )}
            />
            <p className="text-text-400 text-xs">List all the events you want to be notified about.</p>
          </div>
        </div>

        <div className="mb-3">
          <Controller
            name={'project_names_filter'}
            control={control}
            rules={{
              required: 'Please enter project names filter',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputTags
                onChange={field.onChange}
                tags={field.value || []}
                placeholder="Add new project name filter"
                label="Project name filter"
                dataTestId="project-filter-input"
              />
            )}
          />
          <p className="text-text-400 text-xs">
            Webhook will be triggered only for projects whose names match or, if you're using a wildcard, start with one
            of the values from your list.
          </p>
        </div>

        <div className="mb-3">
          <Controller
            name={'environment_types_filter'}
            control={control}
            rules={{
              required: 'Please enter environment types filter',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                onChange={field.onChange}
                isMulti
                portal
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
              />
            )}
          />
          <p className="text-text-400 text-xs">
            Webhook will be triggered only for events happening on the environment with the selected environment type.
          </p>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button
            dataTestId="cancel-button"
            className="btn--no-min-w"
            style={ButtonStyle.STROKED}
            size={ButtonSize.XLARGE}
            onClick={() => {
              closeModal()
            }}
          >
            Cancel
          </Button>

          <Button type="submit" dataTestId="submit-button" size={ButtonSize.XLARGE} disabled={!formState.isValid}>
            {props.isEdition ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default WebhookCrudModal

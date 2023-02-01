import { CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconAwesomeEnum, InputText, Link, ModalCrud } from '@qovery/shared/ui'

export interface CreateEditCredentialsModalProps {
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  cloudProvider?: CloudProviderEnum
  onDelete?: () => void
}

export function CreateEditCredentialsModal(props: CreateEditCredentialsModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title={`${props.isEdit ? `Edit` : 'New'} credentials`}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      onDelete={props.onDelete}
      deleteButtonLabel="Delete credentials"
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <Controller
        name="name"
        control={control}
        rules={{
          required: 'Please enter a name.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-name"
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Name"
            error={error?.message}
          />
        )}
      />
      {props.cloudProvider === CloudProviderEnum.AWS && (
        <>
          <Controller
            name="access_key_id"
            control={control}
            rules={{
              required: 'Please enter a access key.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-access-key"
                className="mb-3"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Access key"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="secret_access_key"
            control={control}
            rules={{
              required: 'Please enter a secret key.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-secret-key"
                className="mb-5"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Secret access key"
                error={error?.message}
              />
            )}
          />
        </>
      )}
      {props.cloudProvider === CloudProviderEnum.SCW && (
        <>
          <Controller
            name="scaleway_access_key"
            control={control}
            rules={{
              required: 'Please enter a access key.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-scw-access-key"
                className="mb-3"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Access key"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="scaleway_secret_key"
            control={control}
            rules={{
              required: 'Please enter a secret key.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-scw-secret-key"
                className="mb-3"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Secret access key"
                error={error?.message}
              />
            )}
          />
          <Controller
            name="scaleway_project_id"
            control={control}
            rules={{
              required: 'Please enter a project id.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-scw-project-id"
                className="mb-5"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Project id"
                error={error?.message}
              />
            )}
          />
        </>
      )}
      {props.cloudProvider === CloudProviderEnum.AWS && (
        <Link
          className="font-medium text-accent2-500 text-sm"
          link="https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/amazon-web-services/"
          linkLabel="How to configure credentials"
          iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
          external
        />
      )}
      {props.cloudProvider === CloudProviderEnum.SCW && (
        <Link
          className="font-medium text-accent2-500 text-sm"
          link="https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/scaleway/"
          linkLabel="How to configure credentials"
          iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
          external
        />
      )}
    </ModalCrud>
  )
}

export default CreateEditCredentialsModal

import { CloudProviderEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { IconAwesomeEnum, InputText, Link, ModalCrud } from '@qovery/shared/ui'

export interface CreateEditCredentialsModalProps {
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  cloudProvider?: CloudProviderEnum
}

export function CreateEditCredentialsModal(props: CreateEditCredentialsModalProps) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title={`${props.isEdit ? `Edit` : 'New'} credentials`}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
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
                className="mb-3"
                type="password"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Access key ID"
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
                className="mb-3"
                type="password"
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
      <div className="bg-element-light-lighter-200 text-ssm rounded font-medium p-4">
        <p className="text-text-600 mb-2">How to configure credentials</p>
        <ul>
          <li>
            <Link
              className="font-medium text-accent2-500 text-sm mb-2"
              link="https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/amazon-web-services/"
              linkLabel="Amazon Web Services"
              iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
              external
            />
          </li>
          <li>
            <Link
              className="font-medium text-accent2-500 text-sm mb-2"
              link="https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/scaleway/"
              linkLabel="Scaleway"
              iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
              external
            />
          </li>
          <li>
            <Link
              className="font-medium text-accent2-500 text-sm"
              link="https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/digital-ocean/"
              linkLabel="Digital Ocean"
              iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
              external
            />
          </li>
        </ul>
      </div>
    </ModalCrud>
  )
}

export default CreateEditCredentialsModal

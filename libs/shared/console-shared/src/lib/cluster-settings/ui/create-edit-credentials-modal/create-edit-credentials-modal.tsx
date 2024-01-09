import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Button, Dropzone, ExternalLink, Icon, IconAwesomeEnum, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CreateEditCredentialsModalProps {
  cloudProvider: CloudProviderEnum
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  onDelete?: () => void
}

export function CreateEditCredentialsModal(props: CreateEditCredentialsModalProps) {
  const { control, setValue } = useFormContext()

  const [fileDetails, setFileDetails] = useState<{ name: string; size: number }>()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      if (!file) return

      setFileDetails({
        name: file.name,
        size: file.size / 1000,
      })

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async () => {
        const binaryStr = reader.result
        setValue('gcp_credentials', binaryStr?.toString(), { shouldValidate: true })
      }
    },
  })

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
            name="scaleway_organization_id"
            control={control}
            rules={{
              required: 'Please enter an organization id.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                dataTestId="input-scw-organization-id"
                className="mb-5"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Organization id"
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
      {props.cloudProvider === CloudProviderEnum.GCP && (
        <Controller
          name="gcp_credentials"
          control={control}
          rules={{
            required: 'Please enter your credentials JSON',
          }}
          render={({ field }) => (
            <div className="mb-5">
              {!field.value ? (
                <div {...getRootProps()}>
                  <input
                    className="hidden"
                    {...getInputProps({
                      name: field.name,
                      value: field.value,
                      onChange: (e) => {
                        console.log(e)
                        field.onChange(e.target.files?.[0])
                      },
                    })}
                  />
                  <Dropzone typeFile=".json" isDragActive={isDragActive} />
                </div>
              ) : fileDetails ? (
                <div className="flex items-center justify-between border border-neutral-200 p-4 rounded mb-[90px]">
                  <div className="flex items-center pl-2 text-neutral-400">
                    <Icon name={IconAwesomeEnum.FILE_ARROW_DOWN} className="mr-4" />
                    <p className="flex flex-col gap-1">
                      <span className="text-xs font-medium">{fileDetails.name}</span>
                      <span className="text-xs text-neutral-350">{fileDetails.size} Ko</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    color="neutral"
                    size="md"
                    className="justify-center w-7 h-7"
                    onClick={() => field.onChange(undefined)}
                  >
                    <Icon name={IconAwesomeEnum.TRASH} />
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </div>
          )}
        />
      )}
      <ExternalLink
        href={match(props.cloudProvider)
          .with(
            'AWS',
            () => 'https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/amazon-web-services'
          )
          .with('SCW', () => 'https://hub.qovery.com/docs/using-qovery/configuration/cloud-service-provider/scaleway')
          .with(
            'GCP',
            () =>
              'https://hub.qovery.com/docs/getting-started/install-qovery/gcp/cluster-managed-by-qovery/create-credentials/'
          )
          .exhaustive()}
        size="sm"
      >
        How to configure credentials
      </ExternalLink>
    </ModalCrud>
  )
}

export default CreateEditCredentialsModal

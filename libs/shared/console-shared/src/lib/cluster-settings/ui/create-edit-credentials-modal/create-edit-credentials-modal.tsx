import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { Button, Dropzone, ExternalLink, Icon, InputText, ModalCrud } from '@qovery/shared/ui'

export interface CreateEditCredentialsModalProps {
  cloudProvider: CloudProviderEnum
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
  onDelete?: () => void
}

export function CreateEditCredentialsModal(props: CreateEditCredentialsModalProps) {
  const { control, setValue, formState } = useFormContext()

  const [fileDetails, setFileDetails] = useState<{ name: string; size: number }>()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles?.[0]
      if (!file || file.type !== 'application/json') return

      setFileDetails({
        name: file.name,
        size: file.size / 1000,
      })

      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async () => {
        const binaryStr = reader.result
        setValue('gcp_credentials', binaryStr !== null ? btoa(binaryStr?.toString()) : null, {
          shouldValidate: true,
        })
      }
    },
  })
  const isEditDirty = props.isEdit && formState.isDirty

  return (
    <ModalCrud
      title={`${props.isEdit ? `Edit` : 'New'} credentials`}
      description={
        <>
          Create here the credentials to access your cloud account.
          <ExternalLink
            className="mt-2"
            withIcon={false}
            href={match(props.cloudProvider)
              .with(
                'AWS',
                () =>
                  'https://hub.qovery.com/docs/getting-started/install-qovery/aws/cluster-managed-by-qovery/create-credentials'
              )
              .with(
                'SCW',
                () =>
                  'https://hub.qovery.com/docs/getting-started/install-qovery/scaleway/cluster-managed-by-qovery/create-credentials'
              )
              .with(
                'GCP',
                () =>
                  'https://hub.qovery.com/docs/getting-started/install-qovery/gcp/cluster-managed-by-qovery/create-credentials/'
              )
              .with('ON_PREMISE', () => '')
              .exhaustive()}
            size="sm"
          >
            How to configure credentials <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
          </ExternalLink>
        </>
      }
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      onDelete={props.onDelete}
      deleteButtonLabel="Delete credentials"
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <div className="flex flex-col gap-y-4">
        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Please enter a name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-name"
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
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Access key"
                  error={error?.message}
                />
              )}
            />
            {isEditDirty && (
              <>
                <hr />
                <span className="text-sm text-neutral-350">Confirm your secret key</span>
              </>
            )}
            {(!props.isEdit || isEditDirty) && (
              <Controller
                name="secret_access_key"
                control={control}
                rules={{
                  required: 'Please enter a secret key.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-secret-key"
                    type="password"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Secret access key"
                    error={error?.message}
                  />
                )}
              />
            )}
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
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  label="Access key"
                  error={error?.message}
                />
              )}
            />
            {isEditDirty && (
              <>
                <hr />
                <span className="text-sm text-neutral-350">Confirm your secret key</span>
              </>
            )}
            {(!props.isEdit || isEditDirty) && (
              <Controller
                name="scaleway_secret_key"
                control={control}
                rules={{
                  required: 'Please enter a secret key.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputText
                    dataTestId="input-scw-secret-key"
                    type="password"
                    name={field.name}
                    onChange={field.onChange}
                    value={field.value}
                    label="Secret access key"
                    error={error?.message}
                  />
                )}
              />
            )}
            <Controller
              name="scaleway_organization_id"
              control={control}
              rules={{
                required: 'Please enter an organization id.',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  dataTestId="input-scw-organization-id"
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
              <div>
                {!field.value ? (
                  <div {...getRootProps()}>
                    <input data-testid="input-credentials-json" className="hidden" {...getInputProps()} />
                    <Dropzone typeFile=".json" isDragActive={isDragActive} />
                  </div>
                ) : fileDetails ? (
                  <div className="mb-[90px] flex items-center justify-between rounded border border-neutral-200 p-4">
                    <div className="flex items-center pl-2 text-neutral-400">
                      <Icon iconName="file-arrow-down" className="mr-4" />
                      <p className="flex flex-col gap-1">
                        <span className="text-xs font-medium">{fileDetails.name}</span>
                        <span className="text-xs text-neutral-350">{fileDetails.size} Ko</span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      color="neutral"
                      size="md"
                      className="h-7 w-7 justify-center"
                      onClick={() => field.onChange(undefined)}
                    >
                      <Icon iconName="trash" />
                    </Button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            )}
          />
        )}
      </div>
    </ModalCrud>
  )
}

export default CreateEditCredentialsModal

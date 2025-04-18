import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { P, match } from 'ts-pattern'
import {
  useCreateCloudProviderCredential,
  useDeleteCloudProviderCredential,
  useEditCloudProviderCredential,
} from '@qovery/domains/cloud-providers/feature'
import { CLUSTER_SETTINGS_IMAGE_REGISTRY_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL } from '@qovery/shared/routes'
import {
  Button,
  Callout,
  Dropzone,
  ExternalLink,
  Icon,
  InputSelect,
  InputText,
  ModalCrud,
  useModal,
} from '@qovery/shared/ui'
import { useClusterCloudProviderInfo } from '../hooks/use-cluster-cloud-provider-info/use-cluster-cloud-provider-info'

type ClusterCredentialsFormValues = {
  type: 'STS' | 'STATIC'
  name: string
  access_key_id?: string
  secret_access_key?: string
  scaleway_organization_id?: string
  scaleway_project_id?: string
  scaleway_access_key?: string
  scaleway_secret_key?: string
  gcp_credentials?: string
  role_arn?: string
}

export interface ClusterCredentialsModalProps {
  organizationId: string
  clusterId: string
  onClose: (response?: ClusterCredentials) => void
  credential?: ClusterCredentials
}

export const handleSubmit = (data: FieldValues, cloudProvider: CloudProviderEnum) => {
  const currentData = {
    name: data['name'],
  }

  return match(cloudProvider)
    .with('AWS', (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        access_key_id: data['access_key_id'],
        secret_access_key: data['secret_access_key'],
      },
    }))
    .with('SCW', (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        scaleway_access_key: data['scaleway_access_key'],
        scaleway_secret_key: data['scaleway_secret_key'],
        scaleway_project_id: data['scaleway_project_id'],
        scaleway_organization_id: data['scaleway_organization_id'],
      },
    }))
    .with('GCP', (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        gcp_credentials: data['gcp_credentials'],
      },
    }))
    .with('ON_PREMISE', (cp) => ({
      cloudProvider: cp,
      payload: undefined,
    }))
    .exhaustive()
}

export function ClusterCredentialsModal({
  organizationId,
  clusterId,
  onClose,
  credential,
}: ClusterCredentialsModalProps) {
  const { enableAlertClickOutside } = useModal()

  const { data: cloudProvider } = useClusterCloudProviderInfo({
    organizationId,
    clusterId,
  })
  const { mutateAsync: createCloudProviderCredential, isLoading: isLoadingCreate } = useCreateCloudProviderCredential()
  const { mutateAsync: editCloudProviderCredential, isLoading: isLoadingEdit } = useEditCloudProviderCredential()
  const { mutateAsync: deleteCloudProviderCredential } = useDeleteCloudProviderCredential()

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
        methods.setValue('gcp_credentials', binaryStr ? btoa(binaryStr.toString()) : undefined, {
          shouldValidate: true,
        })
      }
    },
  })

  const methods = useForm<ClusterCredentialsFormValues>({
    mode: 'onChange',
    defaultValues: {
      type: 'STS',
      name: credential?.name || '',
      access_key_id: match(credential)
        .with({ access_key_id: P.string }, (c) => c.access_key_id)
        .otherwise(() => undefined),
      scaleway_organization_id: match(credential)
        .with({ scaleway_organization_id: P.string }, (c) => c.scaleway_organization_id)
        .otherwise(() => undefined),
      scaleway_project_id: match(credential)
        .with({ scaleway_project_id: P.string }, (c) => c.scaleway_project_id)
        .otherwise(() => undefined),
      scaleway_access_key: match(credential)
        .with({ scaleway_access_key: P.string }, (c) => c.scaleway_access_key)
        .otherwise(() => undefined),
      scaleway_secret_key: undefined,
      gcp_credentials: undefined,
    },
  })

  const isEdit = !!credential
  const isEditDirty = isEdit && methods.formState.isDirty

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    // Close without edit when no changes
    if (!methods.formState.isDirty) {
      onClose()
      return
    }

    const credentials = handleSubmit(data, cloudProvider?.cloud_provider ?? 'AWS')

    try {
      if (credential) {
        const response = await editCloudProviderCredential({
          organizationId,
          credentialId: credential.id,
          ...credentials,
        })
        onClose(response)
      } else {
        const response = await createCloudProviderCredential({
          organizationId,
          ...credentials,
        })
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }
  })

  const onDelete = async () => {
    if (credential?.id) {
      try {
        await deleteCloudProviderCredential({
          organizationId,
          cloudProvider: cloudProvider?.cloud_provider ?? 'AWS',
          credentialId: credential.id,
        })
        onClose()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const watchType = methods.watch('type')

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={`${isEdit ? `Edit` : 'Create new'} credentials`}
        description={
          <span className="flex flex-col gap-2">
            Follow these steps and give Qovery access to your {cloudProvider?.cloud_provider ?? 'AWS'} account.
            <ExternalLink
              href={match(cloudProvider?.cloud_provider ?? 'AWS')
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
              Documentation
            </ExternalLink>
          </span>
        }
        onSubmit={onSubmit}
        onClose={onClose}
        onDelete={onDelete}
        deleteButtonLabel="Delete credentials"
        loading={isLoadingCreate || isLoadingEdit}
        isEdit={isEdit}
      >
        <div className="flex flex-col gap-y-4">
          {isEdit && (
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextDescription className="flex flex-col gap-1">
                  The credential change won't be applied to the mirroring registry of this cluster. Make sure to update
                  the credentials properly in this cluster's mirroring registry section.
                  <ExternalLink
                    className="items-center"
                    href={
                      CLUSTER_URL(organizationId, clusterId) +
                      CLUSTER_SETTINGS_URL +
                      CLUSTER_SETTINGS_IMAGE_REGISTRY_URL
                    }
                  >
                    Go to mirroring registry section
                  </ExternalLink>
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
          <Controller
            name="type"
            control={methods.control}
            rules={{
              required: 'Please enter a name.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                onChange={field.onChange}
                value={field.value}
                label="Authentication type"
                error={error?.message}
                options={[
                  { label: 'Assume role via STS (preferred)', value: 'STS' },
                  { label: 'Static credentials', value: 'STATIC' },
                ]}
              />
            )}
          />
          {watchType === 'STATIC' && (
            <>
              {cloudProvider?.cloud_provider === 'AWS' && (
                <div className="flex flex-col gap-1.5 rounded border border-neutral-250 p-4">
                  <h2 className="text-sm font-medium text-neutral-400">1. Create a user for Qovery</h2>
                  <p className="text-sm text-neutral-350">Follow the instructions available on this page</p>
                  <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                    How to create new credentials
                  </ExternalLink>
                </div>
              )}
              {cloudProvider?.cloud_provider === 'GCP' && (
                <div className="flex flex-col gap-1.5 rounded border border-neutral-250 p-4">
                  <h2 className="text-sm font-medium text-neutral-400">
                    1. Connect to your GCP Console and create/open a project
                  </h2>
                  <p className="text-sm text-neutral-350">Make sure you are connected to the right GCP account</p>
                  <ExternalLink href="https://console.cloud.google.com/" size="sm">
                    https://console.cloud.google.com/
                  </ExternalLink>
                </div>
              )}
              {cloudProvider?.cloud_provider === 'SCW' && (
                <div className="flex flex-col gap-1.5 rounded border border-neutral-250 p-4">
                  <h2 className="text-sm font-medium text-neutral-400">1. Generate Access key Id/Secret Access Key</h2>
                  <p className="text-sm text-neutral-350">Follow the instructions available on this page</p>
                  <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                    How to create new credentials
                  </ExternalLink>
                </div>
              )}
            </>
          )}
          {watchType === 'STS' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 rounded border border-neutral-250 p-4">
                <h2 className="text-sm font-medium text-neutral-400">1. Connect to your AWS Console</h2>
                <p className="text-sm text-neutral-350">Make sure you are connected to the right AWS account</p>
                <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                  https://aws.amazon.com/fr/console/
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-1.5 rounded border border-neutral-250 p-4">
                <h2 className="text-sm font-medium text-neutral-400">
                  2. Create a role for Qovery and grant assume role permissions
                </h2>
                <p className="text-sm text-neutral-350">
                  Execute the following Cloudformation stack and retrieve the role ARN from the “Output” section.
                </p>
                <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                  Cloudformation stack
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-4 rounded border border-neutral-250 p-4">
                <h2 className="text-sm font-medium text-neutral-400">3. Insert here the role ARN</h2>
                <Controller
                  name="name"
                  control={methods.control}
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
                      hint="Provide a name to identify this role"
                    />
                  )}
                />
                <Controller
                  name="role_arn"
                  control={methods.control}
                  rules={{
                    required: 'Please enter a role ARN',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      name={field.name}
                      onChange={field.onChange}
                      value={field.value}
                      label="Role ARN"
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded border border-neutral-250 p-4">
              <h2 className="text-sm font-medium text-neutral-400">2. Fill these information</h2>
              <Controller
                name="name"
                control={methods.control}
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
              {cloudProvider?.cloud_provider === 'AWS' && (
                <>
                  <Controller
                    name="access_key_id"
                    control={methods.control}
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
                  {(!isEdit || isEditDirty) && (
                    <Controller
                      name="secret_access_key"
                      control={methods.control}
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
              {cloudProvider?.cloud_provider === 'SCW' && (
                <>
                  <Controller
                    name="scaleway_access_key"
                    control={methods.control}
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
                  {(!isEdit || isEditDirty) && (
                    <Controller
                      name="scaleway_secret_key"
                      control={methods.control}
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
                    control={methods.control}
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
                    control={methods.control}
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
              {cloudProvider?.cloud_provider === 'GCP' && (
                <Controller
                  name="gcp_credentials"
                  control={methods.control}
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
          )}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default ClusterCredentialsModal

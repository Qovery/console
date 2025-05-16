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
  useModalConfirmation,
} from '@qovery/shared/ui'
import CopyButton from '../cluster-setup/copy-button/copy-button'
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
  azure_subscription_id?: string
  azure_client_id?: string
  azure_client_secret?: string
  azure_tenant_id?: string
  azure_resource_group_name?: string
}

export interface ClusterCredentialsModalProps {
  organizationId: string
  clusterId?: string
  onClose: (response?: ClusterCredentials) => void
  credential?: ClusterCredentials
  cloudProvider?: CloudProviderEnum
}

export const handleSubmit = (data: FieldValues, cloudProvider: CloudProviderEnum) => {
  const currentData = {
    name: data['name'],
  }

  return match(cloudProvider)
    .with('AWS', (cp) => {
      if (data['type'] === 'STS') {
        return {
          cloudProvider: cp,
          payload: {
            ...currentData,
            role_arn: data['role_arn'],
          },
        }
      }

      return {
        cloudProvider: cp,
        payload: {
          ...currentData,
          access_key_id: data['access_key_id'],
          secret_access_key: data['secret_access_key'],
        },
      }
    })
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
    .with('AZURE', (cp) => ({
      cloudProvider: cp,
      payload: {
        ...currentData,
        azure_subscription_id: data['azure_subscription_id'],
        azure_tenant_id: data['azure_tenant_id'],
        azure_client_id: data['azure_client_id'],
        azure_client_secret: data['azure_client_secret'],
        azure_resource_group_name: data['azure_resource_group_name'],
      },
    }))
    .with('ON_PREMISE', (cp) => ({
      cloudProvider: cp,
      payload: undefined,
    }))
    .exhaustive()
}

function CalloutEdit({
  isEdit,
  organizationId,
  clusterId,
}: {
  isEdit: boolean
  organizationId: string
  clusterId?: string
}) {
  if (!isEdit) return null

  return (
    <Callout.Root color="yellow">
      <Callout.Icon>
        <Icon iconName="circle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextDescription className="flex flex-col gap-1">
          The credential change won't be applied to the mirroring registry of this cluster. Make sure to update the
          credentials properly in this cluster's mirroring registry section.
          {clusterId && (
            <ExternalLink
              className="items-center"
              href={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_IMAGE_REGISTRY_URL}
            >
              Go to mirroring registry section
            </ExternalLink>
          )}
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}

export function ClusterCredentialsModal({
  organizationId,
  clusterId,
  onClose,
  credential,
  cloudProvider = 'AWS',
}: ClusterCredentialsModalProps) {
  const { enableAlertClickOutside } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: cloudProviderInfo } = useClusterCloudProviderInfo({
    organizationId,
    clusterId: clusterId ?? '',
    disabled: !!cloudProvider,
  })

  const cloudProviderLocal = cloudProviderInfo?.cloud_provider ?? cloudProvider ?? 'AWS'

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

  const isEdit = !!credential

  const methods = useForm<ClusterCredentialsFormValues>({
    mode: 'onChange',
    defaultValues:
      credential?.object_type === 'AWS_ROLE' || (!isEdit && cloudProviderLocal === 'AWS')
        ? {
            type: 'STS',
            name: credential?.name || '',
            role_arn: credential?.role_arn || '',
          }
        : {
            type: 'STATIC',
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

  const isEditDirty = isEdit && methods.formState.isDirty

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    // Close without edit when no changes
    if (!methods.formState.isDirty) {
      onClose()
      return
    }

    const credentials = handleSubmit(data, cloudProviderLocal)

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
    openModalConfirmation({
      title: 'Delete credential',
      description: (
        <p>
          To confirm the deletion of <strong>{credential?.name}</strong>, please type "delete"
        </p>
      ),
      name: credential?.name,
      isDelete: true,
      action: async () => {
        if (credential?.id) {
          try {
            await deleteCloudProviderCredential({
              organizationId,
              cloudProvider: cloudProviderLocal,
              credentialId: credential.id,
            })
            onClose()
          } catch (error) {
            console.error(error)
          }
        }
      },
    })
  }

  const watchType = methods.watch('type')

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={`${isEdit ? `Edit` : 'Create new'} credentials`}
        description={
          <span className="flex gap-1">
            Follow these steps and give Qovery access to your {cloudProviderLocal} account.
            {((watchType === 'STS' && cloudProviderLocal === 'AWS') || cloudProviderLocal === 'GCP') && (
              <ExternalLink
                href={match(cloudProviderLocal)
                  .with(
                    'AWS',
                    () =>
                      'https://hub.qovery.com/docs/getting-started/install-qovery/aws/cluster-managed-by-qovery/create-credentials'
                  )
                  .with(
                    'GCP',
                    () =>
                      'https://hub.qovery.com/docs/getting-started/install-qovery/gcp/cluster-managed-by-qovery/create-credentials/'
                  )
                  .exhaustive()}
                size="sm"
              >
                Learn more
              </ExternalLink>
            )}
          </span>
        }
        onSubmit={onSubmit}
        onClose={onClose}
        onDelete={onDelete}
        loading={isLoadingCreate || isLoadingEdit}
        isEdit={isEdit}
      >
        <div className="flex flex-col gap-y-4">
          {cloudProviderLocal === 'AWS' && (
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
          )}
          {watchType === 'STATIC' && (
            <>
              {cloudProviderLocal === 'AWS' && (
                <div className="flex flex-col gap-2 rounded border border-neutral-250 p-4">
                  <h2 className="text-sm font-medium text-neutral-400">1. Create a user for Qovery</h2>
                  <p className="text-sm text-neutral-350">Follow the instructions available on this page</p>
                  <ExternalLink
                    href="https://hub.qovery.com/docs/getting-started/install-qovery/aws/cluster-managed-by-qovery/create-credentials"
                    size="sm"
                  >
                    How to create new credentials
                  </ExternalLink>
                </div>
              )}
              {cloudProviderLocal === 'GCP' && (
                <>
                  <div className="flex flex-col gap-2 rounded border border-neutral-250 p-4">
                    <h2 className="text-sm font-medium text-neutral-400">
                      1. Connect to your GCP Console and create/open a project
                    </h2>
                    <p className="text-sm text-neutral-350">Make sure you are connected to the right GCP account</p>
                    <ExternalLink href="https://console.cloud.google.com/" size="sm">
                      https://console.cloud.google.com/
                    </ExternalLink>
                  </div>
                  <div className="flex flex-col gap-2 rounded border border-neutral-250 p-4">
                    <h2 className="text-sm font-medium text-neutral-400">
                      2. Open the embedded Google shell and run the following command
                    </h2>
                    <div className="flex gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
                      <div>
                        <span className="select-none">$ </span>
                        curl https://hub.qovery.com/files/create_credentials_gcp.sh | \ bash -s -- $GOOGLE_CLOUD_PROJECT
                        qovery_role qovery-service-account{' '}
                      </div>
                      <CopyButton
                        content=" curl https://hub.qovery.com/files/create_credentials_gcp.sh | \
bash -s -- $GOOGLE_CLOUD_PROJECT qovery_role qovery-service-account"
                      />
                    </div>
                  </div>
                </>
              )}
              {cloudProviderLocal === 'SCW' && (
                <div className="flex flex-col gap-2 rounded border border-neutral-250 p-4">
                  <h2 className="text-sm font-medium text-neutral-400">1. Generate Access key Id/Secret Access Key</h2>
                  <p className="text-sm text-neutral-350">Follow the instructions available on this page</p>
                  <ExternalLink
                    href="https://hub.qovery.com/docs/getting-started/install-qovery/scaleway/cluster-managed-by-qovery/create-credentials"
                    size="sm"
                  >
                    How to create new credentials
                  </ExternalLink>
                </div>
              )}
            </>
          )}
          {watchType === 'STS' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 rounded border border-neutral-250 p-4">
                <h2 className="text-sm font-medium text-neutral-400">1. Connect to your AWS Console</h2>
                <p className="text-sm text-neutral-350">Make sure you are connected to the right AWS account</p>
                <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                  https://aws.amazon.com/fr/console/
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-2 rounded border border-neutral-250 p-4">
                <h2 className="text-sm font-medium text-neutral-400">
                  2. Create a role for Qovery and grant assume role permissions
                </h2>
                <p className="text-sm text-neutral-350">
                  Execute the following Cloudformation stack and retrieve the role ARN from the “Output” section.
                </p>
                <ExternalLink
                  href="https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?templateURL=https%3A%2F%2Fs3.amazonaws.com%2Fcloudformation-qovery-role-creation%2Ftemplate.json&stackName=qovery-role-creation"
                  size="sm"
                >
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
                <CalloutEdit isEdit={isEdit} organizationId={organizationId} clusterId={clusterId} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded border border-neutral-250 p-4">
              <h2 className="text-sm font-medium text-neutral-400">
                {cloudProviderLocal === 'GCP'
                  ? '3. Download the key.json generated and drag and drop it here'
                  : '2. Fill these information'}
              </h2>
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
              {cloudProviderLocal === 'AWS' && (
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
              {cloudProviderLocal === 'SCW' && (
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
              {cloudProviderLocal === 'GCP' && (
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
              {cloudProviderLocal === 'AZURE' && (
                <>
                  <Controller
                    name="azure_tenant_id"
                    control={methods.control}
                    rules={{
                      required: 'Please enter your Azure tenant ID.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-azure-tenant-id"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Azure tenant ID"
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="azure_subscription_id"
                    control={methods.control}
                    rules={{
                      required: 'Please enter your Azure subscription ID.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-azure-subscription-id"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Azure subscription ID"
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="azure_client_id"
                    control={methods.control}
                    rules={{
                      required: 'Please enter your Azure client ID.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-azure-client-id"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Azure client ID"
                        error={error?.message}
                      />
                    )}
                  />
                  {isEditDirty && (
                    <>
                      <hr />
                      <span className="text-sm text-neutral-350">Confirm your Azure client secret</span>
                    </>
                  )}
                  {(!isEdit || isEditDirty) && (
                    <Controller
                      name="azure_client_secret"
                      control={methods.control}
                      rules={{
                        required: 'Please enter your Azure client secret',
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          dataTestId="input-azure-client-secret"
                          type="password"
                          name={field.name}
                          onChange={field.onChange}
                          value={field.value}
                          label="Azure client secret"
                          error={error?.message}
                        />
                      )}
                    />
                  )}
                  <Controller
                    name="azure_resource_group_name"
                    control={methods.control}
                    rules={{
                      required: 'Please enter your Azure resource group name.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        dataTestId="input-azure-resource-group-name"
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                        label="Azure resource group name"
                        error={error?.message}
                      />
                    )}
                  />
                </>
              )}
              <CalloutEdit isEdit={isEdit} organizationId={organizationId} clusterId={clusterId} />
            </div>
          )}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default ClusterCredentialsModal

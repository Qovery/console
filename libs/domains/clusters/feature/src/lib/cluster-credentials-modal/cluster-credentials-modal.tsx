import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
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
import { CopyButton } from '@qovery/shared/ui'
import { useClusterCloudProviderInfo } from '../hooks/use-cluster-cloud-provider-info/use-cluster-cloud-provider-info'

type ClusterCredentialsFormValues = {
  type: 'STS' | 'STATIC' | 'EKS_ANYWHERE_VSPHERE_ROLE' | 'EKS_ANYWHERE_VSPHERE_STATIC'
  name: string
  access_key_id?: string
  secret_access_key?: string
  vsphere_user?: string
  vsphere_password?: string
  scaleway_organization_id?: string
  scaleway_project_id?: string
  scaleway_access_key?: string
  scaleway_secret_key?: string
  gcp_credentials?: string
  role_arn?: string
  azure_subscription_id?: string
  azure_tenant_id?: string
  azure_application_id?: string
  azure_application_object_id?: string
  id?: string
}

type ClusterCredentialAuthType = ClusterCredentialsFormValues['type']
export type ClusterCredentialsModalCloudProvider = CloudProviderEnum | 'AWS_EKS_ANYWHERE'
const AWS_CREDENTIAL_TYPES: ClusterCredentialAuthType[] = ['STS', 'STATIC']
const EKS_ANYWHERE_CREDENTIAL_TYPES: ClusterCredentialAuthType[] = [
  'EKS_ANYWHERE_VSPHERE_ROLE',
  'EKS_ANYWHERE_VSPHERE_STATIC',
]

export interface ClusterCredentialsModalProps {
  organizationId: string
  clusterId?: string
  onClose: (response?: ClusterCredentials) => void
  credential?: ClusterCredentials
  cloudProvider?: ClusterCredentialsModalCloudProvider
}

export const handleSubmit = (data: FieldValues, cloudProvider: CloudProviderEnum) => {
  const currentData = {
    name: data['name'],
  }

  return match(cloudProvider)
    .with('AWS', (cp) => {
      return match(data['type'])
        .with('STS', () => ({
          cloudProvider: cp,
          payload: {
            ...currentData,
            type: 'AWS_ROLE' as const,
            role_arn: data['role_arn'],
          },
        }))
        .with('STATIC', () => ({
          cloudProvider: cp,
          payload: {
            ...currentData,
            type: 'AWS_STATIC' as const,
            access_key_id: data['access_key_id'],
            secret_access_key: data['secret_access_key'],
          },
        }))
        .with('EKS_ANYWHERE_VSPHERE_ROLE', () => ({
          cloudProvider: cp,
          payload: {
            ...currentData,
            type: 'EKS_ANYWHERE_VSPHERE_ROLE' as const,
            role_arn: data['role_arn'],
            vsphere_user: data['vsphere_user'],
            vsphere_password: data['vsphere_password'],
          },
        }))
        .with('EKS_ANYWHERE_VSPHERE_STATIC', () => ({
          cloudProvider: cp,
          payload: {
            ...currentData,
            type: 'EKS_ANYWHERE_VSPHERE_STATIC' as const,
            access_key_id: data['access_key_id'],
            secret_access_key: data['secret_access_key'],
            vsphere_user: data['vsphere_user'],
            vsphere_password: data['vsphere_password'],
          },
        }))
        .otherwise(() => ({
          cloudProvider: cp,
          payload: {
            ...currentData,
            type: 'AWS_STATIC' as const,
            access_key_id: data['access_key_id'],
            secret_access_key: data['secret_access_key'],
          },
        }))
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
        <Callout.TextDescription className="flex flex-col gap-1 text-warning">
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
  const isEksAnywhereEnabled = Boolean(useFeatureFlagEnabled('eks-anywhere'))
  const { enableAlertClickOutside } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: cloudProviderInfo } = useClusterCloudProviderInfo({
    organizationId,
    clusterId: clusterId ?? '',
    disabled: !!cloudProvider,
  })

  const cloudProviderLocal = cloudProviderInfo?.cloud_provider ?? cloudProvider ?? 'AWS'
  const isAwsMode = cloudProviderLocal === 'AWS' || cloudProviderLocal === 'AWS_EKS_ANYWHERE'
  const apiCloudProvider: CloudProviderEnum = cloudProviderLocal === 'AWS_EKS_ANYWHERE' ? 'AWS' : cloudProviderLocal

  const { mutateAsync: createCloudProviderCredential, isLoading: isLoadingCreate } = useCreateCloudProviderCredential()
  const { mutateAsync: deleteCloudProviderCredential } = useDeleteCloudProviderCredential()
  const { mutateAsync: editCloudProviderCredential, isLoading: isLoadingEdit } = useEditCloudProviderCredential()

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
  const inferredCredentialTypes = useMemo(
    () =>
      match(credential?.object_type)
        .with('EKS_ANYWHERE_VSPHERE', () => EKS_ANYWHERE_CREDENTIAL_TYPES)
        .with('AWS', 'AWS_ROLE', () => AWS_CREDENTIAL_TYPES)
        .otherwise(() => AWS_CREDENTIAL_TYPES),
    [credential?.object_type]
  )
  const awsAuthTypeOptions = useMemo(
    () =>
      (isEdit
        ? inferredCredentialTypes
        : cloudProviderLocal === 'AWS_EKS_ANYWHERE'
          ? EKS_ANYWHERE_CREDENTIAL_TYPES
          : AWS_CREDENTIAL_TYPES
      ).filter((type) =>
        type === 'EKS_ANYWHERE_VSPHERE_ROLE' || type === 'EKS_ANYWHERE_VSPHERE_STATIC' ? isEksAnywhereEnabled : true
      ),
    [cloudProviderLocal, inferredCredentialTypes, isEdit, isEksAnywhereEnabled]
  )

  const defaultType: ClusterCredentialsFormValues['type'] =
    credential?.object_type === 'EKS_ANYWHERE_VSPHERE'
      ? credential.role_arn
        ? 'EKS_ANYWHERE_VSPHERE_ROLE'
        : 'EKS_ANYWHERE_VSPHERE_STATIC'
      : credential?.object_type === 'AWS_ROLE' || (!isEdit && isAwsMode)
        ? 'STS'
        : 'STATIC'
  const initialType = awsAuthTypeOptions.includes(defaultType) ? defaultType : awsAuthTypeOptions[0] ?? 'STS'

  const methods = useForm<ClusterCredentialsFormValues>({
    mode: 'onChange',
    defaultValues: {
      type: initialType,
      name: credential?.name || '',
      role_arn: match(credential)
        .with({ role_arn: P.string }, (c) => c.role_arn)
        .otherwise(() => undefined),
      access_key_id: match(credential)
        .with({ access_key_id: P.string }, (c) => c.access_key_id)
        .otherwise(() => undefined),
      vsphere_user: match(credential)
        .with({ vsphere_user: P.string }, (c) => c.vsphere_user)
        .otherwise(() => undefined),
      vsphere_password: undefined,
      secret_access_key: undefined,
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
      azure_tenant_id: match(credential)
        .with({ azure_tenant_id: P.string }, (c) => c.azure_tenant_id)
        .otherwise(() => undefined),
      azure_subscription_id: match(credential)
        .with({ azure_subscription_id: P.string }, (c) => c.azure_subscription_id)
        .otherwise(() => undefined),
      azure_application_id: match(credential)
        .with({ azure_application_id: P.string }, (c) => c.azure_application_id)
        .otherwise(() => undefined),
    },
  })

  const isEditDirty = isEdit && methods.formState.isDirty

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const onSubmit = methods.handleSubmit(async (data) => {
    const isAzureSubmitSuccessful = methods.formState.isSubmitSuccessful && apiCloudProvider === 'AZURE'

    // When Azure credential is submitted (second click on "Done"), we need to close the modal with the response so that it fills the form automatically
    if (isAzureSubmitSuccessful) {
      const response: ClusterCredentials = {
        id: methods.getValues('id') ?? '',
        name: methods.getValues('name'),
        object_type: 'AZURE',
        azure_subscription_id: methods.getValues('azure_subscription_id') ?? '',
        azure_tenant_id: methods.getValues('azure_tenant_id') ?? '',
        azure_application_id: methods.getValues('azure_application_id') ?? '',
        azure_application_object_id: methods.getValues('azure_application_object_id') ?? '',
      }

      onClose(response)
      return
    }

    // Close without edit when no changes
    if (!methods.formState.isDirty) {
      onClose()
      return
    }

    const credentials = handleSubmit(data, apiCloudProvider)

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

        match({ cloudProvider: apiCloudProvider, response })
          .with(
            {
              cloudProvider: 'AZURE',
              response: { azure_application_id: P.string },
            },
            ({ response }) => {
              methods.setValue('id', response.id)
              methods.setValue('azure_application_id', response.azure_application_id)
              methods.setValue('azure_application_object_id', response.azure_application_object_id)
            }
          )
          .otherwise(() => {
            onClose(response)
          })
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
      confirmationMethod: 'action',
      action: async () => {
        if (credential?.id) {
          try {
            await deleteCloudProviderCredential({
              organizationId,
              cloudProvider: apiCloudProvider,
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
  const watchAzureApplicationId = methods.watch('azure_application_id')
  const watchAzureSubscriptionId = methods.watch('azure_subscription_id')
  const isAwsStsCredential = watchType === 'STS'
  const isAwsStaticCredential = watchType === 'STATIC'
  const isEksAnywhereRoleCredential = watchType === 'EKS_ANYWHERE_VSPHERE_ROLE'
  const isEksAnywhereStaticCredential = watchType === 'EKS_ANYWHERE_VSPHERE_STATIC'

  const submitLabel = isEdit
    ? 'Confirm'
    : match({ cloudProvider: apiCloudProvider, watchAzureApplicationId, watchAzureSubscriptionId })
        .with(
          {
            cloudProvider: 'AZURE',
            watchAzureApplicationId: P.not(P.string),
          },
          () => 'Next'
        )
        .with(
          {
            cloudProvider: 'AZURE',
            watchAzureApplicationId: P.string,
          },
          () => 'Done'
        )
        .otherwise(() => 'Create')

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={`${isEdit ? `Edit` : 'Create new'} credential`}
        description={
          <span className="flex gap-1">
            Follow these steps and give Qovery access to your {apiCloudProvider} account.
            {((isAwsStsCredential && isAwsMode) || apiCloudProvider === 'GCP') && (
              <ExternalLink
                href={match(apiCloudProvider)
                  .with('AWS', () => 'https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster')
                  .with(
                    'GCP',
                    () => 'https://www.qovery.com/docs/getting-started/installation/gcp#generate-installation-command'
                  )
                  .otherwise(() => 'https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster')}
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
        submitLabel={submitLabel}
        customLoader="Processing..."
      >
        <div className="flex flex-col gap-y-4">
          {isAwsMode && (
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
                  options={awsAuthTypeOptions.map((type) =>
                    match(type)
                      .with('STS', () => ({ label: 'Assume role via STS (preferred)', value: 'STS' }))
                      .with('STATIC', () => ({ label: 'Static credentials', value: 'STATIC' }))
                      .with('EKS_ANYWHERE_VSPHERE_ROLE', () => ({
                        label: 'EKS Anywhere on vSphere role (preferred)',
                        value: 'EKS_ANYWHERE_VSPHERE_ROLE',
                      }))
                      .with('EKS_ANYWHERE_VSPHERE_STATIC', () => ({
                        label: 'EKS Anywhere on vSphere static',
                        value: 'EKS_ANYWHERE_VSPHERE_STATIC',
                      }))
                      .exhaustive()
                  )}
                />
              )}
            />
          )}
          {(isAwsStaticCredential || isEksAnywhereStaticCredential) && (
            <>
              {isAwsMode && (
                <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                  <h2 className="text-sm font-medium text-neutral">1. Create a user for Qovery</h2>
                  <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
                  <ExternalLink
                    href="https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster"
                    size="sm"
                  >
                    How to create new credentials
                  </ExternalLink>
                </div>
              )}
              {cloudProviderLocal === 'GCP' && (
                <>
                  <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h2 className="text-sm font-medium text-neutral">
                      1. Connect to your GCP Console and create/open a project
                    </h2>
                    <p className="text-sm text-neutral-subtle">Make sure you are connected to the right GCP account</p>
                    <ExternalLink href="https://console.cloud.google.com/" size="sm">
                      https://console.cloud.google.com/
                    </ExternalLink>
                  </div>
                  <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                    <h2 className="text-sm font-medium text-neutral">
                      2. Open the embedded Google shell and run the following command
                    </h2>
                    <div className="flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px]">
                      <div>
                        <span className="select-none">$ </span>
                        curl https://setup.qovery.com/create_credentials_gcp.sh | \ bash -s -- $GOOGLE_CLOUD_PROJECT
                        qovery_role qovery-service-account{' '}
                      </div>
                      <CopyButton
                        content=" curl https://setup.qovery.com/create_credentials_gcp.sh | \
bash -s -- $GOOGLE_CLOUD_PROJECT qovery_role qovery-service-account"
                      />
                    </div>
                  </div>
                </>
              )}
              {cloudProviderLocal === 'SCW' && (
                <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                  <h2 className="text-sm font-medium text-neutral">1. Generate Access key Id/Secret Access Key</h2>
                  <p className="text-sm text-neutral-subtle">Follow the instructions available on this page</p>
                  <ExternalLink
                    href="https://www.qovery.com/docs/getting-started/installation/scaleway#step-1%3A-create-scaleway-credentials"
                    size="sm"
                  >
                    How to create new credentials
                  </ExternalLink>
                </div>
              )}
            </>
          )}
          {isAwsStsCredential || isEksAnywhereRoleCredential ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                <h2 className="text-sm font-medium text-neutral">1. Connect to your AWS Console</h2>
                <p className="text-sm text-neutral-subtle">Make sure you are connected to the right AWS account</p>
                <ExternalLink href="https://aws.amazon.com/fr/console/" size="sm">
                  https://aws.amazon.com/fr/console/
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                <h2 className="text-sm font-medium text-neutral">
                  2. Create a role for Qovery and grant assume role permissions
                </h2>
                <p className="text-sm text-neutral-subtle">
                  Execute the following Cloudformation stack and retrieve the role ARN from the “Output” section.
                </p>
                <ExternalLink
                  href="https://console.aws.amazon.com/cloudformation/home?#/stacks/quickcreate?templateURL=https%3A%2F%2Fs3.amazonaws.com%2Fcloudformation-qovery-role-creation%2Ftemplate.json&stackName=qovery-role-creation"
                  size="sm"
                >
                  Cloudformation stack
                </ExternalLink>
              </div>
              <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
                <h2 className="text-sm font-medium text-neutral">3. Insert here the role ARN</h2>
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
                {isEksAnywhereRoleCredential && (
                  <>
                    <Controller
                      name="vsphere_user"
                      control={methods.control}
                      rules={{
                        required: 'Please enter a vSphere user.',
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <InputText
                          dataTestId="input-vsphere-user"
                          name={field.name}
                          onChange={field.onChange}
                          value={field.value}
                          label="vSphere user"
                          error={error?.message}
                        />
                      )}
                    />
                    {isEditDirty && (
                      <>
                        <hr />
                        <span className="text-sm text-neutral-350">Confirm your vSphere password</span>
                      </>
                    )}
                    {(!isEdit || isEditDirty) && (
                      <Controller
                        name="vsphere_password"
                        control={methods.control}
                        rules={{
                          required: 'Please enter a vSphere password.',
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputText
                            dataTestId="input-vsphere-password"
                            type="password"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value}
                            label="vSphere password"
                            error={error?.message}
                          />
                        )}
                      />
                    )}
                  </>
                )}
                <CalloutEdit isEdit={isEdit} organizationId={organizationId} clusterId={clusterId} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral p-4">
              <h2 className="text-sm font-medium text-neutral">
                {cloudProviderLocal === 'GCP'
                  ? '3. Download the key.json generated and drag and drop it here'
                  : cloudProvider === 'AZURE'
                    ? '1. Fill these information'
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
              {(isAwsStaticCredential || isEksAnywhereStaticCredential) && isAwsMode && (
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
                      <hr className="border-neutral" />
                      <span className="text-sm text-neutral-subtle">Confirm your secret key</span>
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
                  {isEksAnywhereStaticCredential && (
                    <>
                      <Controller
                        name="vsphere_user"
                        control={methods.control}
                        rules={{
                          required: 'Please enter a vSphere user.',
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <InputText
                            dataTestId="input-vsphere-user"
                            name={field.name}
                            onChange={field.onChange}
                            value={field.value}
                            label="vSphere user"
                            error={error?.message}
                          />
                        )}
                      />
                      {isEditDirty && (
                        <>
                          <hr />
                          <span className="text-sm text-neutral-350">Confirm your vSphere password</span>
                        </>
                      )}
                      {(!isEdit || isEditDirty) && (
                        <Controller
                          name="vsphere_password"
                          control={methods.control}
                          rules={{
                            required: 'Please enter a vSphere password.',
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <InputText
                              dataTestId="input-vsphere-password"
                              type="password"
                              name={field.name}
                              onChange={field.onChange}
                              value={field.value}
                              label="vSphere password"
                              error={error?.message}
                            />
                          )}
                        />
                      )}
                    </>
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
                      <hr className="border-neutral" />
                      <span className="text-sm text-neutral-subtle">Confirm your secret key</span>
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
                        <div className="mb-[90px] flex items-center justify-between rounded border border-neutral p-4">
                          <div className="flex items-center pl-2 text-neutral">
                            <Icon iconName="file-arrow-down" className="mr-4" />
                            <p className="flex flex-col gap-1">
                              <span className="text-xs font-medium">{fileDetails.name}</span>
                              <span className="text-xs text-neutral-subtle">{fileDetails.size} Ko</span>
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
                </>
              )}
              <CalloutEdit isEdit={isEdit} organizationId={organizationId} clusterId={clusterId} />
            </div>
          )}

          {match({ cloudProviderLocal, watchAzureApplicationId, watchAzureSubscriptionId })
            .with(
              { cloudProviderLocal: 'AZURE', watchAzureApplicationId: P.string, watchAzureSubscriptionId: P.string },
              ({ watchAzureApplicationId, watchAzureSubscriptionId }) => {
                const snippet = `bash <(curl -s https://setup.qovery.com/create_credentials_azure.sh) --qovery-app-id ${watchAzureApplicationId}  --subscription-id ${watchAzureSubscriptionId}`

                return (
                  <>
                    <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                      <h2 className="text-sm font-medium text-neutral">
                        2. Connect to your Azure Console and go to shell console
                      </h2>
                      <p className="text-sm text-neutral-subtle">
                        Make sure you are connected to the right Azure account
                      </p>
                      <ExternalLink href="https://portal.azure.com/" size="sm">
                        https://portal.azure.com/
                      </ExternalLink>
                    </div>
                    <div className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4">
                      <h2 className="text-sm font-medium text-neutral">
                        3. Open the embedded Azure shell and run the following command
                      </h2>
                      <div>
                        <p className="text-sm text-neutral-subtle">
                          Select `Bash`, then `No storage account required` and your subscription ID.
                        </p>
                        <p className="text-sm text-neutral-subtle">
                          Please note that this script can take up to 30 seconds to complete.
                        </p>
                      </div>
                      <div className="flex gap-6 rounded border border-neutral bg-surface-neutral-subtle p-3 text-neutral retina:border-[0.5px]">
                        <div>
                          <span className="select-none">$ </span>
                          {snippet}
                        </div>
                        <CopyButton content={snippet} />
                      </div>
                    </div>
                  </>
                )
              }
            )
            .otherwise(() => {
              return null
            })}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default ClusterCredentialsModal

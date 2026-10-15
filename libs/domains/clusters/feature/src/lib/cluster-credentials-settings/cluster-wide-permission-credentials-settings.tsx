import { useParams } from '@tanstack/react-router'
import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { Icon, InputSelect, LoaderSpinner, useModal } from '@qovery/shared/ui'
import {
  type ClusterCredentialAuthType,
  ClusterCredentialsModal,
} from '../cluster-credentials-modal/cluster-credentials-modal'

// Wide permission credentials must be an AWS role (assumed via STS)
const WIDE_PERMISSION_CREDENTIAL_TYPES: ClusterCredentialAuthType[] = ['STS']

export interface ClusterWidePermissionCredentialsSettingsProps {
  cloudProvider?: CloudProviderEnum
  fieldName?: 'wide_permission_credentials' | 'configured_credentials'
}

export const filterWidePermissionCredentials = (credentials: ClusterCredentials[]) =>
  credentials.filter((credential) => credential.object_type === 'AWS_ROLE')

export function ClusterWidePermissionCredentialsSettings({
  cloudProvider,
  fieldName = 'wide_permission_credentials',
}: ClusterWidePermissionCredentialsSettingsProps) {
  const { organizationId = '', clusterId } = useParams({ strict: false })
  const { control, getValues } = useFormContext()
  const isUsingRestrictivePermissions = Boolean(useWatch({ control, name: 'using_restrictive_permissions' }))
  const { openModal, closeModal } = useModal()

  const { data: credentials = [], isLoading } = useCloudProviderCredentials({
    organizationId,
    cloudProvider,
  })
  const sortedCredentials = [...credentials].sort((a, b) => a.name.localeCompare(b.name))
  const widePermissionCredentials = filterWidePermissionCredentials(sortedCredentials)
  const availableCredentials = (
    fieldName === 'configured_credentials' && !isUsingRestrictivePermissions
      ? sortedCredentials
      : widePermissionCredentials
  ).map((item) => ({
    label: 'access_key_id' in item ? `${item.name} (${item.access_key_id})` : item.name,
    value: item.id,
  }))

  const openCredentialsModal = (onChange: (e: string | string[]) => void) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          clusterId={clusterId}
          onClose={(response) => {
            response && onChange(response.id)
            closeModal()
          }}
          cloudProvider={cloudProvider}
          allowedTypes={
            fieldName === 'configured_credentials' && !isUsingRestrictivePermissions
              ? undefined
              : WIDE_PERMISSION_CREDENTIAL_TYPES
          }
        />
      ),
      options: {
        width: 680,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="mt-2 flex justify-center">
        <LoaderSpinner className="w-4" />
      </div>
    )
  }

  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{
        validate: (value) => {
          if (!value && (fieldName === 'configured_credentials' || getValues('using_restrictive_permissions'))) {
            return 'Please select a credential.'
          }
          if (
            fieldName === 'configured_credentials' &&
            isUsingRestrictivePermissions &&
            !widePermissionCredentials.some((credential) => credential.id === value)
          ) {
            return 'Select an AWS role credential for wider access.'
          }
          return true
        },
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          dataTestId={
            fieldName === 'wide_permission_credentials'
              ? 'input-wide-permission-credentials'
              : 'input-configured-credentials'
          }
          label={fieldName === 'configured_credentials' ? 'Extended credentials' : 'Credentials'}
          options={availableCredentials}
          onChange={field.onChange}
          value={field.value}
          error={error?.message}
          isSearchable
          menuListButton={{
            title: 'Select credential',
            label: 'New credential',
            icon: <Icon iconName="circle-plus" className="text-brand" />,
            onClick: () => openCredentialsModal(field.onChange),
          }}
        />
      )}
    />
  )
}

export default ClusterWidePermissionCredentialsSettings

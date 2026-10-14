import { useParams } from '@tanstack/react-router'
import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { Icon, InputSelect, LoaderSpinner, useModal } from '@qovery/shared/ui'
import {
  type ClusterCredentialAuthType,
  ClusterCredentialsModal,
} from '../cluster-credentials-modal/cluster-credentials-modal'

// Extended permissions credentials must be an AWS role (assumed via STS)
const WIDE_PERMISSION_CREDENTIAL_TYPES: ClusterCredentialAuthType[] = ['STS']

export interface ClusterWidePermissionCredentialsSettingsProps {
  cloudProvider?: CloudProviderEnum
}

export const filterWidePermissionCredentials = (credentials: ClusterCredentials[]) =>
  credentials.filter((credential) => credential.object_type === 'AWS_ROLE')

export function ClusterWidePermissionCredentialsSettings({
  cloudProvider,
}: ClusterWidePermissionCredentialsSettingsProps) {
  const { organizationId = '', clusterId } = useParams({ strict: false })
  const { control, getValues } = useFormContext()
  const { openModal, closeModal } = useModal()

  const { data: credentials = [], isLoading } = useCloudProviderCredentials({
    organizationId,
    cloudProvider,
  })
  const widePermissionCredentials = filterWidePermissionCredentials(credentials)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({ label: item.name, value: item.id }))

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
          allowedTypes={WIDE_PERMISSION_CREDENTIAL_TYPES}
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
      name="wide_permission_credentials"
      control={control}
      rules={{
        // The field stays registered when the toggle is turned off, so only require it while restrictive permissions are used
        validate: (value) =>
          !getValues('using_restrictive_permissions') || Boolean(value) || 'Please select a credential.',
      }}
      render={({ field, fieldState: { error } }) => (
        <InputSelect
          dataTestId="input-wide-permission-credentials"
          label="Credentials"
          hint="Only AWS role credentials can be used for extended permissions."
          options={widePermissionCredentials}
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

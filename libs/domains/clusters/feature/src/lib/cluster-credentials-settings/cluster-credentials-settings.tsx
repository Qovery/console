import { useParams } from '@tanstack/react-router'
import { type ClusterCredentials } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { Button, EmptyState, Icon, InputSelect, LoaderSpinner, useModal } from '@qovery/shared/ui'
import {
  ClusterCredentialsModal,
  type ClusterCredentialsModalCloudProvider,
} from '../cluster-credentials-modal/cluster-credentials-modal'

export interface ClusterCredentialsSettingsProps {
  cloudProvider?: ClusterCredentialsModalCloudProvider
  isSetting?: boolean
  fieldName?: 'credentials' | 'restricted_credentials'
  portal?: boolean
  maxMenuHeight?: number
}

export const filterCredentialsByCloudProvider = (
  credentials: ClusterCredentials[],
  cloudProvider?: ClusterCredentialsModalCloudProvider
) => {
  if (cloudProvider !== 'AWS_EKS_ANYWHERE') {
    return credentials
  }

  return credentials.filter((credential) => credential.object_type === 'EKS_ANYWHERE_VSPHERE')
}

export function ClusterCredentialsSettings({
  cloudProvider,
  isSetting,
  fieldName = 'credentials',
  portal,
  maxMenuHeight,
}: ClusterCredentialsSettingsProps) {
  const { organizationId = '', clusterId } = useParams({ strict: false })
  const { control } = useFormContext()
  const { openModal, closeModal } = useModal()

  const queryCloudProvider = cloudProvider === 'AWS_EKS_ANYWHERE' ? 'AWS' : cloudProvider

  const { data: credentials = [], isLoading } = useCloudProviderCredentials({
    organizationId,
    cloudProvider: queryCloudProvider,
  })
  const sortedCredentials = [...filterCredentialsByCloudProvider(credentials, cloudProvider)].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const openCredentialsModal = useCallback(
    (id?: string, onChange?: (e: string | string[]) => void) => {
      openModal({
        content: (
          <ClusterCredentialsModal
            organizationId={organizationId}
            clusterId={clusterId}
            onClose={(response) => {
              response && onChange?.(response.id)
              closeModal()
            }}
            credential={sortedCredentials.find(
              (currentCredentials: ClusterCredentials) => currentCredentials.id === id
            )}
            cloudProvider={cloudProvider}
          />
        ),
        options: {
          width: 680,
        },
      })
    },
    [cloudProvider, clusterId, closeModal, openModal, organizationId, sortedCredentials]
  )

  const buildCredentials = sortedCredentials.map((item: ClusterCredentials) => ({
    label: `${item.name}${'access_key_id' in item ? ` (${item.access_key_id})` : ''}`,
    value: item.id,
    onClickEditable: !isSetting ? () => openCredentialsModal(item.id) : undefined,
  }))

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
        required: 'Please select a credential.',
      }}
      render={({ field, fieldState: { error } }) =>
        !isSetting && sortedCredentials.length === 0 ? (
          <EmptyState
            size="sm"
            icon="key"
            iconStyle="regular"
            title="No cloud credentials"
            description="Connect your cloud account to continue."
            className="border-dashed"
          >
            <Button
              type="button"
              color="neutral"
              variant="outline"
              onClick={() => openCredentialsModal(undefined, field.onChange)}
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add New Credential
            </Button>
          </EmptyState>
        ) : (
          <InputSelect
            dataTestId={fieldName === 'credentials' ? 'input-credentials' : 'input-restricted-credentials'}
            label={fieldName === 'restricted_credentials' ? 'Restricted credentials' : 'Credentials'}
            portal={portal}
            maxMenuHeight={maxMenuHeight}
            options={buildCredentials}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            isSearchable
            menuListButton={{
              title: 'Select credential',
              label: 'New credential',
              icon: <Icon iconName="circle-plus" className="text-brand" />,
              onClick: () => openCredentialsModal(undefined, field.onChange),
            }}
          />
        )
      }
    />
  )
}

export default ClusterCredentialsSettings

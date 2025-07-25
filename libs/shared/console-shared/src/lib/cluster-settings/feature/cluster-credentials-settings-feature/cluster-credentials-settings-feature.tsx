import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { ClusterCredentialsModal } from '@qovery/domains/clusters/feature'
import { useModal } from '@qovery/shared/ui'
import { ClusterCredentialsSettings } from '../../ui/cluster-credentials-settings/cluster-credentials-settings'

export interface ClusterCredentialsSettingsFeatureProps {
  cloudProvider?: CloudProviderEnum
  isSetting?: boolean
}

export function ClusterCredentialsSettingsFeature({
  cloudProvider,
  isSetting,
}: ClusterCredentialsSettingsFeatureProps) {
  const { organizationId = '', clusterId } = useParams()
  const { openModal, closeModal } = useModal()
  const { data: credentials = [], isLoading: isLoadingCloudProviderCredentials } = useCloudProviderCredentials({
    organizationId,
    cloudProvider,
  })
  const sortedCredentials = credentials.sort((a, b) => a.name.localeCompare(b.name))

  const openCredentialsModal = (id?: string, onChange?: (e: string | string[]) => void) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          clusterId={clusterId}
          onClose={(response) => {
            response && onChange?.(response.id)
            closeModal()
          }}
          credential={sortedCredentials.find((currentCredentials: ClusterCredentials) => currentCredentials.id === id)}
          cloudProvider={cloudProvider}
        />
      ),
      options: {
        width: 680,
      },
    })
  }

  return (
    <ClusterCredentialsSettings
      credentials={sortedCredentials}
      openCredentialsModal={openCredentialsModal}
      loading={isLoadingCloudProviderCredentials}
      isSetting={isSetting}
    />
  )
}

export default ClusterCredentialsSettingsFeature

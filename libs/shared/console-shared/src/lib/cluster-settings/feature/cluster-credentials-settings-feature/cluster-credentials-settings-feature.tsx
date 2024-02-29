import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { useModal } from '@qovery/shared/ui'
import ClusterCredentialsSettings from '../../ui/cluster-credentials-settings/cluster-credentials-settings'
import CreateEditCredentialsModalFeature from '../create-edit-credentials-modal-feature/create-edit-credentials-modal-feature'

export interface ClusterCredentialsSettingsFeatureProps {
  cloudProvider?: CloudProviderEnum
}

export function ClusterCredentialsSettingsFeature({ cloudProvider }: ClusterCredentialsSettingsFeatureProps) {
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const { data: credentials = [], isLoading: isLoadingCloudProviderCredentials } = useCloudProviderCredentials({
    organizationId,
    cloudProvider,
  })

  const openCredentialsModal = (id?: string, onChange?: (e: string | string[]) => void) => {
    openModal({
      content: (
        <CreateEditCredentialsModalFeature
          currentCredential={credentials.find((currentCredentials: ClusterCredentials) => currentCredentials.id === id)}
          cloudProvider={cloudProvider!}
          onClose={(response) => {
            response && onChange?.(response.id)
            closeModal()
          }}
          organizationId={organizationId}
        />
      ),
    })
  }

  return (
    <ClusterCredentialsSettings
      credentials={credentials}
      openCredentialsModal={openCredentialsModal}
      loading={isLoadingCloudProviderCredentials}
    />
  )
}

export default ClusterCredentialsSettingsFeature

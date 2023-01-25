import { CloudProviderEnum, ClusterCredentials } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCredentialsList, selectOrganizationById } from '@qovery/domains/organization'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import ClusterCredentialsSettings from '../../ui/cluster-credentials-settings/cluster-credentials-settings'
import CreateEditCredentialsModalFeature from '../create-edit-credentials-modal-feature/create-edit-credentials-modal-feature'

export interface ClusterCredentialsSettingsFeatureProps {
  cloudProvider: CloudProviderEnum
}

export function ClusterCredentialsSettingsFeature(props: ClusterCredentialsSettingsFeatureProps) {
  const { cloudProvider } = props
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const dispatch = useDispatch<AppDispatch>()
  const credentials = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )?.credentials

  const openCredentialsModal = (id?: string) => {
    openModal({
      content: (
        <CreateEditCredentialsModalFeature
          currentCredential={
            credentials &&
            credentials[cloudProvider]?.items?.find(
              (currentCredentials: ClusterCredentials) => currentCredentials.id === id
            )
          }
          cloudProvider={cloudProvider}
          onClose={closeModal}
          organizationId={organizationId}
        />
      ),
    })
  }

  useEffect(() => {
    dispatch(fetchCredentialsList({ cloudProvider, organizationId }))
  }, [dispatch, cloudProvider, organizationId])

  return (
    <ClusterCredentialsSettings
      credentials={credentials ? credentials[cloudProvider] : undefined}
      openCredentialsModal={openCredentialsModal}
    />
  )
}

export default ClusterCredentialsSettingsFeature

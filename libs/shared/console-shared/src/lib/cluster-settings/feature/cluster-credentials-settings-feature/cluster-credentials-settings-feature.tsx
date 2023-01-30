import { CloudProviderEnum, ClusterCredentials } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCredentialsList, selectOrganizationById } from '@qovery/domains/organization'
import { ClusterCredentialsEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import ClusterCredentialsSettings from '../../ui/cluster-credentials-settings/cluster-credentials-settings'
import CreateEditCredentialsModalFeature from '../create-edit-credentials-modal-feature/create-edit-credentials-modal-feature'

export interface ClusterCredentialsSettingsFeatureProps {
  cloudProvider?: CloudProviderEnum
}

export function ClusterCredentialsSettingsFeature(props: ClusterCredentialsSettingsFeatureProps) {
  const { cloudProvider } = props
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const dispatch = useDispatch<AppDispatch>()
  const credentialsByCloudProvider = useSelector<RootState, ClusterCredentialsEntity[] | undefined>((state) =>
    selectOrganizationById(state, organizationId)?.credentials?.items?.filter(
      (item) => item.cloudProvider === cloudProvider
    )
  )
  const credentialsLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => selectOrganizationById(state, organizationId)?.credentials?.loadingStatus
  )

  const openCredentialsModal = (id?: string) => {
    cloudProvider &&
      openModal({
        content: (
          <CreateEditCredentialsModalFeature
            currentCredential={credentialsByCloudProvider?.find(
              (currentCredentials: ClusterCredentials) => currentCredentials.id === id
            )}
            cloudProvider={cloudProvider}
            onClose={closeModal}
            organizationId={organizationId}
          />
        ),
      })
  }

  useEffect(() => {
    cloudProvider &&
      credentialsLoadingStatus !== 'loaded' &&
      dispatch(fetchCredentialsList({ cloudProvider, organizationId }))
  }, [dispatch, cloudProvider, organizationId, credentialsLoadingStatus])

  return (
    <ClusterCredentialsSettings
      credentials={credentialsByCloudProvider}
      openCredentialsModal={openCredentialsModal}
      loadingStatus={credentialsLoadingStatus}
    />
  )
}

export default ClusterCredentialsSettingsFeature

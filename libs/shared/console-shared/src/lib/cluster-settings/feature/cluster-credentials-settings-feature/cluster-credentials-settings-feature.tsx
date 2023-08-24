import equal from 'fast-deep-equal'
import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCredentialsList, selectOrganizationById } from '@qovery/domains/organization'
import { type ClusterCredentialsEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { useModal } from '@qovery/shared/ui'
import { type AppDispatch, type RootState } from '@qovery/state/store'
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
  const credentials = useSelector<RootState, ClusterCredentialsEntity[] | undefined>(
    (state) => selectOrganizationById(state, organizationId)?.credentials?.items,
    equal
  )
  const credentialsLoadingStatus = useSelector<RootState, LoadingStatus>(
    (state) => selectOrganizationById(state, organizationId)?.credentials?.loadingStatus
  )

  const credentialsByCloudProvider = useMemo(
    () => credentials?.filter((item) => item.cloudProvider === cloudProvider),
    [cloudProvider, credentials]
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
    if (cloudProvider) dispatch(fetchCredentialsList({ cloudProvider, organizationId }))
  }, [dispatch, cloudProvider, organizationId])

  return (
    <ClusterCredentialsSettings
      credentials={credentialsByCloudProvider}
      openCredentialsModal={openCredentialsModal}
      loadingStatus={credentialsLoadingStatus}
    />
  )
}

export default ClusterCredentialsSettingsFeature

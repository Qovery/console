import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchCredentialsList, getOrganizationState } from '@qovery/domains/organization'
import { AppDispatch, RootState } from '@qovery/store'
import ClusterCredentialsSettings from '../../ui/cluster-credentials-settings/cluster-credentials-settings'

export interface ClusterCredentialsSettingsFeatureProps {
  cloudProvider: CloudProviderEnum
}

export function ClusterCredentialsSettingsFeature(props: ClusterCredentialsSettingsFeatureProps) {
  const { cloudProvider } = props
  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const credentials = useSelector<RootState, any>((state) => getOrganizationState(state).credentials)

  useEffect(() => {
    dispatch(fetchCredentialsList({ cloudProvider, organizationId }))
  }, [dispatch, cloudProvider, organizationId])

  return <ClusterCredentialsSettings credentials={credentials[cloudProvider.toLowerCase()]} />
}

export default ClusterCredentialsSettingsFeature

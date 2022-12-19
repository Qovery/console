import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchClustersStatus,
  selectClustersEntitiesByOrganizationId,
  selectClustersLoadingStatus,
  selectClustersStatusLoadingStatus,
} from '@qovery/domains/organization'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageClustersGeneral from '../../ui/page-clusters-general/page-clusters-general'

export function PageClustersGeneralFeature() {
  const { organizationId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()
  const clusters = useSelector((state: RootState) => selectClustersEntitiesByOrganizationId(state, organizationId))
  const clustersLoading = useSelector((state: RootState) => selectClustersLoadingStatus(state))
  const clustersStatusLoading = useSelector((state: RootState) => selectClustersStatusLoadingStatus(state))

  useDocumentTitle('General - Clusters')

  useEffect(() => {
    const fetchClustersStatusByInterval = setInterval(() => {
      if (clusters.length > 0) dispatch(fetchClustersStatus({ organizationId }))
    }, 3000)
    if (clusters.length > 0) dispatch(fetchClustersStatus({ organizationId }))
    return () => clearInterval(fetchClustersStatusByInterval)
  }, [dispatch, organizationId, clusters.length])

  return (
    <PageClustersGeneral clusters={clusters} loading={clusters.length > 0 ? clustersStatusLoading : clustersLoading} />
  )
}

export default PageClustersGeneralFeature

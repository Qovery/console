import { StateEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchClusters,
  fetchCurrentCost,
  selectClustersEntitiesByOrganizationId,
  selectOrganizationById,
} from '@qovery/domains/organization'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationBillingSummary from '../../ui/page-organization-billing-summary/page-organization-billing-summary'

export function PageOrganizationBillingSummaryFeature() {
  const { organizationId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId || ''))
  const clusters = useSelector((state: RootState) =>
    selectClustersEntitiesByOrganizationId(state, organizationId || '')
  )

  const numberOfRunningClusters =
    clusters?.reduce((acc, cluster) => {
      if (cluster.status === StateEnum.RUNNING) {
        return acc + 1
      }
      return acc
    }, 0) || undefined
  const numberOfClusters = clusters?.length || undefined

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchCurrentCost({ organizationId }))
      dispatch(fetchClusters({ organizationId }))
    }
  }, [organizationId, dispatch])

  return (
    <PageOrganizationBillingSummary
      organization={organization}
      numberOfClusters={numberOfClusters}
      numberOfRunningClusters={numberOfRunningClusters}
    />
  )
}

export default PageOrganizationBillingSummaryFeature

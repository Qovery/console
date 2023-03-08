import { StateEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchClusters,
  fetchCreditCards,
  fetchCurrentCost,
  selectClustersEntitiesByOrganizationId,
  selectCreditCardsByOrganizationId,
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
  const creditCards = useSelector((state: RootState) => selectCreditCardsByOrganizationId(state, organizationId || ''))
  const creditCard = creditCards?.[0]

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
      dispatch(fetchCreditCards({ organizationId }))
    }
  }, [organizationId, dispatch])

  return (
    <PageOrganizationBillingSummary
      organization={organization}
      numberOfClusters={numberOfClusters}
      numberOfRunningClusters={numberOfRunningClusters}
      creditCard={creditCard}
    />
  )
}

export default PageOrganizationBillingSummaryFeature

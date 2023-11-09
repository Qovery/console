import { ClusterStateEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import {
  fetchClusters,
  selectClustersEntitiesByOrganizationId,
  selectClustersLoadingStatus,
} from '@qovery/domains/organization'
import { useCreditCards, useCurrentCost } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageOrganizationBillingSummary from '../../ui/page-organization-billing-summary/page-organization-billing-summary'
import PromoCodeModalFeature from './promo-code-modal-feature/promo-code-modal-feature'

export function PageOrganizationBillingSummaryFeature() {
  useDocumentTitle('Billing summary - Organization settings')

  const { openModal, closeModal } = useModal()

  const { organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const clusters = useSelector((state: RootState) =>
    selectClustersEntitiesByOrganizationId(state, organizationId || '')
  )
  const clustersStatusLoading = useSelector(selectClustersLoadingStatus)

  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })
  const { data: currentCost } = useCurrentCost({ organizationId })
  const { show: showIntercom } = useIntercom()

  const numberOfRunningClusters =
    clusters?.reduce((acc, cluster) => {
      if (cluster.status === ClusterStateEnum.DEPLOYED) {
        return acc + 1
      }
      return acc
    }, 0) || 0
  const numberOfClusters = clusters?.length || undefined

  useEffect(() => {
    if (clustersStatusLoading === 'not loaded') {
      dispatch(fetchClusters({ organizationId }))
    }
  }, [organizationId, dispatch, clustersStatusLoading])

  const openPromoCodeModal = () => {
    openModal({
      content: <PromoCodeModalFeature closeModal={closeModal} organizationId={organizationId} />,
    })
  }

  return (
    <PageOrganizationBillingSummary
      currentCost={currentCost}
      numberOfClusters={numberOfClusters}
      numberOfRunningClusters={numberOfRunningClusters}
      creditCard={creditCards[0]}
      creditCardLoading={isLoadingCreditCards}
      onPromoCodeClick={openPromoCodeModal}
      openIntercom={showIntercom}
    />
  )
}

export default PageOrganizationBillingSummaryFeature

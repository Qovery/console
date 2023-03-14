import { StateEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchClusters,
  fetchCreditCards,
  fetchCurrentCost,
  getCreditCardsState,
  selectClustersEntitiesByOrganizationId,
  selectClustersLoadingStatus,
  selectCreditCardsByOrganizationId,
  selectOrganizationById,
} from '@qovery/domains/organization'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationBillingSummary from '../../ui/page-organization-billing-summary/page-organization-billing-summary'
import PromoCodeModalFeature from './promo-code-modal-feature/promo-code-modal-feature'
import UpgradePlanModalFeature from './upgrade-plan-modal-feature/upgrade-plan-modal-feature'

export function PageOrganizationBillingSummaryFeature() {
  useDocumentTitle('Billing summary - Organization settings')

  const { openModal, closeModal } = useModal()

  const { organizationId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId || ''))
  const clusters = useSelector((state: RootState) =>
    selectClustersEntitiesByOrganizationId(state, organizationId || '')
  )
  const clustersStatusLoading = useSelector(selectClustersLoadingStatus)
  const creditCards = useSelector((state: RootState) => selectCreditCardsByOrganizationId(state, organizationId || ''))
  const creditCard = creditCards?.[0]
  const creditCardLoadingStatus = useSelector<RootState, string | undefined>(
    (state) => getCreditCardsState(state).loadingStatus
  )

  const numberOfRunningClusters =
    clusters?.reduce((acc, cluster) => {
      if (cluster.status === StateEnum.RUNNING) {
        return acc + 1
      }
      return acc
    }, 0) || 0
  const numberOfClusters = clusters?.length || undefined

  useEffect(() => {
    if (organizationId && !organization?.currentCost?.loadingStatus) {
      dispatch(fetchCurrentCost({ organizationId }))
    }
  }, [organizationId, dispatch, organization?.currentCost?.loadingStatus])

  useEffect(() => {
    if (organizationId && creditCardLoadingStatus === 'not loaded') dispatch(fetchCreditCards({ organizationId }))
  }, [organizationId, dispatch, creditCardLoadingStatus])

  useEffect(() => {
    if (organizationId && clustersStatusLoading === 'not loaded') {
      dispatch(fetchClusters({ organizationId }))
    }
  }, [organizationId, dispatch, clustersStatusLoading])

  const openPromoCodeModal = () => {
    openModal({
      content: <PromoCodeModalFeature closeModal={closeModal} organizationId={organizationId} />,
    })
  }

  const openUpgradeModal = () => {
    openModal({
      content: <UpgradePlanModalFeature closeModal={closeModal} organization={organization} />,
    })
  }

  return (
    <PageOrganizationBillingSummary
      organization={organization}
      numberOfClusters={numberOfClusters}
      numberOfRunningClusters={numberOfRunningClusters}
      creditCard={creditCard}
      creditCardLoading={creditCardLoadingStatus === 'loading'}
      onPromoCodeClick={openPromoCodeModal}
      openUpgradeModal={openUpgradeModal}
    />
  )
}

export default PageOrganizationBillingSummaryFeature

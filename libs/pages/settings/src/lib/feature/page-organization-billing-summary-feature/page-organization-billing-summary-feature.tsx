import { useParams } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { useCreditCards, useCurrentCost } from '@qovery/domains/organizations/feature'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationBillingSummary from '../../ui/page-organization-billing-summary/page-organization-billing-summary'
import PromoCodeModalFeature from './promo-code-modal-feature/promo-code-modal-feature'
import ShowUsageModalFeature from './show-usage-modal-feature/show-usage-modal-feature'

export function PageOrganizationBillingSummaryFeature() {
  useDocumentTitle('Billing summary - Organization settings')

  const { openModal, closeModal } = useModal()

  const { organizationId = '' } = useParams()

  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })
  const { data: currentCost } = useCurrentCost({ organizationId })
  const { show: showIntercom } = useIntercom()

  const openPromoCodeModal = () => {
    openModal({
      content: <PromoCodeModalFeature closeModal={closeModal} organizationId={organizationId} />,
    })
  }

  const openShowUsageModal = () => {
    openModal({
      content: currentCost && <ShowUsageModalFeature organizationId={organizationId} currentCost={currentCost} />,
    })
  }

  return (
    <PageOrganizationBillingSummary
      currentCost={currentCost}
      creditCard={creditCards[0]}
      creditCardLoading={isLoadingCreditCards}
      onPromoCodeClick={openPromoCodeModal}
      onShowUsageClick={openShowUsageModal}
      openIntercom={showIntercom}
    />
  )
}

export default PageOrganizationBillingSummaryFeature

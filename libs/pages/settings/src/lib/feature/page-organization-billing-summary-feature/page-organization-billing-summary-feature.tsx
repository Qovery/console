import { useParams } from 'react-router-dom'
import { useCreditCards, useCurrentCost } from '@qovery/domains/organizations/feature'
import { AddCreditCardModalFeature } from '@qovery/shared/console-shared'
import { useUserRole } from '@qovery/shared/iam/feature'
import { useModal } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import PageOrganizationBillingSummary from '../../ui/page-organization-billing-summary/page-organization-billing-summary'
import PlanSelectionModalFeature from './plan-selection-modal-feature/plan-selection-modal-feature'
import PromoCodeModalFeature from './promo-code-modal-feature/promo-code-modal-feature'
import ShowUsageModalFeature from './show-usage-modal-feature/show-usage-modal-feature'

export function PageOrganizationBillingSummaryFeature() {
  useDocumentTitle('Billing summary - Organization settings')

  const { openModal, closeModal } = useModal()

  const { organizationId = '' } = useParams()

  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })
  const { data: currentCost } = useCurrentCost({ organizationId })
  const { showChat, showPylonForm } = useSupportChat()
  const { isQoveryAdminUser } = useUserRole()

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

  const openPlanSelectionModal = () => {
    openModal({
      content: (
        <PlanSelectionModalFeature
          closeModal={closeModal}
          organizationId={organizationId}
          currentPlan={currentCost?.plan}
        />
      ),
    })
  }

  const handleChangePlanClick = () => {
    if (isQoveryAdminUser) {
      openPlanSelectionModal()
    } else {
      showChat()
    }
  }

  const handleCancelTrialClick = () => {
    showPylonForm('cancel-free-trial')
  }

  const handleAddCreditCardClick = () => {
    openModal({
      content: <AddCreditCardModalFeature organizationId={organizationId} />,
    })
  }

  return (
    <PageOrganizationBillingSummary
      currentCost={currentCost}
      creditCard={creditCards[0]}
      creditCardLoading={isLoadingCreditCards}
      hasCreditCard={creditCards.length > 0}
      onPromoCodeClick={openPromoCodeModal}
      onShowUsageClick={openShowUsageModal}
      onChangePlanClick={handleChangePlanClick}
      onCancelTrialClick={handleCancelTrialClick}
      onAddCreditCardClick={handleAddCreditCardClick}
    />
  )
}

export default PageOrganizationBillingSummaryFeature

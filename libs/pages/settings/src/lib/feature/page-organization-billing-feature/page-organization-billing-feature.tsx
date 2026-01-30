import { type CreditCard } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useCreditCards, useDeleteCreditCard } from '@qovery/domains/organizations/feature'
import { type CreditCardFormValues } from '@qovery/shared/console-shared'
import { useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import PageOrganizationBilling from '../../ui/page-organization-billing/page-organization-billing'

export function PageOrganizationBillingFeature() {
  useDocumentTitle('Billing details - Organization settings')
  const { organizationId = '' } = useParams()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })
  const { mutateAsync: deleteCreditCard } = useDeleteCreditCard()
  const [showAddCard, setShowAddCard] = useState(false)

  const methods = useForm<CreditCardFormValues>({
    mode: 'onChange',
  })

  const handleAddCard = () => {
    setShowAddCard(true)
    // Scroll to billing details form after a short delay to let the state update
    setTimeout(() => {
      const billingForm = document.querySelector('[data-billing-details-form]')
      if (billingForm) {
        billingForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const onDeleteCreditCard = (creditCard: CreditCard) => {
    openModalConfirmation({
      title: 'Delete credit card',
      name: creditCard.last_digit,
      confirmationMethod: 'action',
      action: async () => {
        await deleteCreditCard({ organizationId, creditCardId: creditCard.id })
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <PageOrganizationBilling
        creditCards={creditCards}
        onAddCard={handleAddCard}
        onDeleteCard={onDeleteCreditCard}
        creditCardLoading={isLoadingCreditCards}
        showAddCard={showAddCard}
        onShowAddCardChange={setShowAddCard}
      />
    </FormProvider>
  )
}

export default PageOrganizationBillingFeature

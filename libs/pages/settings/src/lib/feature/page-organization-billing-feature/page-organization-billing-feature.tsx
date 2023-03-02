import { CreditCard } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  deleteCreditCard,
  fetchCreditCards,
  getCreditCardsState,
  selectCreditCardsByOrganizationId,
} from '@qovery/domains/organization'
import { AddCreditCardModalFeature, CreditCardFormValues } from '@qovery/shared/console-shared'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import PageOrganizationBilling from '../../ui/page-organization-billing/page-organization-billing'

export function PageOrganizationBillingFeature() {
  const { organizationId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { openModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const creditCardLoadingStatus = useSelector<RootState, string | undefined>(
    (state) => getCreditCardsState(state).loadingStatus
  )

  const creditCards = useSelector<RootState, CreditCard[]>((state) =>
    selectCreditCardsByOrganizationId(state, organizationId)
  )

  const methods = useForm<CreditCardFormValues>({
    mode: 'onChange',
  })

  useEffect(() => {
    if (organizationId) dispatch(fetchCreditCards({ organizationId }))
  }, [organizationId, dispatch])

  const openNewCreditCardModal = () => {
    openModal({
      content: <AddCreditCardModalFeature organizationId={organizationId} />,
    })
  }

  const onDeleteCreditCard = (creditCard: CreditCard) => {
    openModalConfirmation({
      title: 'Delete credit card',
      description: 'Are you sure you want to delete this credit card?',
      name: creditCard.last_digit,
      isDelete: true,
      action: async () => {
        await dispatch(deleteCreditCard({ organizationId: organizationId || '', creditCardId: creditCard.id }))
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <PageOrganizationBilling
        creditCards={creditCards}
        openNewCreditCardModal={openNewCreditCardModal}
        onDeleteCard={onDeleteCreditCard}
        creditCardLoading={creditCardLoadingStatus !== 'loaded'}
      />
    </FormProvider>
  )
}

export default PageOrganizationBillingFeature

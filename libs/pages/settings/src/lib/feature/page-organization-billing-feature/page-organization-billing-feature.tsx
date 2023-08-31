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
import { AddCreditCardModalFeature, type CreditCardFormValues } from '@qovery/shared/console-shared'
import { type CreditCard } from '@qovery/shared/interfaces'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import PageOrganizationBilling from '../../ui/page-organization-billing/page-organization-billing'

export function PageOrganizationBillingFeature() {
  useDocumentTitle('Billing details - Organization settings')
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
    if (organizationId && creditCardLoadingStatus === 'not loaded') dispatch(fetchCreditCards({ organizationId }))
  }, [organizationId, dispatch, creditCardLoadingStatus])

  const openNewCreditCardModal = () => {
    openModal({
      content: <AddCreditCardModalFeature organizationId={organizationId} />,
    })
  }

  const onDeleteCreditCard = (creditCard: CreditCard) => {
    openModalConfirmation({
      title: 'Delete credit card',
      name: creditCard.last_digit,
      isDelete: true,
      placeholder: 'Enter the last digits',
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

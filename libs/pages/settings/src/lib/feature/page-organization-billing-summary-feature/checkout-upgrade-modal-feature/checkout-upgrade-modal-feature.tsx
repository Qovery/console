import { PlanEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { CardImages } from 'react-payment-inputs/images'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCreditCards,
  fetchMembers,
  getCreditCardsState,
  selectCreditCardsByOrganizationId,
} from '@qovery/domains/organization'
import { CreditCardFormValues } from '@qovery/shared/console-shared'
import { OrganizationEntity, Value } from '@qovery/shared/interfaces'
import { imagesCreditCart } from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/store'
import CheckoutUpgradeModal from '../../../ui/page-organization-billing-summary/checkout-upgrade-modal/checkout-upgrade-modal'

export interface CheckoutUpgradeModalFeatureProps {
  plan: PlanEnum
  organization: OrganizationEntity
}

export function CheckoutUpgradeModalFeature(props: CheckoutUpgradeModalFeatureProps) {
  const dispatch = useDispatch<AppDispatch>()

  const methods = useForm<CreditCardFormValues>({ mode: 'all' })

  const onCardSubmit = methods.handleSubmit((data) => {
    setShowAddCardForm(false)
  })

  const creditCards = useSelector((state: RootState) =>
    selectCreditCardsByOrganizationId(state, props.organization.id || '')
  )
  const creditCardLoadingStatus = useSelector<RootState, string | undefined>(
    (state) => getCreditCardsState(state).loadingStatus
  )
  const [creditCardsOptions, setCreditCardsOptions] = useState<Value[]>([])

  const [showAddCardForm, setShowAddCardForm] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (props.organization.id && creditCardLoadingStatus === 'not loaded')
      dispatch(fetchCreditCards({ organizationId: props.organization.id }))
  }, [props.organization.id, dispatch, creditCardLoadingStatus])

  useEffect(() => {
    if (!props.organization.members?.loadingStatus) {
      dispatch(fetchMembers({ organizationId: props.organization.id }))
    }
  }, [props.organization.members?.loadingStatus, dispatch, props.organization.id])

  useEffect(() => {
    if (creditCards.length > 0) {
      setCreditCardsOptions(
        creditCards.map((card) => ({
          label: '**** ' + card.last_digit,
          value: card.id,
          icon: (
            <svg
              data-testid="credit-card-image"
              className="absolute -translate-x-full -ml-3 -translate-y-1/2 top-1/2 z-10 w-6 h-4"
              {...{ children: imagesCreditCart[card.brand as keyof CardImages] }}
            ></svg>
          ),
        }))
      )
    }
  }, [creditCards])

  return (
    <FormProvider {...methods}>
      <CheckoutUpgradeModal
        toggleShowAddForm={(value: boolean) => {
          setShowAddCardForm(value)
        }}
        showAddCardForm={showAddCardForm}
        plan={props.plan}
        memberCount={props.organization.members?.items?.length || 1}
        onCardSubmit={onCardSubmit}
        setSelectedCard={setSelectedCard}
        selectedCard={selectedCard}
        creditCardsOptions={creditCardsOptions}
      />
    </FormProvider>
  )
}

export default CheckoutUpgradeModalFeature

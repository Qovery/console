import { type default as FieldContainer } from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import { type default as CbInstance } from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type BillingInfoRequest, type CreditCard } from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  useAddCreditCard,
  useBillingInfo,
  useCreditCards,
  useDeleteCreditCard,
  useEditBillingInfo,
} from '@qovery/domains/organizations/feature'
import { countries } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { IconFlag, toastError, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import PageOrganizationBilling from '../../ui/page-organization-billing/page-organization-billing'

export function PageOrganizationBillingFeature() {
  useDocumentTitle('Billing details - Organization settings')
  const { organizationId = '' } = useParams()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: creditCards = [], isLoading: isLoadingCreditCards } = useCreditCards({ organizationId })
  const { mutateAsync: deleteCreditCard } = useDeleteCreditCard()
  const { data: billingInfo, isLoading: isLoadingBillingInfo } = useBillingInfo({ organizationId })
  const { mutateAsync: editBillingInfo } = useEditBillingInfo()
  const { mutateAsync: addCreditCard } = useAddCreditCard()

  const [showAddCard, setShowAddCard] = useState(false)
  const [editInProcess, setEditInProcess] = useState(false)
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const [isCardReady, setIsCardReady] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const cardRef = useRef<FieldContainer>(null)

  const countryValues = countries.map((country) => ({
    label: country.name,
    value: country.code,
    icon: <IconFlag code={country.code} />,
  }))

  const methods = useForm<BillingInfoRequest>({
    mode: 'onChange',
    defaultValues: {
      city: '',
      address: '',
      state: '',
      company: '',
      zip: '',
      email: '',
      first_name: '',
      last_name: '',
      vat_number: '',
      country_code: '',
    },
  })

  useEffect(() => {
    if (!showAddCard) return

    let mounted = true

    const initializeChargebee = async () => {
      try {
        const instance = await loadChargebee()

        if (!mounted) {
          return
        }

        setCbInstance(instance)
      } catch (error) {
        return
      }
    }

    initializeChargebee()

    return () => {
      mounted = false
    }
  }, [showAddCard])

  useEffect(() => {
    methods.reset(billingInfo as BillingInfoRequest)
  }, [billingInfo, methods])

  const handleAddCard = (cardId?: string) => {
    setShowAddCard(true)
    setEditingCardId(cardId || null)
    setTimeout(() => {
      const cardSection = document.querySelector('[data-credit-card-section]')
      if (cardSection) {
        cardSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleCancelAddCard = () => {
    setShowAddCard(false)
    setIsCardReady(false)
    setCbInstance(null)
    setEditingCardId(null)
  }

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!organizationId) return

    setEditInProcess(true)

    try {
      const response = await editBillingInfo({
        organizationId,
        billingInfoRequest: data,
      })
      methods.reset(response as BillingInfoRequest)

      if (showAddCard && isCardReady && cardRef.current) {
        const tokenData = await cardRef.current.tokenize({})

        if (!tokenData.token) {
          throw new Error('No token returned from Chargebee')
        }

        await addCreditCard({
          organizationId,
          creditCardRequest: {
            token: tokenData.token,
            cvv: '',
            number: `****${tokenData.card?.last4 || ''}`,
            expiry_year: tokenData.card?.expiry_year || 0,
            expiry_month: tokenData.card?.expiry_month || 0,
          },
        })

        if (editingCardId) {
          await deleteCreditCard({ organizationId, creditCardId: editingCardId })
        }

        setShowAddCard(false)
        setIsCardReady(false)
        setCbInstance(null)
        setEditingCardId(null)
      }
    } catch (error) {
      toastError(error as unknown as SerializedError)
    } finally {
      setEditInProcess(false)
    }
  })

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
        onCancelAddCard={handleCancelAddCard}
        cbInstance={cbInstance}
        cardRef={cardRef}
        onCardReady={() => setIsCardReady(true)}
        countryValues={countryValues}
        loadingBillingInfos={isLoadingBillingInfo}
        editInProcess={editInProcess}
        onSubmit={onSubmit}
      />
    </FormProvider>
  )
}

export default PageOrganizationBillingFeature

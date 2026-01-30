import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type BillingInfoRequest } from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useAddCreditCard, useBillingInfo, useEditBillingInfo } from '@qovery/domains/organizations/feature'
import { countries } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { IconFlag, toastError } from '@qovery/shared/ui'
import { loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import BillingDetails from '../../../ui/page-organization-billing/billing-details/billing-details'

export interface BillingDetailsFeatureProps {
  showAddCard?: boolean
  onShowAddCardChange?: (show: boolean) => void
  showOnlyCardFields?: boolean
}

export function BillingDetailsFeature(props: BillingDetailsFeatureProps) {
  const { organizationId = '' } = useParams()
  const [editInProcess, setEditInProcess] = useState(false)
  const [countryValues, setCountryValues] = useState<Value[]>([])
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const [isCardReady, setIsCardReady] = useState(false)
  const cardRef = useRef<FieldContainer>(null)
  const showAddCard = props.showAddCard ?? false

  const { data: billingInfo, isLoading: isLoadingBillingInfo } = useBillingInfo({ organizationId })
  const { mutateAsync: editBillingInfo } = useEditBillingInfo()
  const { mutateAsync: addCreditCard } = useAddCreditCard()

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

  // Initialize Chargebee when showAddCard becomes true
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
        console.error('Failed to initialize Chargebee:', error)
      }
    }

    initializeChargebee()

    return () => {
      mounted = false
    }
  }, [showAddCard])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!organizationId) return

    setEditInProcess(true)

    try {
      // If user has added card data, tokenize it first
      if (showAddCard && isCardReady && cardRef.current) {
        const tokenData = await cardRef.current.tokenize({})

        if (!tokenData.token) {
          throw new Error('No token returned from Chargebee')
        }

        // Save the credit card
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

        // Reset card state after successful save
        props.onShowAddCardChange?.(false)
        setIsCardReady(false)
        setCbInstance(null)
      }

      // Save billing info
      const response = await editBillingInfo({
        organizationId,
        billingInfoRequest: data,
      })
      methods.reset(response as BillingInfoRequest)
    } catch (error) {
      console.error(error)
      toastError(error as unknown as SerializedError)
    } finally {
      setEditInProcess(false)
    }
  })

  const handleAddCard = () => {
    props.onShowAddCardChange?.(true)
  }

  const handleCancelAddCard = () => {
    props.onShowAddCardChange?.(false)
    setIsCardReady(false)
    setCbInstance(null)
  }

  useEffect(() => {
    setCountryValues(
      countries.map((country) => ({ label: country.name, value: country.code, icon: <IconFlag code={country.code} /> }))
    )
  }, [setCountryValues])

  useEffect(() => {
    methods.reset(billingInfo as BillingInfoRequest)
  }, [billingInfo, methods])

  return (
    <FormProvider {...methods}>
      <BillingDetails
        onSubmit={onSubmit}
        countryValues={countryValues}
        loadingBillingInfos={isLoadingBillingInfo}
        editInProcess={editInProcess}
        showAddCard={showAddCard}
        cbInstance={cbInstance}
        cardRef={cardRef}
        onCardReady={() => setIsCardReady(true)}
        onAddCard={handleAddCard}
        onCancelAddCard={handleCancelAddCard}
        showOnlyCardFields={props.showOnlyCardFields}
      />
    </FormProvider>
  )
}

export default BillingDetailsFeature

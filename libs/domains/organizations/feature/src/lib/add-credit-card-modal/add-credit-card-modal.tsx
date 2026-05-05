import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ModalCrud, toastError, useModal } from '@qovery/shared/ui'
import { loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import { useAddCreditCard } from '../hooks/use-add-credit-card/use-add-credit-card'

export interface AddCreditCardModalProps {
  organizationId: string
  onSuccess?: () => void
}

export function AddCreditCardModal({ organizationId, onSuccess }: AddCreditCardModalProps) {
  const { closeModal } = useModal()
  const cardRef = useRef<FieldContainer>(null)
  const [loading, setLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const { mutateAsync: addCreditCard } = useAddCreditCard()

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
  })

  useEffect(() => {
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
  }, [])

  const onSubmit = async (card: FieldContainer) => {
    if (!card || !organizationId) {
      return
    }

    setLoading(true)

    try {
      const data = await card.tokenize({})

      if (!data.token) {
        throw new Error('No token returned from Chargebee')
      }

      await addCreditCard({
        organizationId,
        creditCardRequest: {
          token: data.token,
          cvv: '',
          number: `****${data.card?.last4 || ''}`,
          expiry_year: data.card?.expiry_year || 0,
          expiry_month: data.card?.expiry_month || 0,
        },
      })

      onSuccess?.()
      closeModal()
    } catch (error) {
      toastError(error as unknown as SerializedError)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (cardRef.current) {
      onSubmit(cardRef.current)
    }
  }

  const isLoading = loading || !cbInstance || !isReady

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Add credit card"
        description="Card information is securely processed by Chargebee."
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={isLoading}
      >
        {cbInstance && (
          <Provider cbInstance={cbInstance}>
            <CardComponent ref={cardRef} locale="en" currency="USD" onReady={() => setIsReady(true)}>
              <div className="chargebee-field-wrapper">
                <label className="chargebee-field-label">Card Number</label>
                <CardNumber placeholder="1234 1234 1234 1234" />
              </div>
              <div className="chargebee-fields-row">
                <div className="chargebee-field-wrapper">
                  <label className="chargebee-field-label">Expiry</label>
                  <CardExpiry placeholder="MM / YY" />
                </div>
                <div className="chargebee-field-wrapper">
                  <label className="chargebee-field-label">CVV</label>
                  <CardCVV placeholder="CVV" />
                </div>
              </div>
            </CardComponent>
          </Provider>
        )}
      </ModalCrud>
    </FormProvider>
  )
}

export default AddCreditCardModal

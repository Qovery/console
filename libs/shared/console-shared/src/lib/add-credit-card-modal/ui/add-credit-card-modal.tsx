import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { type FormEvent, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ModalCrud } from '@qovery/shared/ui'

export interface AddCreditCardModalProps {
  closeModal: () => void
  onSubmit: (cardRef: FieldContainer) => Promise<void>
  loading?: boolean
  cbInstance: CbInstance | null
}

export function AddCreditCardModal(props: AddCreditCardModalProps) {
  const cardRef = useRef<FieldContainer>(null)
  const [isReady, setIsReady] = useState(false)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (cardRef.current) {
      props.onSubmit(cardRef.current)
    }
  }

  const handleReady = () => {
    setIsReady(true)
  }

  const isLoading = !props.cbInstance || !isReady

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Add credit card"
        description="Card information is securely processed by Chargebee."
        onClose={props.closeModal}
        onSubmit={handleSubmit}
        loading={props.loading || isLoading}
      >
        {props.cbInstance && (
          <Provider cbInstance={props.cbInstance}>
            <CardComponent ref={cardRef} locale="en" currency="USD" onReady={handleReady}>
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

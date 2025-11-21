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

  // ModalCrud requires react-hook-form context, even though we're not using it
  // The actual form validation is handled by Chargebee's component
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
  })

  // Override form state to mark as valid when Chargebee is ready
  const formState = isReady ? { ...methods.formState, isValid: true } : methods.formState

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (cardRef.current) {
      props.onSubmit(cardRef.current)
    }
  }

  const handleReady = () => {
    setIsReady(true)
  }

  // Show loading state until Chargebee instance is loaded and fields are ready
  const isLoading = !props.cbInstance || !isReady

  // Custom styles to match InputText design
  const fieldStyles = {
    base: {
      color: '#383E50',
      fontWeight: '400',
      fontFamily: 'Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      lineHeight: '1.25rem',
      letterSpacing: '0.0025em',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#67778E',
      },
      ':focus': {
        color: '#383E50',
      },
    },
    invalid: {
      color: '#FF6240',
      ':focus': {
        color: '#FF6240',
      },
    },
  }

  return (
    <FormProvider {...methods} formState={formState}>
      <ModalCrud
        title="Add credit card"
        description="Card information is securely processed by Chargebee."
        onClose={props.closeModal}
        onSubmit={handleSubmit}
        loading={props.loading || isLoading}
      >
        <style>
          {`
            /* Individual field wrappers matching InputText design */
            .chargebee-field-wrapper {
              position: relative;
              min-height: 52px;
              cursor: pointer;
              border-radius: 0.25rem;
              border: 1px solid #C6D3E7;
              background-color: white;
              padding: 0.5rem 0.75rem;
              transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1), 0s outline;
              margin-bottom: 1rem;
            }

            /* Hover state */
            .chargebee-field-wrapper:hover {
              border-color: #5B50D6;
              box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
            }

            /* Focus state */
            .chargebee-field-wrapper.chargebee-field-focus {
              border-color: #5B50D6;
              outline: 3px solid #E0DDFC;
              box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05);
            }

            /* Label styling */
            .chargebee-field-label {
              display: block;
              font-size: 0.75rem;
              line-height: 1rem;
              letter-spacing: 0.002em;
              color: #67778E;
              font-family: Roboto, Helvetica, sans-serif;
              font-weight: 400;
              margin-bottom: 0.25rem;
            }

            /* Expiry and CVV row */
            .chargebee-fields-row {
              display: flex;
              gap: 1rem;
            }

            .chargebee-fields-row > div {
              flex: 1;
            }

            /* Hide Chargebee default container styles */
            .chargebee-field-wrapper > div {
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
            }

            /* Iframe styling */
            .chargebee-field-wrapper iframe {
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              width: 100% !important;
              min-height: 20px !important;
            }

          `}
        </style>
        {/* Chargebee fields - only render when instance is ready */}
        {props.cbInstance && (
          <Provider cbInstance={props.cbInstance}>
            <CardComponent ref={cardRef} styles={fieldStyles} locale="en" currency="USD" onReady={handleReady}>
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

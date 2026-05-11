import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { mutations } from '@qovery/domains/organizations/data-access'
import { Button, toastError, useModal } from '@qovery/shared/ui'
import { fieldCardStyles, loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import { queries } from '@qovery/state/util-queries'

export interface AddCreditCardModalFeatureProps {
  organizationId: string
  onSuccess?: () => void
}

function getSerializedChargebeeError(error: unknown): SerializedError | Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const chargebeeError = error as {
      message?: string
      error_msg?: string
      type?: string
      code?: string
    }

    return {
      name: chargebeeError.type || 'Chargebee error',
      message: chargebeeError.message || chargebeeError.error_msg || 'Unable to tokenize credit card fields.',
      code: chargebeeError.code,
    }
  }

  return {
    name: 'Chargebee error',
    message: 'Unable to tokenize credit card fields.',
  }
}

export function AddCreditCardModalFeature({ organizationId, onSuccess }: AddCreditCardModalFeatureProps) {
  const { closeModal } = useModal()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const [isReady, setIsReady] = useState(false)
  const cardRef = useRef<FieldContainer>(null)

  const { mutateAsync: addCreditCard } = useMutation(mutations.addCreditCard, {
    onSuccess(_, { organizationId: targetOrganizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.creditCards({ organizationId: targetOrganizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.details({ organizationId: targetOrganizationId }).queryKey,
      })
    },
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
        setIsReady(false)
      } catch (error) {
        console.error('Failed to initialize Chargebee:', error)
      }
    }

    initializeChargebee()

    return () => {
      mounted = false
    }
  }, [])

  const onSubmit = async () => {
    if (!cardRef.current || !organizationId || !cbInstance || !isReady) {
      return
    }

    setLoading(true)

    try {
      const data = await cardRef.current.tokenize({})

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
      toastError(getSerializedChargebeeError(error))
    } finally {
      setLoading(false)
    }
  }

  const isModalLoading = !cbInstance || !isReady || loading

  return (
    <div className="p-5">
      <h2 className="h4 max-w-sm truncate text-neutral">Add credit card</h2>
      <p className="mt-2 text-sm text-neutral-subtle">Card information is securely processed by Chargebee.</p>
      <div className="mt-6">
        {cbInstance && (
          <Provider cbInstance={cbInstance}>
            <CardComponent
              ref={cardRef}
              styles={fieldCardStyles()}
              locale="en"
              currency="USD"
              onReady={() => setIsReady(true)}
            >
              <div className="chargebee-field-wrapper">
                <label className="chargebee-field-label">Card Number</label>
                <CardNumber className="text-neutral" placeholder="1234 1234 1234 1234" />
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
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button
          data-testid="cancel-button"
          type="button"
          variant="plain"
          color="neutral"
          size="lg"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          data-testid="submit-button"
          type="button"
          color="brand"
          size="lg"
          disabled={isModalLoading}
          loading={loading}
          onClick={() => void onSubmit()}
        >
          Create
        </Button>
      </div>
    </div>
  )
}

export default AddCreditCardModalFeature

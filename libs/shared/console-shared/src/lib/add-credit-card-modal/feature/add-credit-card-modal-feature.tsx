import type FieldContainer from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { useEffect, useState } from 'react'
import { useAddCreditCard } from '@qovery/domains/organizations/feature'
import { toastError, useModal } from '@qovery/shared/ui'
import { loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import AddCreditCardModal from '../ui/add-credit-card-modal'

export interface AddCreditCardModalFeatureProps {
  organizationId: string
}

export function AddCreditCardModalFeature({ organizationId }: AddCreditCardModalFeatureProps) {
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const { mutateAsync: addCreditCard } = useAddCreditCard()

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

  const onSubmit = async (cardRef: FieldContainer) => {
    if (!cardRef || !organizationId) {
      return
    }

    setLoading(true)

    try {
      // Tokenize card data using Chargebee component
      const data = await cardRef.tokenize({})

      if (!data.token) {
        throw new Error('No token returned from Chargebee')
      }

      // Send token to backend
      await addCreditCard({
        organizationId,
        creditCardRequest: {
          // Chargebee token for secure payment processing
          token: data.token,
          // Legacy fields for backward compatibility during migration
          cvv: '',
          number: `****${data.card?.last4 || ''}`,
          expiry_year: data.card?.expiry_year || 0,
          expiry_month: data.card?.expiry_month || 0,
        },
      })
      closeModal()
    } catch (error) {
      toastError(error as unknown as SerializedError)
    } finally {
      setLoading(false)
    }
  }

  return <AddCreditCardModal closeModal={closeModal} onSubmit={onSubmit} loading={loading} cbInstance={cbInstance} />
}

export default AddCreditCardModalFeature

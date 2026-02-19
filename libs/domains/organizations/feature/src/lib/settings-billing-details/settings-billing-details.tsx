import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import { type default as FieldContainer } from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import { type default as CbInstance } from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { useParams } from '@tanstack/react-router'
import { type BillingInfoRequest, type CreditCard } from 'qovery-typescript-axios'
import { Suspense, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { countries } from '@qovery/shared/enums'
import { IconFlag, toastError, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, Icon, InputCreditCard, InputText, Section, Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { fieldCardStyles, loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import { useAddCreditCard } from '../hooks/use-add-credit-card/use-add-credit-card'
import { useBillingInfo } from '../hooks/use-billing-info/use-billing-info'
import { useCreditCards } from '../hooks/use-credit-cards/use-credit-cards'
import { useDeleteCreditCard } from '../hooks/use-delete-credit-card/use-delete-credit-card'
import { useEditBillingInfo } from '../hooks/use-edit-billing-info/use-edit-billing-info'
import BillingDetails from './billing-details/billing-details'

function SettingsBillingDetailsContent({ organizationId }: { organizationId: string }) {
  const { openModalConfirmation } = useModalConfirmation()
  const { data: creditCards = [] } = useCreditCards({ organizationId, suspense: true })
  const { mutateAsync: deleteCreditCard } = useDeleteCreditCard()
  const { data: billingInfo } = useBillingInfo({ organizationId, suspense: true })
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
    values: billingInfo as BillingInfoRequest,
  })

  const handleAddCard = async (cardId?: string) => {
    setShowAddCard(true)
    setEditingCardId(cardId || null)
    console.log(showAddCard)

    try {
      const instance = await loadChargebee()
      setCbInstance(instance)
    } catch (error) {
      return
    }
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
      <div className="w-full">
        <Section className="p-8">
          <SettingsHeading title="Payment method" showNeedHelp={false} />

          <div className="max-w-content-with-navigation-left">
            <BlockContent title="Billing details">
              <div className="mb-6" data-credit-card-section>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral">Credit card</h3>
                </div>

                {creditCards.length > 0 && !showAddCard && (
                  <div className="flex flex-col">
                    {creditCards.map((creditCard) => (
                      <div
                        data-testid="credit-card-row"
                        key={creditCard.id}
                        className="mb-3 flex items-center justify-between gap-3"
                      >
                        <InputCreditCard
                          type="number"
                          name="Card number"
                          label="Card number"
                          brand={creditCard.brand?.toLowerCase()}
                          value={`**** ${creditCard.last_digit}`}
                          disabled
                          className="grow bg-surface-neutral"
                        />
                        <InputText
                          name="Expiration date"
                          label="Expiration date"
                          className="grow bg-surface-neutral"
                          value={`${creditCard.expiry_month} / ${creditCard.expiry_year}`}
                          disabled
                        />
                        <Button
                          data-testid="edit-credit-card"
                          className="h-[52px] w-[52px] rounded-md"
                          iconOnly
                          variant="outline"
                          color="neutral"
                          onClick={() => handleAddCard(creditCard.id)}
                        >
                          <Icon iconName="pen" className="text-sm" />
                        </Button>
                        <Button
                          data-testid="delete-credit-card"
                          className="h-[52px] w-[52px] rounded-md"
                          iconOnly
                          variant="outline"
                          color="neutral"
                          onClick={() => onDeleteCreditCard(creditCard)}
                        >
                          <Icon iconName="trash" className="text-sm" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddCard && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-neutral">Add credit card</h4>
                      <button
                        type="button"
                        onClick={() => handleCancelAddCard()}
                        className="text-sm text-neutral-subtle hover:text-neutral"
                      >
                        Cancel
                      </button>
                    </div>

                    {!cbInstance ? (
                      <div className="space-y-4">
                        <Skeleton className="h-[52px] w-full" />
                        <div className="flex gap-3">
                          <Skeleton className="h-[52px] flex-1" />
                          <Skeleton className="h-[52px] flex-1" />
                        </div>
                      </div>
                    ) : (
                      <Provider cbInstance={cbInstance}>
                        <CardComponent
                          ref={cardRef}
                          styles={fieldCardStyles()}
                          locale="en"
                          currency="USD"
                          onReady={() => setIsCardReady(true)}
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
                  </>
                )}

                {!showAddCard && creditCards.length === 0 && (
                  <div data-testid="placeholder-credit-card" className="px-3 py-6 text-center">
                    <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                    <p className="mt-1 text-xs font-medium text-neutral-subtle" data-testid="empty-credit-card">
                      No credit card found. <br /> Please add one.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => handleAddCard()}
                        size="md"
                        variant="outline"
                        className="gap-2"
                        data-testid="add-new-card-button"
                      >
                        Add new card
                        <Icon iconName="circle-plus" iconStyle="regular" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="my-6 border-t border-neutral" />

              <BillingDetails countryValues={countryValues} editInProcess={editInProcess} onSubmit={onSubmit} />
            </BlockContent>
          </div>
        </Section>
      </div>
    </FormProvider>
  )
}

function SettingsBillingDetailsSkeleton() {
  return (
    <div className="w-full">
      <Section className="p-8">
        <SettingsHeading title="Payment method" showNeedHelp={false} />

        <div className="max-w-content-with-navigation-left">
          <BlockContent title="Billing details">
            <div className="mb-6" data-credit-card-section>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral">Credit card</h3>
              </div>

              <div className="flex flex-col" data-testid="credit-card-skeleton">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Skeleton className="h-[52px] flex-1" />
                  <Skeleton className="h-[52px] flex-1" />
                  <Skeleton className="h-[52px] w-[52px]" />
                  <Skeleton className="h-[52px] w-[52px]" />
                </div>
              </div>
            </div>

            <div className="my-6 border-t border-neutral" />

            <div className="space-y-3" data-testid="billing-details-skeleton">
              <div className="flex items-start gap-3">
                <Skeleton className="h-[52px] flex-1" />
                <Skeleton className="h-[52px] flex-1" />
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="h-[52px] flex-1" />
                <Skeleton className="h-[52px] flex-1" />
              </div>
              <Skeleton className="h-[52px] w-full" />
              <Skeleton className="h-[52px] w-full" />
              <div className="flex items-start gap-3">
                <Skeleton className="h-[52px] flex-1" />
                <Skeleton className="h-[52px] flex-1" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-[52px] flex-1" />
                <Skeleton className="h-[52px] flex-1" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </BlockContent>
        </div>
      </Section>
    </div>
  )
}

export function SettingsBillingDetails() {
  useDocumentTitle('Billing details - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })

  return (
    <Suspense fallback={<SettingsBillingDetailsSkeleton />}>
      <SettingsBillingDetailsContent organizationId={organizationId} />
    </Suspense>
  )
}

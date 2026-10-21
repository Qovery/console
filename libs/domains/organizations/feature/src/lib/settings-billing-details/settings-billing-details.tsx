import { CardCVV, CardComponent, CardExpiry, CardNumber, Provider } from '@chargebee/chargebee-js-react-wrapper'
import { type default as FieldContainer } from '@chargebee/chargebee-js-react-wrapper/dist/components/FieldContainer'
import { type default as CbInstance } from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { useParams } from '@tanstack/react-router'
import { type BillingInfo, type BillingInfoRequest, type CreditCard, type PlanEnum } from 'qovery-typescript-axios'
import { Suspense, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Callout, toast, toastError, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, Icon, InputCreditCard, InputText, Section, Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { formatPlanDisplay, formatPlanName, isActiveFreeTrial, pluralize } from '@qovery/shared/util-js'
import { fieldCardStyles, loadChargebee } from '@qovery/shared/util-payment'
import { type SerializedError } from '@qovery/shared/utils'
import { useAddCreditCard } from '../hooks/use-add-credit-card/use-add-credit-card'
import { useBillingInfo } from '../hooks/use-billing-info/use-billing-info'
import { useChangePlan } from '../hooks/use-change-plan/use-change-plan'
import { useCreditCards } from '../hooks/use-credit-cards/use-credit-cards'
import { useCurrentCost } from '../hooks/use-current-cost/use-current-cost'
import { useDeleteCreditCard } from '../hooks/use-delete-credit-card/use-delete-credit-card'
import { useEditBillingInfo } from '../hooks/use-edit-billing-info/use-edit-billing-info'
import ActivationPlanSelection, {
  getDefaultActivationPlan,
} from './activation-plan-selection/activation-plan-selection'
import BillingDetails from './billing-details/billing-details'

function formatBillingInfo(data: BillingInfoRequest): BillingInfoRequest {
  return {
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    company: data.company?.trim() || undefined,
    email: data.email.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    zip: data.zip.trim(),
    country_code: data.country_code,
    state: data.state?.trim() || undefined,
    vat_number: data.vat_number?.trim() || undefined,
  }
}

function formatBillingInfoFormValues(data?: BillingInfo): BillingInfoRequest {
  return {
    first_name: data?.first_name ?? '',
    last_name: data?.last_name ?? '',
    company: data?.company ?? undefined,
    email: data?.email ?? '',
    address: data?.address ?? '',
    city: data?.city ?? '',
    zip: data?.zip ?? '',
    country_code: data?.country_code ?? '',
    state: data?.state ?? undefined,
    vat_number: data?.vat_number ?? undefined,
  }
}

function getVatNumberError(error: SerializedError) {
  return error.message?.match(/^vat_number\s*:\s*(.+)$/i)?.[1]
}

function SettingsBillingDetailsContent({ organizationId }: { organizationId: string }) {
  const { openModalConfirmation } = useModalConfirmation()
  const { data: creditCards = [] } = useCreditCards({ organizationId, suspense: true })
  const { mutateAsync: deleteCreditCard } = useDeleteCreditCard()
  const { mutateAsync: deleteReplacedCreditCard } = useDeleteCreditCard({ notifyOnError: false })
  const { data: billingInfo } = useBillingInfo({ organizationId, suspense: true })
  const { data: currentCost } = useCurrentCost({ organizationId, suspense: true })
  const { mutateAsync: editBillingInfo } = useEditBillingInfo()
  const { mutateAsync: addCreditCard } = useAddCreditCard({ notifyOnError: false })
  const { mutateAsync: changePlan } = useChangePlan()
  const { showChat, showPylonForm } = useSupportChat()

  const isInActiveFreeTrial = isActiveFreeTrial(currentCost?.remaining_trial_day)
  // Add + 1 because Chargebee return 0 when the trial is ending today
  const remainingTrialDays = (currentCost?.remaining_trial_day ?? 0) + 1
  const remainingTrialDaysLabel = `${remainingTrialDays} ${pluralize(remainingTrialDays, 'day')}`
  const isActivatingPlan = isInActiveFreeTrial && creditCards.length === 0
  const canSwitchPlan = isInActiveFreeTrial && creditCards.length > 0

  const [selectedPlan, setSelectedPlan] = useState<PlanEnum>(() => getDefaultActivationPlan(currentCost?.plan))
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false)
  const [showAddCard, setShowAddCard] = useState(isActivatingPlan)
  const [editInProcess, setEditInProcess] = useState(false)
  const [cbInstance, setCbInstance] = useState<CbInstance | null>(null)
  const [isCardReady, setIsCardReady] = useState(false)
  const [isCardComplete, setIsCardComplete] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const cardRef = useRef<FieldContainer>(null)

  const methods = useForm<BillingInfoRequest>({
    mode: 'all',
    values: formatBillingInfoFormValues(billingInfo),
  })

  useEffect(() => {
    if (!showAddCard || cbInstance) return

    let ignore = false
    loadChargebee()
      .then((instance) => {
        if (!ignore) setCbInstance(instance)
      })
      .catch(() => undefined)

    return () => {
      ignore = true
    }
  }, [showAddCard, cbInstance])

  const handleAddCard = (cardId?: string) => {
    setShowAddCard(true)
    setEditingCardId(cardId || null)
  }

  const handleCancelAddCard = () => {
    setShowAddCard(false)
    setIsCardReady(false)
    setIsCardComplete(false)
    setCbInstance(null)
    setEditingCardId(null)
  }

  const saveBillingDetails = async (data: BillingInfoRequest) => {
    if (!organizationId) return

    const planToActivate = isActivatingPlan && !editingCardId ? selectedPlan : undefined
    let cardAdded = false

    setEditInProcess(true)

    try {
      const response = await editBillingInfo({
        organizationId,
        billingInfoRequest: formatBillingInfo(data),
      })
      methods.reset(formatBillingInfoFormValues(response))

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

        cardAdded = true

        if (editingCardId) {
          await deleteReplacedCreditCard({ organizationId, creditCardId: editingCardId })
        }

        setShowAddCard(false)
        setIsCardReady(false)
        setIsCardComplete(false)
        setCbInstance(null)
        setEditingCardId(null)
      }
    } catch (error) {
      const serializedError = error as unknown as SerializedError
      const vatNumberError = getVatNumberError(serializedError)

      if (vatNumberError) {
        methods.setError('vat_number', { type: 'server', message: vatNumberError })
      }

      toastError(
        serializedError,
        showAddCard ? (editingCardId ? 'Unable to update card' : 'Unable to add card') : undefined,
        vatNumberError
      )
    }

    if (cardAdded && planToActivate && planToActivate !== currentCost?.plan) {
      try {
        await changePlan({ organizationId, plan: planToActivate })
      } catch {
        // Error is already notified by useChangePlan
      }
    }

    setEditInProcess(false)
  }

  const handleSwitchPlan = async () => {
    setIsSwitchingPlan(true)

    try {
      await changePlan({ organizationId, plan: selectedPlan })
    } catch {
      // Error is already notified by useChangePlan
    } finally {
      setIsSwitchingPlan(false)
    }
  }

  const onInvalidBillingDetails = () => {
    toast(
      'error',
      showAddCard ? 'Unable to add card' : 'Unable to save billing details',
      'Review the highlighted billing fields and try again.'
    )
  }

  const addCardLabel = isActivatingPlan ? `Activate ${formatPlanName(selectedPlan)} plan` : 'Add card'

  const submitBillingDetails = methods.handleSubmit(saveBillingDetails, onInvalidBillingDetails)

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
        <Section className="px-8 pb-8 pt-6">
          <SettingsHeading title="Payment method" showNeedHelp={false} />

          <div className="max-w-content-with-navigation-left">
            {isActivatingPlan && (
              <Callout.Root color="sky" className="mb-6 items-start">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>Choose your plan to activate your account</Callout.TextHeading>
                  <Callout.TextDescription>
                    Your free trial runs on the {formatPlanDisplay(currentCost?.plan)}. Choose the plan you want to keep
                    and add your payment details below. Your subscription starts when your trial ends in{' '}
                    {remainingTrialDaysLabel}.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}
            {canSwitchPlan && (
              <Callout.Root color="sky" className="mb-6 items-start" data-testid="current-plan-callout">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>
                    Your account is activated on the {formatPlanDisplay(currentCost?.plan)}
                  </Callout.TextHeading>
                  <Callout.TextDescription>
                    Your subscription starts on this plan when your trial ends in {remainingTrialDaysLabel}. You can
                    switch plan until then.
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}
            {!isInActiveFreeTrial && currentCost?.plan && (
              <Callout.Root color="sky" className="mb-6 items-center" data-testid="current-plan-callout">
                <Callout.Icon>
                  <Icon iconName="circle-info" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextHeading>You are on the {formatPlanDisplay(currentCost?.plan)}</Callout.TextHeading>
                  <Callout.TextDescription>Contact our team to change your plan.</Callout.TextDescription>
                </Callout.Text>
                <Button size="sm" variant="solid" onClick={() => showChat()}>
                  Contact us
                </Button>
              </Callout.Root>
            )}
            <BlockContent title={isActivatingPlan ? 'Activate your account' : 'Billing details'}>
              {isInActiveFreeTrial && (
                <>
                  <ActivationPlanSelection
                    value={selectedPlan}
                    onChange={setSelectedPlan}
                    currentPlan={currentCost?.plan}
                    title={canSwitchPlan ? 'Your plan' : undefined}
                    action={
                      canSwitchPlan && (
                        <Button
                          size="md"
                          loading={isSwitchingPlan}
                          disabled={selectedPlan === currentCost?.plan}
                          onClick={handleSwitchPlan}
                        >
                          Switch to {formatPlanName(selectedPlan)} plan
                        </Button>
                      )
                    }
                    onContactUsClick={() => showPylonForm('ask-for-activation')}
                  />
                  <div className="-mx-4 my-6 border-t border-neutral" />
                </>
              )}
              <div className="mb-6" data-credit-card-section>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral">
                    {isActivatingPlan ? '2. Add your credit card' : 'Credit card'}
                  </h3>
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
                    {!isActivatingPlan && (
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
                    )}

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
                          onChange={(event) =>
                            setIsCardComplete(Boolean((event as unknown as { complete?: boolean }).complete))
                          }
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
                        data-testid="add-new-card-button"
                      >
                        Add new card
                        <Icon iconName="circle-plus" iconStyle="regular" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="-mx-4 my-6 border-t border-neutral" />

              <BillingDetails
                title={isActivatingPlan ? '3. Billing information' : undefined}
                editInProcess={editInProcess}
                submitDisabled={showAddCard && (!isCardReady || !isCardComplete)}
                submitLabel={showAddCard ? (editingCardId ? 'Update card' : addCardLabel) : 'Save'}
                onSubmit={submitBillingDetails}
              />
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
      <Section className="px-8 pb-8 pt-6">
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

            <div className="-mx-4 my-6 border-t border-neutral" />

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

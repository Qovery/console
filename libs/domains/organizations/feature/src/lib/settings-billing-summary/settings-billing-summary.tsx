import { useNavigate, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { type CreditCard, type OrganizationCurrentCost, PlanEnum } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { type CardImages } from 'react-payment-inputs/images'
import { useUserSignUp } from '@qovery/domains/users-sign-up/feature'
import { AddCreditCardModalFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { useUserRole } from '@qovery/shared/iam/feature'
import { useModal } from '@qovery/shared/ui'
import { Button, Callout, ExternalLink, Icon, Link, Section, Skeleton, imagesCreditCart } from '@qovery/shared/ui'
import { dateToFormat } from '@qovery/shared/util-dates'
import { useDocumentTitle, useSupportChat } from '@qovery/shared/util-hooks'
import { costToHuman, formatPlanDisplay, pluralize } from '@qovery/shared/util-js'
import { useCreditCards } from '../hooks/use-credit-cards/use-credit-cards'
import { useCurrentCost } from '../hooks/use-current-cost/use-current-cost'
import InvoicesListFeature from './invoices-list-feature/invoices-list-feature'
import PlanSelectionModalFeature from './plan-selection-modal-feature/plan-selection-modal-feature'
import PromoCodeModalFeature from './promo-code-modal-feature/promo-code-modal-feature'
import ShowUsageModalFeature from './show-usage-modal-feature/show-usage-modal-feature'

export interface PageOrganizationBillingSummaryProps {
  currentCost?: OrganizationCurrentCost
  creditCard?: CreditCard
  hasCreditCard?: boolean
  onPromoCodeClick?: () => void
  onShowUsageClick?: () => void
  onChangePlanClick?: () => void
  onCancelTrialClick?: () => void
  onAddCreditCardClick?: () => void
}

// This function is used to get the billing recurrence word to display based on the renewal date.
// it's not so accurate, but it's a good enough approximation for now
function getBillingRecurrenceStr(renewalAt: string | null | undefined): string {
  if (renewalAt === null || renewalAt === undefined) return 'month'

  const now = new Date()
  const renewalDate = new Date(renewalAt)
  // if the renewal date is in less than 1 month, we display "month"

  if (renewalDate.getTime() - now.getTime() > 30 * 24 * 60 * 60 * 1000) return 'year'

  return 'month'
}

const BillingSummarySkeleton = () => (
  <div className="w-full">
    <Section className="p-8">
      <div className="relative mb-8 border-b border-neutral pb-6">
        <Skeleton height={32} width={132} show />
        <div className="absolute right-0 top-0 flex shrink-0 gap-3">
          <Skeleton height={32} width={120} show />
          <Skeleton height={32} width={110} show />
          <Skeleton height={32} width={110} show />
        </div>
      </div>
      <div className="max-w-content-with-navigation-left">
        <div className="mb-3 flex gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[114px] flex-1 rounded border border-neutral bg-surface-neutral p-5">
              <Skeleton height={12} width={80} show />
              <div className="mt-3">
                <Skeleton height={20} width={120} show />
              </div>
              <div className="mt-3">
                <Skeleton height={12} width={90} show />
              </div>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <div className="mb-4 mt-7 flex items-center justify-between">
            <Skeleton height={24} width={60} show />
            <Skeleton height={36} width={200} show />
          </div>
          <div className="rounded border border-neutral bg-surface-neutral">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 border-b border-neutral px-4 py-3">
                <Skeleton height={12} width={80} show />
                <Skeleton height={12} width={70} show />
                <Skeleton height={12} width={70} show />
                <Skeleton height={12} width={40} show />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  </div>
)

export function PageOrganizationBillingSummary(props: PageOrganizationBillingSummaryProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const { data: userSignUp } = useUserSignUp()

  // Get the billing recurrence word to display based on the renewal date.
  // It's not so accurate, but it's a good enough approximation for now
  const billingRecurrence = getBillingRecurrenceStr(props.currentCost?.renewal_at)
  const remainingTrialDay = props.currentCost?.remaining_trial_day ?? 0
  const showTrialCallout = remainingTrialDay !== undefined && remainingTrialDay > 0
  const showErrorCallout = (props.hasCreditCard ?? Boolean(props.creditCard)) || userSignUp?.dx_auth

  // This function is used to get the trial start date based on the remaining trial days from the API
  const trialStartDate = useMemo(() => {
    const remainingTrialDayFromApi = props.currentCost?.remaining_trial_day
    if (remainingTrialDayFromApi === undefined || remainingTrialDayFromApi === null) return null

    const trialDurationDays = 14
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const daysUntilExpiration = remainingTrialDayFromApi + 1
    const expirationDate = new Date(today)
    expirationDate.setDate(expirationDate.getDate() + daysUntilExpiration)

    const startDate = new Date(expirationDate)
    startDate.setDate(startDate.getDate() - trialDurationDays)
    startDate.setHours(0, 0, 0, 0)

    return startDate
  }, [props.currentCost?.remaining_trial_day])

  return (
    <div className="w-full">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading title="Plan details" showNeedHelp={false} />
          <div className="absolute right-0 top-0 flex shrink-0 gap-3">
            <Button className="gap-1" variant="surface" color="neutral" size="md" onClick={props.onShowUsageClick}>
              Show usage
              <Icon iconName="gauge-high" iconStyle="regular" />
            </Button>
            <Button variant="surface" color="neutral" size="md" onClick={props.onPromoCodeClick}>
              Promo code
            </Button>
            <Button size="md" onClick={props.onChangePlanClick}>
              Change plan
            </Button>
          </div>
        </div>
        <div className="max-w-content-with-navigation-left">
          {showTrialCallout && (
            <Callout.Root color={showErrorCallout ? 'yellow' : 'red'} className="mb-8 items-center">
              <Callout.Text>
                <Callout.TextHeading>
                  {/* Add + 1 because Chargebee return 0 when the trial is ending today */}
                  {showErrorCallout
                    ? `Your free trial plan expires ${remainingTrialDay + 1} ${pluralize(remainingTrialDay + 1, 'day')} from now`
                    : `No credit card registered, your account will be blocked at the end your trial in ${remainingTrialDay + 1} ${pluralize(remainingTrialDay + 1, 'day')}`}
                </Callout.TextHeading>
                {showErrorCallout ? (
                  <>
                    You have contracted a free 14-days trial on{' '}
                    {trialStartDate ? format(trialStartDate, 'MMMM d, yyyy') : '...'}. At the end of this plan your user
                    subscription will start. You cancel your trial by deleting your organization.
                  </>
                ) : (
                  <>Add a payment method to avoid service interruption at the end of your trial.</>
                )}
              </Callout.Text>
              <Button
                size="sm"
                variant="solid"
                color={showErrorCallout ? 'yellow' : 'red'}
                onClick={() => (showErrorCallout ? props.onCancelTrialClick?.() : props.onAddCreditCardClick?.())}
              >
                {showErrorCallout ? 'Cancel free trial' : 'Add credit card'}
              </Button>
            </Callout.Root>
          )}
          <div className="mb-3 flex gap-2">
            <div className="h-[114px]  flex-1  rounded  border border-neutral bg-surface-neutral p-5">
              <div className="mb-1 text-xs font-medium text-neutral-subtle">Current plan</div>
              <div className="mb-1 text-sm font-bold text-neutral">
                <div className="h-5">{formatPlanDisplay(props.currentCost?.plan)}</div>
              </div>
              <ExternalLink href="https://www.qovery.com/pricing" size="xs">
                See details
              </ExternalLink>
            </div>
            <div className="h-[114px]  flex-1  rounded  border border-neutral bg-surface-neutral p-5">
              <div className="mb-1 text-xs font-medium text-neutral-subtle">Current bill</div>
              <div className="mb-2">
                <div className="h-5">
                  <strong className="text-sm font-bold text-neutral">
                    {costToHuman(props.currentCost?.cost?.total || 0, props.currentCost?.cost?.currency_code || 'USD')}
                  </strong>{' '}
                  <span className="text-xs text-neutral-subtle">/ {billingRecurrence}</span>
                </div>
              </div>
              {props.currentCost?.plan !== PlanEnum.FREE && (
                <p className="text-xs font-medium text-neutral-subtle">
                  Next invoice:{' '}
                  <strong className="text-neutral">
                    {props.currentCost?.renewal_at && dateToFormat(props.currentCost?.renewal_at, 'MMM dd, Y')}
                  </strong>
                </p>
              )}
            </div>

            {props.currentCost?.plan !== PlanEnum.FREE && (
              <div className="h-[114px]  flex-1  rounded  border border-neutral bg-surface-neutral p-5">
                <div className="mb-3 text-xs font-medium text-neutral-subtle">Payment method</div>
                <div className="mb-2">
                  <div className="flex gap-3">
                    {props.creditCard ? (
                      <>
                        <svg className="w-6" children={imagesCreditCart[props.creditCard.brand as keyof CardImages]} />
                        <span className="flex-1 text-xs font-bold text-neutral">
                          **** {props.creditCard?.last_digit}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-neutral">No credit card provided</span>
                    )}
                  </div>
                </div>
                <Link to="/organization/$organizationId/settings/billing-details" params={{ organizationId }} size="xs">
                  Edit payment
                </Link>
              </div>
            )}
          </div>
          <InvoicesListFeature />
        </div>
      </Section>
    </div>
  )
}

function SettingsBillingSummaryContent() {
  const { openModal, closeModal } = useModal()

  const { organizationId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: creditCards = [] } = useCreditCards({ organizationId, suspense: true })
  const { data: currentCost } = useCurrentCost({ organizationId, suspense: true })
  const { showChat } = useSupportChat()
  const { isQoveryAdminUser } = useUserRole()

  const openPromoCodeModal = () => {
    openModal({
      content: <PromoCodeModalFeature closeModal={closeModal} organizationId={organizationId} />,
    })
  }

  const openShowUsageModal = () => {
    openModal({
      content: currentCost && <ShowUsageModalFeature organizationId={organizationId} currentCost={currentCost} />,
    })
  }

  const openPlanSelectionModal = () => {
    openModal({
      content: (
        <PlanSelectionModalFeature
          closeModal={closeModal}
          organizationId={organizationId}
          currentPlan={currentCost?.plan}
        />
      ),
    })
  }

  const handleChangePlanClick = () => {
    if (isQoveryAdminUser) {
      openPlanSelectionModal()
    } else {
      showChat()
    }
  }

  const handleCancelTrialClick = () => {
    navigate({ to: '/organization/$organizationId/settings/danger-zone', params: { organizationId } })
  }

  const handleAddCreditCardClick = () => {
    openModal({
      content: <AddCreditCardModalFeature organizationId={organizationId} />,
    })
  }

  return (
    <PageOrganizationBillingSummary
      currentCost={currentCost}
      creditCard={creditCards[0]}
      hasCreditCard={creditCards.length > 0}
      onPromoCodeClick={openPromoCodeModal}
      onShowUsageClick={openShowUsageModal}
      onChangePlanClick={handleChangePlanClick}
      onCancelTrialClick={handleCancelTrialClick}
      onAddCreditCardClick={handleAddCreditCardClick}
    />
  )
}

export function SettingsBillingSummary() {
  useDocumentTitle('Billing summary - Organization settings')

  return (
    <Suspense fallback={<BillingSummarySkeleton />}>
      <SettingsBillingSummaryContent />
    </Suspense>
  )
}

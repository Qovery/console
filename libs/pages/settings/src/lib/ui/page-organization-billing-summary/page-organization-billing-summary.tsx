import { type CreditCard, type OrganizationCurrentCost, PlanEnum } from 'qovery-typescript-axios'
import { type CardImages } from 'react-payment-inputs/images'
import { useParams } from 'react-router-dom'
import { SETTINGS_BILLING_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  Link,
  Section,
  Skeleton,
  imagesCreditCart,
} from '@qovery/shared/ui'
import { dateToFormat } from '@qovery/shared/util-dates'
import { costToHuman, formatPlanDisplay } from '@qovery/shared/util-js'
import InvoicesListFeature from '../../feature/page-organization-billing-summary-feature/invoices-list-feature/invoices-list-feature'

export interface PageOrganizationBillingSummaryProps {
  currentCost?: OrganizationCurrentCost
  creditCard?: CreditCard
  creditCardLoading?: boolean
  onPromoCodeClick?: () => void
  onShowUsageClick?: () => void
  onChangePlanClick?: () => void
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

export function PageOrganizationBillingSummary(props: PageOrganizationBillingSummaryProps) {
  const { organizationId = '' } = useParams()

  // Get the billing recurrence word to display based on the renewal date.
  // It's not so accurate, but it's a good enough approximation for now
  const billingRecurrence = getBillingRecurrenceStr(props.currentCost?.renewal_at)
  const isTrial = true
  const remainingTrialDay = props.currentCost?.remaining_trial_day
  const showTrialCallout = isTrial && remainingTrialDay !== undefined

  return (
    <div className="flex w-full max-w-[832px] flex-col justify-between">
      <Section className="p-8">
        {showTrialCallout && (
          <Callout.Root
            color={remainingTrialDay !== undefined && remainingTrialDay <= 2 ? 'yellow' : 'sky'}
            className="mb-6 items-center"
          >
            <Callout.Text>
              <Callout.TextHeading>Your free trial plan expires 10 days from now</Callout.TextHeading>
              You have contracted a free 14-days trial on November 25, 2025. At the end of this plan your user
              subscription will start unless you cancel your trial
            </Callout.Text>
            <Button
              size="sm"
              variant="solid"
              color={remainingTrialDay !== undefined && remainingTrialDay <= 2 ? 'yellow' : 'neutral'}
              onClick={props.onChangePlanClick}
            >
              Cancel free trial
            </Button>
          </Callout.Root>
        )}
        <div className="mb-8 flex justify-between">
          <Heading className="mb-2">Plan details</Heading>
          <div className="flex gap-3">
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

        <div className="mb-3 flex w-full gap-2">
          <div className="h-[114px]  flex-1  rounded  border border-neutral-200 p-5">
            <div className="mb-1 text-xs font-medium text-neutral-350">Current plan</div>
            <div className="mb-1 text-sm font-bold text-neutral-400">
              <Skeleton height={20} width={100} show={!props.currentCost?.plan}>
                <div className="h-5">{formatPlanDisplay(props.currentCost?.plan)}</div>
              </Skeleton>
            </div>
            <ExternalLink href="https://www.qovery.com/pricing" size="xs">
              See details
            </ExternalLink>
          </div>
          <div className="h-[114px]  flex-1  rounded  border border-neutral-200 p-5">
            <div className="mb-1 text-xs font-medium text-neutral-350">Current bill</div>
            <div className="mb-2">
              <Skeleton height={20} width={100} show={!props.currentCost?.plan}>
                <div className="h-5">
                  <strong className="text-sm font-bold text-neutral-400">
                    {costToHuman(props.currentCost?.cost?.total || 0, props.currentCost?.cost?.currency_code || 'USD')}
                  </strong>{' '}
                  <span className="text-xs text-neutral-350">/ {billingRecurrence}</span>
                </div>
              </Skeleton>
            </div>
            {props.currentCost?.plan !== PlanEnum.FREE && (
              <p className="text-xs font-medium text-neutral-350">
                Next invoice:{' '}
                <strong className="text-neutral-400">
                  {props.currentCost?.renewal_at && dateToFormat(props.currentCost?.renewal_at, 'MMM dd, Y')}
                </strong>
              </p>
            )}
          </div>

          {props.currentCost?.plan !== PlanEnum.FREE && (
            <div className="h-[114px]  flex-1  rounded  border border-neutral-200 p-5">
              <div className="mb-3 text-xs font-medium text-neutral-350">Payment method</div>
              <div className="mb-2">
                <Skeleton height={20} width={100} show={props.creditCardLoading}>
                  <div className="flex gap-3">
                    {props.creditCard ? (
                      <>
                        <svg className="w-6" children={imagesCreditCart[props.creditCard.brand as keyof CardImages]} />
                        <span className="neutral-400 flex-1 text-xs font-bold">
                          **** {props.creditCard?.last_digit}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-neutral-400">No credit card provided</span>
                    )}
                  </div>
                </Skeleton>
              </div>
              <Link to={SETTINGS_URL(organizationId) + SETTINGS_BILLING_URL} size="xs">
                Edit payment
              </Link>
            </div>
          )}
        </div>
        <InvoicesListFeature />
      </Section>
    </div>
  )
}

export default PageOrganizationBillingSummary

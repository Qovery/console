import { type CreditCard, type OrganizationCurrentCost, PlanEnum } from 'qovery-typescript-axios'
import { type CardImages } from 'react-payment-inputs/images'
import { useParams } from 'react-router-dom'
import { CLUSTERS_URL, SETTINGS_BILLING_URL, SETTINGS_URL } from '@qovery/shared/routes'
import {
  ButtonLegacy,
  ButtonLegacyStyle,
  ExternalLink,
  Heading,
  HelpSection,
  Link,
  Section,
  Skeleton,
  imagesCreditCart,
} from '@qovery/shared/ui'
import { dateToFormat } from '@qovery/shared/util-dates'
import { costToHuman, upperCaseFirstLetter } from '@qovery/shared/util-js'
import InvoicesListFeature from '../../feature/page-organization-billing-summary-feature/invoices-list-feature/invoices-list-feature'

export interface PageOrganizationBillingSummaryProps {
  currentCost?: OrganizationCurrentCost
  creditCard?: CreditCard
  numberOfRunningClusters?: number
  numberOfClusters?: number
  creditCardLoading?: boolean
  onPromoCodeClick?: () => void
  openIntercom?: () => void
}

export function PageOrganizationBillingSummary(props: PageOrganizationBillingSummaryProps) {
  const { organizationId = '' } = useParams()

  return (
    <div className="flex flex-col justify-between w-full max-w-[832px]">
      <Section className="p-8">
        <div className="flex justify-between mb-8">
          <Heading className="mb-2">Plan details</Heading>
          <div className="flex gap-3">
            <ButtonLegacy
              style={ButtonLegacyStyle.STROKED}
              dataTestId="promo-code-button"
              onClick={props.onPromoCodeClick}
            >
              Promo code
            </ButtonLegacy>
            <ButtonLegacy dataTestId="upgrade-button" onClick={props.openIntercom}>
              Upgrade plan
            </ButtonLegacy>
          </div>
        </div>

        <div className="flex w-full gap-2 mb-3">
          <div className="flex-1  h-[114px]  border  p-5 border-neutral-200 rounded">
            <div className="text-neutral-350 text-xs mb-1 font-medium">Current plan</div>
            <div className="text-neutral-400 font-bold text-sm mb-1">
              <Skeleton height={20} width={100} show={!props.currentCost?.plan}>
                <div className="h-5">
                  {props.currentCost?.plan ? upperCaseFirstLetter(props.currentCost?.plan) : 'N/A'} plan
                </div>
              </Skeleton>
            </div>
            <ExternalLink
              href="https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members"
              size="xs"
            >
              See details
            </ExternalLink>
          </div>
          <div className="flex-1  h-[114px]  border  p-5 border-neutral-200 rounded">
            <div className="text-neutral-350 text-xs mb-1 font-medium">Current monthly bill</div>
            <div className="mb-2">
              <Skeleton height={20} width={100} show={!props.currentCost?.plan}>
                <div className="h-5">
                  <strong className="text-neutral-400 font-bold text-sm">
                    {costToHuman(props.currentCost?.cost?.total || 0, props.currentCost?.cost?.currency_code || 'USD')}
                  </strong>{' '}
                  <span className="text-neutral-350 text-xs">/ m</span>
                </div>
              </Skeleton>
            </div>
            {props.currentCost?.plan !== PlanEnum.FREE && (
              <p className="text-neutral-350 text-xs font-medium">
                Next invoice{' '}
                <strong className="text-neutral-400">
                  {props.currentCost?.paid_usage?.renewal_at &&
                    dateToFormat(props.currentCost?.paid_usage.renewal_at, 'MMM dd, Y')}
                </strong>
              </p>
            )}
          </div>

          {props.currentCost?.plan !== PlanEnum.FREE && (
            <div className="flex-1  h-[114px]  border  p-5 border-neutral-200 rounded">
              <div className="text-neutral-350 text-xs mb-3 font-medium">Payment method</div>
              <div className="mb-2">
                <Skeleton height={20} width={100} show={props.creditCardLoading}>
                  <div className="flex gap-3">
                    {props.creditCard ? (
                      <>
                        <svg className="w-6" children={imagesCreditCart[props.creditCard.brand as keyof CardImages]} />
                        <span className="neutral-400 font-bold text-xs flex-1">
                          **** {props.creditCard?.last_digit}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-neutral-400 font-bold">No credit card provided</span>
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

        <div className="flex w-full border gap-2 mb-8 border-neutral-200 rounded">
          <div className="flex-1 p-5 h-[114px]">
            <div className="text-neutral-350 text-xs mb-1 font-medium">Seats</div>
            <div className="text-neutral-400 font-bold text-sm mb-1">N/A</div>
          </div>
          <div className="flex-1 p-5 h-[114px]">
            <div className="text-neutral-350 text-xs mb-1 font-medium">Cluster</div>
            <div className="mb-1">
              <Skeleton height={20} width={100} show={!props.numberOfClusters === undefined}>
                <div className="h-5">
                  {props.numberOfClusters !== undefined && props.numberOfClusters > 0 ? (
                    <>
                      <strong className="text-neutral-400 font-bold text-sm">{props.numberOfRunningClusters}</strong>{' '}
                      <span className="text-neutral-350 text-xs">/ {props.numberOfClusters}</span>
                    </>
                  ) : (
                    <strong className="text-neutral-400 font-medium text-sm">No cluster found</strong>
                  )}
                </div>
              </Skeleton>
            </div>
            <Link to={CLUSTERS_URL(organizationId)} size="xs">
              Manage clusters
            </Link>
          </div>
          <div className="flex-1 p-5  h-[114px]">
            <div className="text-neutral-350 text-xs mb-1 font-medium">Deployments</div>
            <Skeleton height={20} width={100} show={!props.currentCost?.plan}>
              <div className="h-5">
                <strong className="text-neutral-400 font-bold text-sm">
                  {props.currentCost?.paid_usage?.consumed_deployments}
                </strong>{' '}
                <span className="text-neutral-350 text-xs">
                  / {props.currentCost?.paid_usage?.max_deployments_per_month}
                </span>
              </div>
            </Skeleton>
          </div>
        </div>
        <InvoicesListFeature />
      </Section>

      <HelpSection
        data-testid="help-section"
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#billing',
            linkLabel: 'Learn more about billing',
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationBillingSummary

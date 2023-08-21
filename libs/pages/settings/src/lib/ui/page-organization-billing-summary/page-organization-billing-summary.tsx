import { PlanEnum } from 'qovery-typescript-axios'
import { CardImages } from 'react-payment-inputs/images'
import { CreditCard, OrganizationEntity } from '@qovery/shared/interfaces'
import { CLUSTERS_URL, SETTINGS_BILLING_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Button, ButtonStyle, HelpSection, Link, Skeleton, imagesCreditCart } from '@qovery/shared/ui'
import { costToHuman, dateToFormat, upperCaseFirstLetter } from '@qovery/shared/utils'
import InvoicesListFeature from '../../feature/page-organization-billing-summary-feature/invoices-list-feature/invoices-list-feature'

export interface PageOrganizationBillingSummaryProps {
  organization?: OrganizationEntity
  creditCard?: CreditCard
  numberOfRunningClusters?: number
  numberOfClusters?: number
  creditCardLoading?: boolean
  onPromoCodeClick?: () => void
  openIntercom?: () => void
}

export function PageOrganizationBillingSummary(props: PageOrganizationBillingSummaryProps) {
  return (
    <div className="flex flex-col justify-between w-full max-w-[832px]">
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Plan details</h1>
          </div>
          <div className="flex gap-3">
            <Button style={ButtonStyle.STROKED} dataTestId="promo-code-button" onClick={props.onPromoCodeClick}>
              Promo code
            </Button>
            <Button dataTestId="upgrade-button" onClick={props.openIntercom}>
              Upgrade plan
            </Button>
          </div>
        </div>

        <div className="flex w-full gap-2 mb-3">
          <div className="flex-1  h-[114px]  border  p-5 border-element-light-lighter-400 rounded">
            <div className="text-zinc-350 text-xs mb-1 font-medium">Current plan</div>
            <div className="text-text-600 font-bold text-sm mb-1">
              <Skeleton height={20} width={100} show={!props.organization?.currentCost?.value?.plan}>
                <div className="h-5">
                  {upperCaseFirstLetter(props.organization?.currentCost?.value?.plan?.toString()) || 'N/A'} plan
                </div>
              </Skeleton>
            </div>
            <Link
              className="!text-xs font-medium"
              link="https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members"
              linkLabel="See details"
            />
          </div>
          <div className="flex-1  h-[114px]  border  p-5 border-element-light-lighter-400 rounded">
            <div className="text-zinc-350 text-xs mb-1 font-medium">Current monthly bill</div>
            <div className="mb-2">
              <Skeleton height={20} width={100} show={!props.organization?.currentCost?.value?.plan}>
                <div className="h-5">
                  <strong className="text-text-600 font-bold text-sm">
                    {costToHuman(
                      props.organization?.currentCost?.value?.cost?.total || 0,
                      props.organization?.currentCost?.value?.cost?.currency_code || 'USD'
                    )}
                  </strong>{' '}
                  <span className="text-zinc-350 text-xs">/ m</span>
                </div>
              </Skeleton>
            </div>
            {props.organization?.currentCost?.value?.plan !== PlanEnum.FREE && (
              <p className="text-zinc-350 text-xs font-medium">
                Next invoice{' '}
                <strong className="text-text-600">
                  {props.organization?.currentCost?.value?.paid_usage?.renewal_at &&
                    dateToFormat(props.organization.currentCost.value.paid_usage.renewal_at, 'MMM dd, Y')}
                </strong>
              </p>
            )}
          </div>

          {props.organization?.currentCost?.value && props.organization.currentCost.value.plan !== PlanEnum.FREE && (
            <div className="flex-1  h-[114px]  border  p-5 border-element-light-lighter-400 rounded">
              <div className="text-zinc-350 text-xs mb-3 font-medium">Payment method</div>
              <div className="mb-2">
                <Skeleton height={20} width={100} show={props.creditCardLoading}>
                  <div className="flex gap-3">
                    {props.creditCard ? (
                      <>
                        <svg className="w-6" children={imagesCreditCart[props.creditCard.brand as keyof CardImages]} />
                        <span className="text-600 font-bold text-xs flex-1">**** {props.creditCard?.last_digit}</span>
                      </>
                    ) : (
                      <span className="text-xs text-text-600 font-bold">No credit card provided</span>
                    )}
                  </div>
                </Skeleton>
              </div>
              <Link
                className="!text-xs font-medium"
                link={SETTINGS_URL(props.organization?.id || '') + SETTINGS_BILLING_URL}
                linkLabel="Edit payment"
              />
            </div>
          )}
        </div>

        <div className="flex w-full border gap-2 mb-8 border-element-light-lighter-400 rounded">
          <div className="flex-1 p-5 h-[114px]">
            <div className="text-zinc-350 text-xs mb-1 font-medium">Seats</div>
            <div className="text-text-600 font-bold text-sm mb-1">N/A</div>
          </div>
          <div className="flex-1 p-5 h-[114px]">
            <div className="text-zinc-350 text-xs mb-1 font-medium">Cluster</div>
            <div className="mb-1">
              <Skeleton height={20} width={100} show={!props.numberOfClusters === undefined}>
                <div className="h-5">
                  {props.numberOfClusters !== undefined && props.numberOfClusters > 0 ? (
                    <>
                      <strong className="text-text-600 font-bold text-sm">{props.numberOfRunningClusters}</strong>{' '}
                      <span className="text-zinc-350 text-xs">/ {props.numberOfClusters}</span>
                    </>
                  ) : (
                    <strong className="text-text-600 font-medium text-sm">No cluster found</strong>
                  )}
                </div>
              </Skeleton>
            </div>
            <Link
              className="!text-xs font-medium"
              link={CLUSTERS_URL(props.organization?.id || '')}
              linkLabel="Manage clusters"
            />
          </div>
          <div className="flex-1 p-5  h-[114px]">
            <div className="text-zinc-350 text-xs mb-1 font-medium">Deployments</div>
            <Skeleton height={20} width={100} show={!props.organization?.currentCost?.value?.plan}>
              <div className="h-5">
                <strong className="text-text-600 font-bold text-sm">
                  {props.organization?.currentCost?.value?.paid_usage?.consumed_deployments}
                </strong>{' '}
                <span className="text-zinc-350 text-xs">
                  / {props.organization?.currentCost?.value?.paid_usage?.max_deployments_per_month}
                </span>
              </div>
            </Skeleton>
          </div>
        </div>
        <InvoicesListFeature />
      </div>

      <HelpSection
        data-testid="help-section"
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#billing',
            linkLabel: 'Learn more about billing',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationBillingSummary

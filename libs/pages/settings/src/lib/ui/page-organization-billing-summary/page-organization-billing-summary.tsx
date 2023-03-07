import { OrganizationEntity } from '@qovery/shared/interfaces'
import { Button, ButtonStyle, HelpSection, Link, Skeleton } from '@qovery/shared/ui'
import { costToHuman } from '@qovery/shared/utils'

export interface PageOrganizationBillingSummaryProps {
  organization?: OrganizationEntity
  numberOfRunningClusters?: number
  numberOfClusters?: number
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
            <Button style={ButtonStyle.STROKED} dataTestId="add-new-card-button">
              Promo code
            </Button>
            <Button dataTestId="add-new-card-button">Upgrade plan</Button>
          </div>
        </div>

        <div className="flex w-full gap-2 mb-3">
          <div className="flex-1  h-[114px]  border  p-5 border-element-light-lighter-400 rounded">
            <div className="text-text-400 text-xs mb-1 font-medium">Current plan</div>
            <div className="text-text-600 font-bold text-sm mb-1">
              <Skeleton height={20} width={100} show={!props.organization?.currentCost?.value?.plan}>
                <>{props.organization?.currentCost?.value?.plan?.toString()?.toLowerCase() || 'N/A'} plan</>
              </Skeleton>
            </div>
            <Link
              className="!text-xs font-medium"
              link="https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members"
              linkLabel="See details"
            />
          </div>
          <div className="flex-1  h-[114px]  border  p-5 border-element-light-lighter-400 rounded">
            <div className="text-text-400 text-xs mb-1 font-medium">Current monthly bill</div>
            <div className="mb-1">
              <Skeleton height={20} width={100} show={!props.organization?.currentCost?.value?.plan}>
                <div>
                  <strong className="text-text-600 font-bold text-sm">
                    {costToHuman(
                      props.organization?.currentCost?.value?.cost?.total || 0,
                      props.organization?.currentCost?.value?.cost?.currency_code || 'USD'
                    )}
                  </strong>{' '}
                  <span className="text-text-400 text-xs">/ m</span>
                </div>
              </Skeleton>
            </div>
            <Link
              className="!text-xs font-medium"
              link="https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members"
              linkLabel="See details"
            />
          </div>
        </div>

        <div className="flex w-full border gap-2 mb-3 border-element-light-lighter-400 rounded">
          <div className="flex-1 p-5 h-[114px]">
            <div className="text-text-400 text-xs mb-1 font-medium">Seats</div>
            <div className="text-text-600 font-bold text-sm mb-1">N/A</div>
            <Link
              className="!text-xs font-medium"
              link="https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members"
              linkLabel="Manage members"
            />
          </div>
          <div className="flex-1 p-5 h-[114px]">
            <div className="text-text-400 text-xs mb-1 font-medium">Cluster</div>
            <div className="mb-1">
              <Skeleton height={20} width={100} show={props.numberOfRunningClusters === undefined}>
                <div>
                  <strong className="text-text-600 font-bold text-sm">{props.numberOfRunningClusters}</strong>{' '}
                  <span className="text-text-400 text-xs">/ {props.numberOfClusters}</span>
                </div>
              </Skeleton>
            </div>
            <Link
              className="!text-xs font-medium"
              link="https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members"
              linkLabel="Manage clusters"
            />
          </div>
          <div className="flex-1 p-5  h-[114px]">
            <div className="text-text-400 text-xs mb-1 font-medium">Deployments</div>
            <div className="mb-1">
              <strong className="text-text-600 font-bold text-sm">80</strong>{' '}
              <span className="text-text-400 text-xs">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <HelpSection
        data-testid="help-section"
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#organization-members',
            linkLabel: 'How to configure my organization members',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationBillingSummary

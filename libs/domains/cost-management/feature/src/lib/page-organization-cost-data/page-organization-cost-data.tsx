import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Callout, Icon, Link } from '@qovery/shared/ui'
import { Section } from '@qovery/shared/ui'

/**
 * Where the cost figures come from.
 *
 * Settings holds the plumbing — which billing account Qovery reads, how fresh
 * the data is. The budgets themselves live in the Cost control tab, where the
 * platform team actually works.
 */
export interface PageOrganizationCostDataProps {
  organizationId: string
}

export function PageOrganizationCostData({ organizationId }: PageOrganizationCostDataProps) {
  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Cost data"
        description="Qovery estimates spend from the resources it manages. Connecting your cloud billing account reconciles those estimates against what you are actually invoiced."
        showNeedHelp={false}
      />

      <div className="max-w-content-with-navigation-left">
        <BlockContent title="Cloud billing account" classNameContent="p-0">
          <div className="flex items-center justify-between border-b border-neutral px-4 py-3">
            <div className="flex items-center gap-3">
              <Icon name="AWS" width="20" />
              <div>
                <p className="text-sm text-neutral">AWS Cost and Usage Report</p>
                <p className="text-xs text-neutral-subtle">
                  Split Cost Allocation Data, attributed per namespace. Last synced 18 hours ago.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-positive">
                <Icon iconName="circle-check" iconStyle="regular" />
                Connected
              </span>
              <Button type="button" variant="outline" color="neutral" size="sm">
                Configure
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Icon name="GCP" width="20" />
              <div>
                <p className="text-sm text-neutral">Google Cloud Billing export</p>
                <p className="text-xs text-neutral-subtle">Not connected.</p>
              </div>
            </div>
            <Button type="button" variant="outline" color="neutral" size="sm">
              Connect
            </Button>
          </div>
        </BlockContent>

        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Budgets are enforced without this connection</Callout.TextHeading>
            <Callout.TextDescription>
              Billing data lags by up to 24 hours, so it cannot gate a deployment. Qovery enforces budgets on its own
              near real-time estimate and uses the billing export to reconcile the figures after the fact. Set budgets
              in{' '}
              <Link
                to="/organization/$organizationId/cost-control"
                params={{ organizationId }}
                color="sky"
                size="ssm"
                className="font-normal"
              >
                Cost control
              </Link>
              .
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      </div>
    </Section>
  )
}

export default PageOrganizationCostData

import { Callout, ExternalLink, Icon } from '@qovery/shared/ui'

export function SpotInstancesProductionWarning() {
  return (
    <Callout.Root color="yellow">
      <Callout.Icon>
        <Icon iconName="info-circle" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextDescription>
          Activating spot instances on a production cluster may lead to potential downtime for applications deployed on
          this node pool. However, you can specify in the advanced settings to force the use of on-demand instances for
          your service or database to avoid this risk.{' '}
          <ExternalLink
            size="sm"
            href="https://www.qovery.com/docs/configuration/integrations/kubernetes/eks/managed#define-if-your-service-can-run-on-an-on-demand-instance"
          >
            See documentation
          </ExternalLink>
        </Callout.TextDescription>
      </Callout.Text>
    </Callout.Root>
  )
}

import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useClusterStatus, useDeployCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceAlerting } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageMonitoringAlertsFeature() {
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()

  useDocumentTitle('Alerts - Qovery')

  const { data: environment } = useEnvironment({ environmentId })
  const { data: deploymentStatus } = useClusterStatus({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    refetchInterval: 5000,
  })
  const { data: service } = useService({ serviceId: applicationId })

  const { mutate: redeployCluster } = useDeployCluster()

  if (!service || !environment || !deploymentStatus) return null

  const isClusterDeploying = match(deploymentStatus?.status)
    .with('BUILDING', 'DEPLOYING', () => true)
    .otherwise(() => false)

  return (
    <div className="flex h-full">
      <ServiceAlerting>
        {!isClusterDeploying ? (
          <Callout.Root color="yellow" className="relative">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Alert rule is not deployed</Callout.TextHeading>
              <Callout.TextDescription>To apply this change redeploy your cluster</Callout.TextDescription>
            </Callout.Text>
            <Button
              variant="outline"
              color="neutral"
              size="sm"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => redeployCluster({ organizationId, clusterId: environment.cluster_id })}
            >
              Redeploy cluster
            </Button>
          </Callout.Root>
        ) : (
          <Callout.Root color="sky" className="relative">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Cluster is deploying…</Callout.TextHeading>
              <Callout.TextDescription>
                Last alert rule created or updated should be applied automatically when the cluster is deployed.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
      </ServiceAlerting>
    </div>
  )
}

export default PageMonitoringAlertsFeature

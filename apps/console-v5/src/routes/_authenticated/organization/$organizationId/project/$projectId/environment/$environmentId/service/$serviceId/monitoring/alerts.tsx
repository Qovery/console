import { Outlet, createFileRoute, useMatchRoute, useParams } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { useClusterStatus, useDeployCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceAlerting } from '@qovery/domains/observability/feature'
import { useService } from '@qovery/domains/services/feature'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Alerts - Qovery')
  const { organizationId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const matchRoute = useMatchRoute()
  const isCreateRoute = Boolean(
    matchRoute({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/create/metric/$metric',
    })
  )
  const isEditRoute = Boolean(
    matchRoute({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/$alertId/edit',
    })
  )
  const isAlertSubRoute = isCreateRoute || isEditRoute

  const { data: environment } = useEnvironment({ environmentId, suspense: !isAlertSubRoute })
  const { data: service } = useService({ environmentId, serviceId, suspense: !isAlertSubRoute })
  const { data: deploymentStatus } = useClusterStatus({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
    enabled: !isAlertSubRoute && Boolean(environment?.cluster_id),
    refetchInterval: 5000,
  })
  const { mutate: redeployCluster } = useDeployCluster()

  if (isAlertSubRoute) {
    return <Outlet />
  }

  if (!environment || !service || !deploymentStatus) return null

  const isClusterDeploying = match(deploymentStatus.status)
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
              <Callout.TextHeading>Cluster is deploying...</Callout.TextHeading>
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

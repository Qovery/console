import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { Link as RouterLink } from '@tanstack/react-router'
import {
  ClusterAvatar,
  ClusterRunningStatusIndicator,
  useCluster,
  useClusterRunningStatusSocket,
} from '@qovery/domains/clusters/feature'
import {
  EnvironmentLastDeploymentSection,
  EnvironmentMode,
  EnvironmentStateChip,
  MenuManageDeployment,
  MenuOtherActions,
  useDeploymentStatus,
  useEnvironment,
} from '@qovery/domains/environments/feature'
import { Heading, Icon, Link, Navbar, Section, Tooltip } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { environmentId, projectId, organizationId } = Route.useParams()
  const matchRoute = useMatchRoute()

  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id, suspense: true })

  useClusterRunningStatusSocket({
    organizationId,
    clusterId: environment?.cluster_id ?? '',
  })

  const tabs = [
    {
      id: 'services',
      label: 'List',
      iconName: 'list-ul' as IconName,
      routeId: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview/',
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      iconName: 'timeline' as IconName,
      routeId: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview/pipeline',
    },
  ]
  const activeTabId = tabs.find((tab) => matchRoute({ to: tab.routeId }))?.id

  if (!environment || !deploymentStatus) {
    return null
  }

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <EnvironmentMode mode={environment.mode} variant="shrink" className="mr-1" />
              <Tooltip content={environment.name}>
                <Heading className="min-w-0 max-w-full truncate">{environment.name}</Heading>
              </Tooltip>
              <EnvironmentStateChip className="ml-0.5 shrink-0" mode="running" environmentId={environment.id} />
              <span className="ml-2 mr-0.5 h-4 w-px shrink-0 bg-surface-neutral-component" />
              <div className="flex shrink-0 items-center gap-1 text-ssm">
                <ClusterAvatar cluster={cluster} size="sm" />
                <RouterLink
                  to="/organization/$organizationId/cluster/$clusterId/overview"
                  params={{ organizationId, clusterId: environment.cluster_id }}
                  className="hover:underline"
                  color="neutral"
                >
                  {environment.cluster_name}
                </RouterLink>
                {cluster && <ClusterRunningStatusIndicator cluster={cluster} type="dot" />}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <MenuOtherActions
                environment={environment}
                state={deploymentStatus.last_deployment_state}
                variant="header"
              />
              <MenuManageDeployment environment={environment} deploymentStatus={deploymentStatus} variant="header" />
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex flex-col gap-8">
          <EnvironmentLastDeploymentSection />
          <Section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <Heading level={2}>Services</Heading>
              <Link
                as="button"
                variant="outline"
                className="gap-2"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{ organizationId, projectId, environmentId }}
              >
                <Icon iconName="circle-plus" iconStyle="regular" />
                New service
              </Link>
            </div>
            <div>
              <div className="overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
                <div className="no-scrollbar overflow-x-auto pb-2">
                  <Navbar.Root activeId={activeTabId} className="ml-3">
                    {tabs.map((tab) => (
                      <Navbar.Item key={tab.id} id={tab.id} to={tab.routeId}>
                        <Icon iconName={tab.iconName} iconStyle="regular" />
                        {tab.label}
                      </Navbar.Item>
                    ))}
                  </Navbar.Root>
                </div>
              </div>
              <div className="relative -top-2 rounded-lg bg-background">
                <div className="no-scrollbar overflow-x-scroll rounded-lg border border-neutral xl:overflow-hidden">
                  <Outlet />
                </div>
              </div>
            </div>
          </Section>
        </div>
      </Section>
    </div>
  )
}

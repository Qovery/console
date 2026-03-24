import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Outlet, createFileRoute, useMatchRoute, useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import {
  EnvironmentLastDeploymentSection,
  EnvironmentMode,
  MenuArgoCdOnlyActions,
  MenuManageDeployment,
  MenuOtherActions,
  getFakeArgoCdMode,
  isFakeArgoCdService,
  useDeploymentStatus,
  useEnvironment,
} from '@qovery/domains/environments/feature'
import { ServiceList, useServices } from '@qovery/domains/services/feature'
import { Button, EmptyState, Heading, Icon, Link, Navbar, Section, Tooltip } from '@qovery/shared/ui'

const ARGOCD_HYBRID_REDEPLOY_TOOLTIP = 'Redeploy will only target Qovery created services and not ArgoCD imported ones.'
const ARGOCD_STATUS_SYNCED_THRESHOLD = 0.8
const ARGOCD_OPERATION_LABEL = 'No operation detected'

type ArgoCdServiceStatus = 'Synced' | 'Out of sync'
type ServiceListRows = ReturnType<typeof useServices>['data']

function seededRandom(seed: string): number {
  let hash = 2166136261

  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) / 4294967295
}

function getArgoCdStatusByServiceId(services: ServiceListRows, seed: string): Record<string, ArgoCdServiceStatus> {
  return Object.fromEntries(
    services.map((service) => {
      const status =
        seededRandom(`${seed}:${service.id}:status`) < ARGOCD_STATUS_SYNCED_THRESHOLD ? 'Synced' : 'Out of sync'
      return [service.id, status]
    })
  ) as Record<string, ArgoCdServiceStatus>
}

function getArgoCdOperationByServiceId(services: ServiceListRows): Record<string, string> {
  return Object.fromEntries(services.map((service) => [service.id, ARGOCD_OPERATION_LABEL])) as Record<string, string>
}

function ArgoCdTag() {
  return (
    <span className="inline-flex h-5 items-center justify-center rounded border-argocd bg-surface-argocd-subtle px-1 py-0.5 font-code text-xs font-bold uppercase leading-none text-argocd retina:border-[0.5px]">
      ARGOCD
    </span>
  )
}

function ArgoCdImportedServicesTable({
  title,
  environment,
  services,
  argocdStatusByServiceId,
  argocdOperationByServiceId,
}: {
  title: string
  environment: Environment
  services: ServiceListRows
  argocdStatusByServiceId: Record<string, ArgoCdServiceStatus>
  argocdOperationByServiceId: Record<string, string>
}) {
  return (
    <Section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Heading level={3} className="text-neutral-subtle">
          {title}
        </Heading>
        <p className="text-sm text-neutral-subtle">
          Services managed by ArgoCD, they cannot be deployed or modified through Qovery.
        </p>
      </div>
      <div className="no-scrollbar overflow-x-scroll rounded-lg border border-neutral bg-background xl:overflow-hidden">
        <ServiceList
          environment={environment}
          enableSelection={false}
          servicesOverride={services}
          argocdStatusByServiceId={argocdStatusByServiceId}
          argocdOperationByServiceId={argocdOperationByServiceId}
        />
      </div>
    </Section>
  )
}

function QoveryNativeServicesEmptyState({
  organizationId,
  projectId,
  environmentId,
}: {
  organizationId: string
  projectId: string
  environmentId: string
}) {
  const navigate = useNavigate()

  return (
    <Section className="flex flex-col gap-3">
      <Heading level={3} className="text-neutral-subtle">
        Qovery native services
      </Heading>
      <EmptyState
        icon="cube"
        title="No native services created yet"
        description="Create a native service to work alongside your ArgoCD services"
      >
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="solid"
            color="neutral"
            className="gap-2"
            onClick={() =>
              navigate({
                to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
                params: { organizationId, projectId, environmentId },
              })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            New service
          </Button>
          <Button
            size="md"
            variant="outline"
            color="neutral"
            className="gap-2"
            onClick={() =>
              navigate({
                to: '/organization/$organizationId/cluster/new',
                params: { organizationId },
              })
            }
          >
            <Icon iconName="plus" />
            New cluster
          </Button>
        </div>
      </EmptyState>
    </Section>
  )
}

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
  const { data: services = [] } = useServices({ environmentId, suspense: true })

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

  const argoCdMode = getFakeArgoCdMode(environment.id ?? environmentId)
  const shouldDisplayArgoCdTag = argoCdMode !== 'none'
  const isArgoCdOnly = argoCdMode === 'argocd-only'
  const isArgoCdHybrid = argoCdMode === 'hybrid'
  const splitSeed = environment.id ?? environmentId
  const argoCdServices = services.filter((service) =>
    isFakeArgoCdService({ environmentId: splitSeed, serviceId: service.id })
  )
  const qoveryServices = services.filter((service) => !argoCdServices.some((argoCdService) => argoCdService.id === service.id))
  const argocdStatusByServiceId = getArgoCdStatusByServiceId(argoCdServices, splitSeed)
  const argocdOperationByServiceId = getArgoCdOperationByServiceId(argoCdServices)

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <EnvironmentMode mode={environment.mode} variant="shrink" />
              <Heading>{environment?.name}</Heading>
              {shouldDisplayArgoCdTag && <ArgoCdTag />}
            </div>

            <div className="flex gap-2">
              {isArgoCdOnly ? (
                <>
                  <Tooltip content="No deploy actions available for ArgoCD imported services">
                    <span>
                      <Button color="neutral" size="md" variant="outline" disabled className="gap-1.5">
                        <Icon iconName="rocket" />
                        Deploy
                        <Icon iconName="chevron-down" />
                      </Button>
                    </span>
                  </Tooltip>
                  <MenuArgoCdOnlyActions environment={environment} variant="header" />
                </>
              ) : (
                <>
                  <MenuOtherActions
                    environment={environment}
                    state={deploymentStatus.last_deployment_state}
                    isArgoCdHybrid={isArgoCdHybrid}
                    variant="header"
                  />
                  <MenuManageDeployment
                    environment={environment}
                    deploymentStatus={deploymentStatus}
                    redeployTooltip={isArgoCdHybrid ? ARGOCD_HYBRID_REDEPLOY_TOOLTIP : undefined}
                    requireArgoCdHybridAck={isArgoCdHybrid}
                    variant="header"
                  />
                </>
              )}
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
            <div className="flex flex-col gap-6">
              {!isArgoCdOnly && (
                <div className="flex flex-col gap-3">
                  {shouldDisplayArgoCdTag && (
                    <Heading level={3} className="text-neutral-subtle">
                      Qovery services
                    </Heading>
                  )}
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
                        {activeTabId === 'services' && shouldDisplayArgoCdTag ? (
                          <ServiceList environment={environment} servicesOverride={qoveryServices} />
                        ) : (
                          <Outlet />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {(isArgoCdOnly || isArgoCdHybrid) && (
                <ArgoCdImportedServicesTable
                  title={isArgoCdOnly ? 'ArgoCD imported services' : 'ArgoCD services'}
                  environment={environment}
                  services={argoCdServices}
                  argocdStatusByServiceId={argocdStatusByServiceId}
                  argocdOperationByServiceId={argocdOperationByServiceId}
                />
              )}
              {isArgoCdOnly && (
                <div>
                  <QoveryNativeServicesEmptyState
                    organizationId={organizationId}
                    projectId={projectId}
                    environmentId={environmentId}
                  />
                </div>
              )}
            </div>
          </Section>
        </div>
      </Section>
    </div>
  )
}

import { type IconName } from '@fortawesome/fontawesome-common-types'
import { createFileRoute, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useCallback, useMemo } from 'react'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  EnableObservabilityButtonContactUs,
  EnableObservabilityContent,
  EnableObservabilityVideo,
  ServiceDashboard,
} from '@qovery/domains/observability/feature'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { monitoringDashboardSearchParamsSchema } from '@qovery/shared/router'
import { Badge, Button, Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/dashboard'
)({
  component: RouteComponent,
  validateSearch: monitoringDashboardSearchParamsSchema,
})

function RouteComponent() {
  useDocumentTitle('Monitoring - Qovery')
  const { organizationId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: serviceStatus } = useDeploymentStatus({ environmentId, serviceId })
  const { data: service, isFetched: isServiceFetched } = useService({ environmentId, serviceId })
  const { data: cluster, isFetched: isClusterFetched } = useCluster({
    organizationId: environment?.organization.id ?? '',
    clusterId: environment?.cluster_id ?? '',
  })

  const hasMetrics = useMemo(
    () =>
      ((cluster?.cloud_provider === 'AWS' ||
        cluster?.cloud_provider === 'SCW' ||
        cluster?.cloud_provider === 'GCP' ||
        cluster?.cloud_provider === 'AZURE') &&
        cluster?.metrics_parameters?.enabled &&
        match(service?.serviceType)
          .with('APPLICATION', 'CONTAINER', () => true)
          .otherwise(() => false)) ||
      false,
    [cluster?.metrics_parameters?.enabled, service?.serviceType, cluster?.cloud_provider]
  )

  const noMetricsAvailable = useMemo(
    () => serviceStatus?.state === 'STOPPED' || serviceStatus?.state === 'READY',
    [serviceStatus?.state]
  )

  const setDashboardQueryParams = useCallback(
    (updates: Partial<typeof search>) => {
      navigate({
        replace: true,
        search: (previousSearch) => ({
          ...previousSearch,
          ...updates,
        }),
      })
    },
    [navigate]
  )

  if (!isClusterFetched || !isServiceFetched) return null

  posthog.capture('service-monitoring', {
    metrics_enabled: hasMetrics,
    service: {
      organization_id: environment?.organization.id ?? '',
      project_id: environment?.project.id ?? '',
      environment_id: environmentId,
      service_id: serviceId,
      service_name: service?.name ?? '',
    },
  })

  if (!hasMetrics)
    return (
      <div className="relative">
        <Section className="relative h-full w-full gap-4 border-t border-neutral p-8 pt-10">
          <Heading weight="medium">Service health check</Heading>
          <PlaceholderMonitoring />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        </Section>
        <div className="absolute left-1/2 top-1/2 mt-9 flex h-max min-w-[860px] -translate-x-1/2 -translate-y-1/2 items-center gap-10 rounded border border-neutral bg-surface-neutral p-6 shadow-lg xl:top-[74%] xl:min-w-[1200px]">
          <div className="flex w-1/2 flex-col gap-8">
            <EnableObservabilityContent className="text-sm leading-normal" />
            <div className="flex items-center gap-4">
              <EnableObservabilityButtonContactUs />
              <span className="text-sm font-semibold text-neutral-subtle">Starting from $299/month</span>
            </div>
          </div>
          <div className="relative left-4 flex h-full w-1/2 items-center 2xl:left-0">
            <EnableObservabilityVideo />
          </div>
        </div>
      </div>
    )

  return noMetricsAvailable ? (
    <div className="px-10 py-7">
      <div className="flex flex-col items-center gap-1 rounded border border-neutral bg-surface-neutral-subtle py-10 text-sm text-neutral-subtle">
        <Icon className="text-md text-neutral-subtle" iconStyle="regular" iconName="circle-question" />
        <span className="font-medium">Monitoring is not available</span>
        <span>Deploy this service to view monitoring data</span>
      </div>
    </div>
  ) : (
    <ServiceDashboard
      organizationId={organizationId}
      environmentId={environmentId}
      serviceId={serviceId}
      queryParams={search}
      setQueryParams={setDashboardQueryParams}
    />
  )
}

function PlaceholderCard({
  title,
  description,
  status,
  icon,
}: {
  title: string
  description: string
  status?: 'GREEN' | 'RED'
  icon?: IconName
}) {
  return (
    <Section className="h-full w-full justify-center rounded border border-neutral p-4">
      <div className="flex flex-col justify-between gap-0.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Heading weight="medium">{title}</Heading>
            {status && (
              <Tooltip content="Default threshold is 250ms for percentiles">
                <Badge color={status === 'RED' ? 'red' : 'green'} size="base">
                  <Icon iconName={status === 'GREEN' ? 'circle-check' : 'circle-exclamation'} iconStyle="regular" />
                  {status === 'GREEN' ? 'Healthy' : 'Unhealthy'}
                </Badge>
              </Tooltip>
            )}
          </div>
          <Tooltip content="Show chart">
            <Button variant="outline" color="neutral" size="xs" iconOnly>
              <Icon iconName={icon ?? 'expand'} iconStyle="regular" />
            </Button>
          </Tooltip>
        </div>
        <p className="text-ssm text-neutral-subtle">{description}</p>
      </div>
    </Section>
  )
}

function PlaceholderInstanceChart() {
  return (
    <Section className="h-full w-full rounded border border-neutral p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heading weight="medium">Instances status</Heading>
            <Icon iconName="circle-info" iconStyle="regular" className="text-neutral-subtle" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-subtle">Auto-scaling limit reached</span>
            <span className="text-xs text-neutral-subtle">Instance errors</span>
            <Tooltip content="Show chart">
              <Button variant="outline" color="neutral" size="xs" iconOnly>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <g fill="currentColor" fillRule="evenodd" clipPath="url(#clip0_25356_47547)" clipRule="evenodd">
                    <path d="M4.15 3.6a.55.55 0 0 0-.55.55v1.1a.55.55 0 1 1-1.1 0v-1.1A1.65 1.65 0 0 1 4.15 2.5h1.1a.55.55 0 1 1 0 1.1zM10.2 3.05a.55.55 0 0 1 .55-.55h1.1a1.65 1.65 0 0 1 1.65 1.65v1.1a.55.55 0 1 1-1.1 0v-1.1a.55.55 0 0 0-.55-.55h-1.1a.55.55 0 0 1-.55-.55M12.95 10.2a.55.55 0 0 1 .55.55v1.1a1.65 1.65 0 0 1-1.65 1.65h-1.1a.55.55 0 1 1 0-1.1h1.1a.55.55 0 0 0 .55-.55v-1.1a.55.55 0 0 1 .55-.55M3.05 10.2a.55.55 0 0 1 .55.55v1.1a.55.55 0 0 0 .55.55h1.1a.55.55 0 1 1 0 1.1h-1.1a1.65 1.65 0 0 1-1.65-1.65v-1.1a.55.55 0 0 1 .55-.55M4.7 6.35a1.1 1.1 0 0 1 1.1-1.1h4.4a1.1 1.1 0 0 1 1.1 1.1v3.3a1.1 1.1 0 0 1-1.1 1.1H5.8a1.1 1.1 0 0 1-1.1-1.1zm5.5 0H5.8v3.3h4.4z"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_25356_47547">
                      <path fill="#fff" d="M2 2h12v12H2z"></path>
                    </clipPath>
                  </defs>
                </svg>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mt-6 flex h-[256px] flex-col items-center justify-between gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex w-full items-center text-xs text-neutral-subtle">
            <div className="h-[1px] w-full bg-surface-neutral-subtle" />
            <span className="w-5 text-right">{100 - index * 25}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-subtle">
        <span>03:00</span>
        <span>05:00</span>
        <span>07:00</span>
        <span>09:00</span>
        <span>11:00</span>
        <span>13:00</span>
        <span className="relative -left-4">15:00</span>
      </div>
    </Section>
  )
}

function PlaceholderMonitoring() {
  return (
    <div className="pointer-events-none grid h-full gap-3 md:grid-cols-1 xl:grid-cols-2">
      <PlaceholderInstanceChart />
      <div className="flex h-full flex-col gap-3">
        <PlaceholderCard title="Log errors" description="on generated logs" icon="scroll" />
        <PlaceholderCard title="HTTP error rate" description="on requests" />
        <PlaceholderCard title="Max storage usage reached" description="% of your storage allowance" />
        <PlaceholderCard title="150ms network request duration" description="for p99" status="GREEN" />
      </div>
    </div>
  )
}

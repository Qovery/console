import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Environment } from 'qovery-typescript-axios'
import { type PropsWithChildren, useContext, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode, useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import {
  NeedRedeployFlag,
  ServiceActionToolbar,
  ServiceAvatar,
  ServiceStateChip,
  ServiceTemplateIndicator,
  ServiceTerminalContext,
  useService,
} from '@qovery/domains/services/feature'
import { VariablesProvider } from '@qovery/domains/variables/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_MONITORING_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
  CLUSTER_URL,
} from '@qovery/shared/routes'
import { Badge, ErrorBoundary, Header, Icon, Link, Section, Skeleton, type TabsItem, Tooltip } from '@qovery/shared/ui'
import TabsFeature from '../../feature/tabs-feature/tabs-feature'

export interface ContainerProps extends PropsWithChildren {
  service?: Exclude<AnyService, Database>
  environment?: Environment
}

export function Container({ children }: ContainerProps) {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const isServiceObsEnabled = useFeatureFlagVariantKey('service-obs')

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

  const { setOpen } = useContext(ServiceTerminalContext)

  const hasMetrics = useMemo(
    () =>
      (isServiceObsEnabled &&
        cluster?.metrics_parameters?.enabled &&
        match(service?.serviceType)
          .with('APPLICATION', 'CONTAINER', () => true)
          .otherwise(() => false)) ||
      false,
    [isServiceObsEnabled, cluster?.metrics_parameters?.enabled, service?.serviceType]
  )

  const location = useLocation()

  const tabItems: TabsItem[] = [
    {
      icon: <ServiceStateChip mode="running" environmentId={service?.environment?.id} serviceId={service?.id} />,
      name: 'Overview',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_GENERAL_URL,
    },
    {
      icon: <ServiceStateChip mode="deployment" environmentId={service?.environment?.id} serviceId={service?.id} />,
      name: 'Deployments history',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_DEPLOYMENTS_URL,
    },
    ...(hasMetrics
      ? [
          {
            name: (
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon iconName="chart-line" iconStyle="regular" /> Monitoring
                <Badge
                  radius="full"
                  variant="surface"
                  color="purple"
                  size="sm"
                  className="h-4 border-transparent bg-purple-200 px-1 text-[8px] font-bold text-purple-600"
                >
                  NEW
                </Badge>
              </span>
            ),
            active:
              location.pathname ===
              APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_MONITORING_URL,
            link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_MONITORING_URL,
          },
        ]
      : []),
    {
      icon: <Icon iconName="key" iconStyle="regular" />,
      name: 'Variables',
      active:
        location.pathname ===
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_VARIABLES_URL,
    },
    {
      icon: <Icon iconName="gear" iconStyle="regular" />,
      name: 'Settings',
      active: location.pathname.includes(
        APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL
      ),
      link: APPLICATION_URL(organizationId, projectId, environmentId, applicationId) + APPLICATION_SETTINGS_URL,
    },
  ]

  const headerActions = (
    <div className="flex flex-row items-center gap-4">
      <Skeleton width={150} height={36} show={!service || !environment}>
        {service && environment && (
          <ServiceActionToolbar serviceId={service.id} environment={environment} shellAction={() => setOpen(true)} />
        )}
      </Skeleton>
      <div className="h-4 w-px bg-neutral-250" />
      <div className="flex flex-row items-center gap-2">
        {environment && (
          <Skeleton width={80} height={24} show={!environment?.mode}>
            <EnvironmentMode mode={environment.mode} />
          </Skeleton>
        )}
        <Skeleton width={120} height={24} show={!cluster}>
          <Tooltip content={cluster?.name ?? ''}>
            <Link
              as="button"
              color="neutral"
              variant="surface"
              size="xs"
              to={CLUSTER_URL(environment?.organization.id, environment?.cluster_id)}
            >
              <Icon
                name={
                  cluster?.kubernetes === 'SELF_MANAGED'
                    ? IconEnum.KUBERNETES
                    : (environment?.cloud_provider.provider as IconEnum)
                }
                width="16"
              />
              <p className="ml-1.5 max-w-[200px] truncate">{cluster?.name}</p>
            </Link>
          </Tooltip>
        </Skeleton>
        <Skeleton width={22} height={24} show={!service}>
          {service && 'auto_deploy' in service && service.auto_deploy && (
            <Tooltip content="Auto-deploy">
              <Badge variant="outline">
                <Icon className="text-neutral-350" iconName="arrows-rotate" />
              </Badge>
            </Tooltip>
          )}
        </Skeleton>
      </div>
    </div>
  )

  return (
    <VariablesProvider>
      <ErrorBoundary>
        <Section className="flex-1">
          <Header title={service?.name} actions={headerActions}>
            {service && (
              <ServiceTemplateIndicator service={service} size="md">
                <ServiceAvatar service={service} size="md" border="solid" />
              </ServiceTemplateIndicator>
            )}
          </Header>
          <TabsFeature items={tabItems} />
          <NeedRedeployFlag />
          <div className="mt-2 flex min-h-0 flex-grow flex-col items-stretch rounded-b-none rounded-t-sm bg-white">
            <ErrorBoundary key={tabItems.find(({ active }) => active)?.link}>{children}</ErrorBoundary>
          </div>
        </Section>
      </ErrorBoundary>
    </VariablesProvider>
  )
}

export default Container

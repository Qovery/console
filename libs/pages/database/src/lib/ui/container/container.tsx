import { DatabaseModeEnum, type Environment } from 'qovery-typescript-axios'
import { type PropsWithChildren, useContext, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import {
  NeedRedeployFlag,
  ServiceAccessModal,
  ServiceActionToolbar,
  ServiceAvatar,
  ServiceStateChip,
  ServiceTerminalContext,
} from '@qovery/domains/services/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  CLUSTER_URL,
  DATABASE_DEPLOYMENTS_URL,
  DATABASE_GENERAL_URL,
  DATABASE_MONITORING_URL,
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
} from '@qovery/shared/routes'
import {
  Badge,
  Button,
  ErrorBoundary,
  Header,
  Icon,
  Link,
  Section,
  Skeleton,
  Tabs,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'

export interface ContainerProps {
  service?: AnyService
  environment?: Environment
}

export function Container({ service, environment, children }: PropsWithChildren<ContainerProps>) {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const { setOpen } = useContext(ServiceTerminalContext)
  const location = useLocation()
  const { closeModal, openModal } = useModal()

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id || '' })

  const hasMetrics = useMemo(
    () =>
      service?.serviceType === 'DATABASE' &&
      cluster?.metrics_parameters?.enabled &&
      match((service as Database)?.mode)
        .with(DatabaseModeEnum.MANAGED, () => {
          return (
            cluster?.cloud_provider === 'AWS' &&
            cluster?.metrics_parameters?.configuration?.cloud_watch_export_config?.enabled &&
            (service?.type === 'POSTGRESQL' || service?.type === 'MYSQL')
          )
        })
        .with(DatabaseModeEnum.CONTAINER, () => true)
        .otherwise(() => false),
    [
      cluster?.cloud_provider,
      cluster?.metrics_parameters?.configuration?.cloud_watch_export_config?.enabled,
      cluster?.metrics_parameters?.enabled,
      service,
    ]
  )

  const headerActions = (
    <div className="flex flex-row items-center gap-4">
      <Skeleton width={150} height={36} show={!service}>
        <div className="flex">
          {environment && service && (
            <ServiceActionToolbar
              serviceId={service.id}
              environment={environment}
              shellAction={(service as Database).mode === 'CONTAINER' ? () => setOpen(true) : undefined}
            />
          )}
        </div>
      </Skeleton>
      <div className="h-4 w-px bg-neutral-250" />
      <div className="flex flex-row items-center gap-2">
        {environment && (
          <Skeleton width={80} height={22} show={!environment?.mode}>
            <EnvironmentMode mode={environment.mode} />
          </Skeleton>
        )}
        <Skeleton width={120} height={22} show={!cluster}>
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
      </div>
    </div>
  )

  const tabsItems = [
    {
      icon: (
        <ServiceStateChip
          mode="running"
          environmentId={environmentId}
          serviceId={databaseId}
          withDeploymentFallback={service && 'mode' in service && service.mode === DatabaseModeEnum.MANAGED}
        />
      ),
      name: 'Overview',
      active:
        location.pathname === DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_GENERAL_URL,
    },
    {
      icon: <ServiceStateChip mode="deployment" environmentId={environmentId} serviceId={databaseId} />,
      name: 'Deployments history',
      active:
        location.pathname ===
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
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
              DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_MONITORING_URL,
            link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_MONITORING_URL,
          },
        ]
      : []),
    {
      icon: <Icon iconName="gear" iconStyle="regular" />,
      name: 'Settings',
      active: location.pathname.includes(
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL
      ),
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_SETTINGS_URL,
    },
  ]

  return (
    <ErrorBoundary>
      <Section className="flex-1">
        <Header title={service?.name} actions={headerActions}>
          {service && <ServiceAvatar service={service} border="solid" />}
        </Header>
        <Tabs
          items={tabsItems}
          contentRight={match(service)
            .with({ serviceType: 'DATABASE' }, (s) => (
              <Button
                className="mr-4 gap-2"
                size="md"
                color="neutral"
                variant="surface"
                onClick={() =>
                  openModal({
                    content: (
                      <ServiceAccessModal
                        organizationId={organizationId}
                        projectId={projectId}
                        service={s}
                        onClose={closeModal}
                      />
                    ),
                    options: {
                      width: 680,
                    },
                  })
                }
              >
                Access info
                <Icon iconName="info-circle" iconStyle="regular" />
              </Button>
            ))
            .otherwise(() => null)}
        />
        <NeedRedeployFlag />
        <div className="mt-2 flex min-h-0 flex-grow flex-col items-stretch rounded-b-none rounded-t-sm bg-white">
          <ErrorBoundary key={tabsItems.find(({ active }) => active)?.link}>{children}</ErrorBoundary>
        </div>
      </Section>
    </ErrorBoundary>
  )
}

export default Container

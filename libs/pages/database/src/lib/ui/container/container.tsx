import { DatabaseModeEnum, type Environment } from 'qovery-typescript-axios'
import { type PropsWithChildren, useContext } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode } from '@qovery/domains/environments/feature'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import {
  NeedRedeployFlag,
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
  DATABASE_SETTINGS_URL,
  DATABASE_URL,
} from '@qovery/shared/routes'
import { ErrorBoundary, Header, Icon, Link, Section, Skeleton, Tabs, Tooltip } from '@qovery/shared/ui'

export interface ContainerProps {
  service?: AnyService
  environment?: Environment
}

export function Container({ service, environment, children }: PropsWithChildren<ContainerProps>) {
  const { organizationId = '', projectId = '', environmentId = '', databaseId = '' } = useParams()
  const { setOpen } = useContext(ServiceTerminalContext)
  const location = useLocation()

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id || '' })

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
            <EnvironmentMode size="xs" mode={environment.mode} />
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
      name: 'Deployments',
      active:
        location.pathname ===
        DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
      link: DATABASE_URL(organizationId, projectId, environmentId, databaseId) + DATABASE_DEPLOYMENTS_URL,
    },
    {
      icon: <Icon name="icon-solid-wheel" />,
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
          {service && <ServiceAvatar service={service} />}
        </Header>
        <Tabs items={tabsItems} />
        <NeedRedeployFlag />
        <div className="mt-2 flex min-h-0 flex-grow flex-col items-stretch rounded-b-none rounded-t-sm bg-white">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </Section>
    </ErrorBoundary>
  )
}

export default Container

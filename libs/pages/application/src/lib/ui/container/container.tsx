import { type Environment } from 'qovery-typescript-axios'
import { type PropsWithChildren, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { EnvironmentMode, useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database } from '@qovery/domains/services/data-access'
import {
  NeedRedeployFlag,
  ServiceActionToolbar,
  ServiceBadge,
  ServiceTerminalContext,
  useService,
} from '@qovery/domains/services/feature'
import { VariablesProvider } from '@qovery/domains/variables/feature'
import { IconEnum } from '@qovery/shared/enums'
import { CLUSTER_URL } from '@qovery/shared/routes'
import { Badge, ErrorBoundary, Header, Icon, Link, Section, Skeleton, Tooltip } from '@qovery/shared/ui'
import TabsFeature from '../../feature/tabs-feature/tabs-feature'

export interface ContainerProps extends PropsWithChildren {
  service?: Exclude<AnyService, Database>
  environment?: Environment
}

export function Container({ children }: ContainerProps) {
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  const { setOpen } = useContext(ServiceTerminalContext)

  const { data: cluster } = useCluster({ organizationId, clusterId: environment?.cluster_id ?? '' })

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
        <Skeleton width={22} height={22} show={!service}>
          {service && 'auto_deploy' in service && service.auto_deploy && (
            <Tooltip content="Auto-deploy">
              <Badge variant="outline" size="xs">
                <Icon className="text-neutral-350" iconName="arrows-rotate" />
              </Badge>
            </Tooltip>
          )}
        </Skeleton>
      </div>
    </div>
  )

  const serviceIcon = match(service)
    .with({ serviceType: 'HELM' }, () => (
      <div className="flex h-16 w-16 items-center justify-center">
        <Icon name="HELM" className="w-10" />
      </div>
    ))
    .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, (s) =>
      s.schedule.lifecycle_type !== 'GENERIC' ? (
        <ServiceBadge size="md" icon="LIFECYCLE_JOB" type={s.schedule.lifecycle_type} />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center">
          <Icon name="LIFECYCLE_JOB" className="w-10" />
        </div>
      )
    )
    .with({ serviceType: 'JOB', job_type: 'CRON' }, () => (
      <div className="flex h-16 w-16 items-center justify-center">
        <Icon name={IconEnum.CRON_JOB} className="w-10" />
      </div>
    ))
    .otherwise(() => (
      <div className="flex h-16 w-16 items-center justify-center">
        <Icon name={IconEnum.APPLICATION} className="w-10" />
      </div>
    ))

  return (
    <VariablesProvider>
      <ErrorBoundary>
        <Section className="flex-1">
          <Header title={service?.name} actions={headerActions}>
            {serviceIcon}
          </Header>
          <TabsFeature />
          <NeedRedeployFlag />
          <div className="mt-2 flex min-h-0 flex-grow flex-col items-stretch rounded-b-none rounded-t-sm bg-white">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </Section>
      </ErrorBoundary>
    </VariablesProvider>
  )
}

export default Container

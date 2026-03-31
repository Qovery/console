import { type Environment } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { AnimatedGradientText, Button, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { formatCronExpression, upperCaseFirstLetter } from '@qovery/shared/util-js'
import useDeploymentStatus from '../../hooks/use-deployment-status/use-deployment-status'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import ServiceLinksPopover from '../../service-links-popover/service-links-popover'
import ServiceTemplateIndicator from '../../service-template-indicator/service-template-indicator'

const LinkDeploymentStatus = ({ environmentId, serviceId }: { environmentId: string; serviceId: string }) => {
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })

  // const environmentLog = ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)
  // const deploymentLog = DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentStatus?.execution_id)
  // const precheckLog = ENVIRONMENT_PRE_CHECK_LOGS_URL(deploymentStatus?.execution_id ?? '')

  return match(deploymentStatus?.state)
    .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', (s) => (
      <span className="text-ssm font-normal text-neutral-subtle">{upperCaseFirstLetter(s).replace('_', ' ')}...</span>
    ))
    .with('CANCELED', () => <span className="text-ssm font-normal text-neutral-subtle">Last deployment aborted</span>)
    .with('DEPLOYING', 'RESTARTING', 'BUILDING', 'DELETING', 'CANCELING', 'STOPPING', (s) => (
      // TODO new-nav : Route not yet created
      // <Link
      //   to=""
      //   color="brand"
      //   underline
      //   size="ssm"
      //   className="group flex truncate"
      //   onClick={(e) => e.stopPropagation()}
      // >
      <div className="group flex truncate">
        <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
          <span className="flex items-center gap-0.5">
            {upperCaseFirstLetter(s)}... <Icon iconName="arrow-up-right" />
          </span>
        </AnimatedGradientText>
      </div>
      // </Link>
    ))
    .with('DEPLOYMENT_ERROR', 'DELETE_ERROR', 'STOP_ERROR', 'RESTART_ERROR', 'BUILD_ERROR', () => (
      <button
        className="flex cursor-pointer items-center gap-0.5 truncate text-ssm font-medium text-negative underline-offset-2 hover:text-negative-hover hover:underline"
        onClick={(e) => {
          e.stopPropagation()
          // TODO new-nav : Route not yet created
          // navigate({ to: (environmentLog + deploymentLog) as never })
        }}
      >
        Last deployment failed
        <Icon iconName="arrow-up-right" />
      </button>
    ))
    .otherwise(() => null)
}

export function ServiceNameCell({ service, environment }: { service: AnyService; environment: Environment }) {
  return (
    <div className="flex h-full items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <ServiceTemplateIndicator service={service} size="sm">
            <ServiceAvatar service={service} size="custom" className="h-5 w-5" serviceAvatarRadius="sm" radius="none" />
          </ServiceTemplateIndicator>
          {match(service)
            .with({ serviceType: 'DATABASE' }, (db) => {
              return (
                <span className="flex min-w-0 shrink flex-col truncate">
                  <span className="flex items-center gap-1.5">
                    <Tooltip content={db.name}>
                      <Link
                        className="inline max-w-max truncate"
                        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                        params={{
                          organizationId: environment.organization.id,
                          projectId: environment.project.id,
                          environmentId: environment.id,
                          serviceId: service.id,
                        }}
                        underline
                        onClick={(e) => e.stopPropagation()}
                      >
                        {db.name}
                      </Link>
                    </Tooltip>
                  </span>
                  <LinkDeploymentStatus environmentId={environment.id} serviceId={service.id} />
                </span>
              )
            })
            .with({ serviceType: 'JOB' }, (job) => {
              const schedule = match(job)
                .with(
                  { job_type: 'CRON' },
                  ({ schedule }) =>
                    `Triggered: ${formatCronExpression(schedule.cronjob?.scheduled_at)} (${schedule.cronjob?.timezone})`
                )
                .with({ job_type: 'LIFECYCLE' }, ({ schedule }) => {
                  const actions = [
                    schedule.on_start && 'Deploy',
                    schedule.on_stop && 'Stop',
                    schedule.on_delete && 'Delete',
                  ]
                    .filter(Boolean)
                    .join(' - ')
                  return actions ? `Triggered on: ${actions}` : undefined
                })
                .exhaustive()

              return (
                <span className="flex min-w-0 shrink flex-col truncate">
                  <span className="flex items-center gap-1.5">
                    <Tooltip content={service.name}>
                      <Link
                        className="inline max-w-max truncate"
                        to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                        params={{
                          organizationId: environment.organization.id,
                          projectId: environment.project.id,
                          environmentId: environment.id,
                          serviceId: service.id,
                        }}
                        underline
                        onClick={(e) => e.stopPropagation()}
                      >
                        {service.name}
                      </Link>
                    </Tooltip>
                    <Tooltip content={schedule}>
                      <span className="truncate text-sm font-normal">
                        <Icon iconName="info-circle" iconStyle="regular" />
                      </span>
                    </Tooltip>
                  </span>
                  <LinkDeploymentStatus environmentId={environment.id} serviceId={service.id} />
                </span>
              )
            })
            .otherwise(() => (
              <span className="flex min-w-0 shrink flex-col truncate">
                <Tooltip content={service.name}>
                  <Link
                    className="inline max-w-max truncate"
                    to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                    params={{
                      organizationId: environment.organization.id,
                      projectId: environment.project.id,
                      environmentId: environment.id,
                      serviceId: service.id,
                    }}
                    underline
                    onClick={(e) => e.stopPropagation()}
                  >
                    {service.name}
                  </Link>
                </Tooltip>
                <LinkDeploymentStatus environmentId={environment.id} serviceId={service.id} />
              </span>
            ))}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ServiceLinksPopover
            organizationId={environment.organization.id}
            projectId={environment.project.id}
            environmentId={environment.id}
            serviceId={service.id}
            align="start"
          >
            <Button variant="outline" color="neutral" radius="full" iconOnly>
              <Tooltip content="Links">
                <Icon iconName="link" iconStyle="regular" />
              </Tooltip>
            </Button>
          </ServiceLinksPopover>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  APPLICATION_GENERAL_URL,
  APPLICATION_URL,
  DATABASE_GENERAL_URL,
  DATABASE_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
} from '@qovery/shared/routes'
import { AnimatedGradientText, Badge, Button, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { formatCronExpression, pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import useDeploymentStatus from '../../hooks/use-deployment-status/use-deployment-status'
import ServiceActionToolbar from '../../service-action-toolbar/service-action-toolbar'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import ServiceLinksPopover from '../../service-links-popover/service-links-popover'
import ServiceTemplateIndicator from '../../service-template-indicator/service-template-indicator'

export function ServiceNameCell({ service, environment }: { service: AnyService; environment: Environment }) {
  const navigate = useNavigate()
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id, serviceId: service.id })
  const deploymentRequestsCount = Number(deploymentStatus?.deployment_requests_count)

  const LinkDeploymentStatus = () => {
    const environmentLog = ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id)
    const deploymentLog = DEPLOYMENT_LOGS_VERSION_URL(service.id, deploymentStatus?.execution_id)
    // const precheckLog = ENVIRONMENT_PRE_CHECK_LOGS_URL(deploymentStatus?.execution_id ?? '')

    return match(deploymentStatus?.state)
      .with('DEPLOYMENT_QUEUED', 'DELETE_QUEUED', 'STOP_QUEUED', 'RESTART_QUEUED', (s) => (
        <span className="text-ssm font-normal text-neutral-subtle">{upperCaseFirstLetter(s).replace('_', ' ')}...</span>
      ))
      .with('CANCELED', () => <span className="text-ssm font-normal text-neutral-subtle">Last deployment aborted</span>)
      .with('DEPLOYING', 'RESTARTING', 'BUILDING', 'DELETING', 'CANCELING', 'STOPPING', (s) => (
        <Link
          to={environmentLog + deploymentLog}
          color="brand"
          underline
          size="ssm"
          className="group flex truncate"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
            <span className="flex items-center gap-0.5">
              {upperCaseFirstLetter(s)}... <Icon iconName="arrow-up-right" />
            </span>
          </AnimatedGradientText>
        </Link>
      ))
      .with('DEPLOYMENT_ERROR', 'DELETE_ERROR', 'STOP_ERROR', 'RESTART_ERROR', 'BUILD_ERROR', () => (
        <Link
          // to={deploymentStatus?.steps === null ? environmentLog + precheckLog : environmentLog + deploymentLog}
          to={environmentLog + deploymentLog}
          color="red"
          underline
          size="ssm"
          className="truncate"
          onClick={(e) => e.stopPropagation()}
        >
          Last deployment failed
          <Icon iconName="arrow-up-right" />
        </Link>
      ))
      .otherwise(() => null)
  }

  return (
    <div className="flex items-center justify-between">
      <span className="flex min-w-0 items-center gap-4 text-sm font-medium text-neutral">
        <ServiceTemplateIndicator service={service} size="sm">
          <ServiceAvatar service={service} size="sm" border="solid" />
        </ServiceTemplateIndicator>
        {match(service)
          .with({ serviceType: 'DATABASE' }, (db) => {
            return (
              <span className="flex min-w-0 shrink flex-col truncate pr-2">
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
                <LinkDeploymentStatus />
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
              <span className="flex min-w-0 shrink flex-col truncate pr-2">
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
                <LinkDeploymentStatus />
              </span>
            )
          })
          .otherwise(() => (
            <span className="flex min-w-0 shrink flex-col truncate pr-2">
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
              <LinkDeploymentStatus />
            </span>
          ))}

        {deploymentRequestsCount > 0 && (
          <Tooltip
            content={`This service has ${deploymentRequestsCount} queued ${pluralize(deploymentRequestsCount, 'deployment')}`}
          >
            <Badge className="flex items-center gap-1">
              <Icon iconName="clock-eight" iconStyle="regular" />
              {deploymentRequestsCount}
            </Badge>
          </Tooltip>
        )}
      </span>
      <div className="flex shrink-0 items-center gap-5">
        <div className="flex items-center">
          {'auto_deploy' in service && service.auto_deploy && (
            <Tooltip content="Auto-deploy">
              <span>
                <Icon className="text-neutral-subtle" iconName="arrows-rotate" />
              </span>
            </Tooltip>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <ServiceLinksPopover
              organizationId={environment.organization.id}
              projectId={environment.project.id}
              environmentId={environment.id}
              serviceId={service.id}
              align="start"
            >
              <Button variant="surface" color="neutral" radius="full" className="ml-3">
                <Tooltip content="Links">
                  <div className="flex items-center gap-1">
                    <Icon iconName="link" iconStyle="regular" />
                    <Icon iconName="angle-down" />
                  </div>
                </Tooltip>
              </Button>
            </ServiceLinksPopover>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ServiceActionToolbar
            serviceId={service.id}
            environment={environment}
            shellAction={match(service)
              .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => undefined)
              .with(
                { serviceType: 'DATABASE', mode: 'CONTAINER' },
                () => () =>
                  navigate({
                    to:
                      DATABASE_URL(environment.organization.id, environment.project.id, environment.id, service.id) +
                      DATABASE_GENERAL_URL,
                    state: {
                      hasShell: true,
                    } as any,
                  })
              )
              .otherwise(
                () => () =>
                  navigate({
                    to:
                      APPLICATION_URL(environment.organization.id, environment.project.id, environment.id, service.id) +
                      APPLICATION_GENERAL_URL,
                    state: {
                      hasShell: true,
                    } as any,
                  })
              )}
          />
        </div>
      </div>
    </div>
  )
}

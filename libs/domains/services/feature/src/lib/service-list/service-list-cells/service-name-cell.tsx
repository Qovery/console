import { type Environment } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { AnimatedGradientText, Badge, Button, DropdownMenu, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { formatCronExpression, pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import useDeploymentStatus from '../../hooks/use-deployment-status/use-deployment-status'
import ServiceActions from '../../service-actions/service-actions'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import ServiceLinksPopover from '../../service-links-popover/service-links-popover'
import ServiceTemplateIndicator from '../../service-template-indicator/service-template-indicator'

export function ServiceNameCell({
  service,
  environment,
  argocdOperationLabelOverride,
  argocdStatusLabelOverride,
}: {
  service: AnyService
  environment: Environment
  argocdOperationLabelOverride?: string
  argocdStatusLabelOverride?: 'Synced' | 'Out of sync'
}) {
  const [, copyToClipboard] = useCopyToClipboard()
  const isArgoCdOverride = argocdOperationLabelOverride !== undefined
  const { data: deploymentStatus } = useDeploymentStatus({
    environmentId: isArgoCdOverride ? undefined : environment.id,
    serviceId: isArgoCdOverride ? undefined : service.id,
  })
  const deploymentRequestsCount = Number(deploymentStatus?.deployment_requests_count)

  const LinkDeploymentStatus = () => {
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
          className="flex cursor-pointer truncate text-ssm font-medium text-negative underline-offset-2 hover:text-negative-hover hover:underline"
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

  if (argocdOperationLabelOverride) {
    const isOutOfSync = argocdStatusLabelOverride === 'Out of sync'
    const serviceAvatar = {
      ...service,
      icon_uri: 'app://qovery-console/argocd',
    }

    return (
      <div className="flex items-center justify-between">
        <span className="flex min-w-0 items-center gap-4 text-sm font-medium text-neutral">
          <ServiceTemplateIndicator service={service} size="sm">
            <ServiceAvatar service={serviceAvatar} size="sm" border="solid" />
          </ServiceTemplateIndicator>
          <span className="flex min-w-0 shrink truncate pr-2">
            <span className="truncate">{service.name}</span>
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Tooltip content="Rollout">
            <Button variant="outline" color="neutral" size="sm" iconOnly onClick={(e) => e.stopPropagation()}>
              <Icon iconName="rotate-right" />
            </Button>
          </Tooltip>
          <Tooltip content="Logs">
            <Link
              as="button"
              to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/service-logs"
              params={{
                organizationId: environment.organization.id,
                projectId: environment.project.id,
                environmentId: environment.id,
                serviceId: service.id,
              }}
              color="neutral"
              variant="outline"
              size="sm"
              iconOnly
              onClick={(e) => e.stopPropagation()}
            >
              <Icon iconName="scroll" />
            </Link>
          </Tooltip>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                iconOnly
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon iconName="ellipsis-v" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" onClick={(e) => e.stopPropagation()}>
              {isOutOfSync && <DropdownMenu.Item icon={<Icon iconName="rotate-right" />}>Force sync</DropdownMenu.Item>}
              <DropdownMenu.Item icon={<Icon iconName="clock-rotate-left" />} asChild>
                <Link
                  className="gap-0"
                  to="/organization/$organizationId/audit-logs"
                  params={{ organizationId: environment.organization.id }}
                  search={{
                    targetId: service.id,
                    targetType: service.serviceType,
                    projectId: environment.project.id,
                    environmentId: environment.id,
                  }}
                >
                  See audit logs
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item icon={<Icon iconName="copy" />} onSelect={() => copyToClipboard(service.id)}>
                Copy identifier
              </DropdownMenu.Item>
              <DropdownMenu.Item icon={<Icon iconName="gear" />} asChild>
                <Link
                  className="gap-0"
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings"
                  params={{
                    organizationId: environment.organization.id,
                    projectId: environment.project.id,
                    environmentId: environment.id,
                    serviceId: service.id,
                  }}
                >
                  See manifest
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    )
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
          <ServiceActions serviceId={service.id} environment={environment} />
        </div>
      </div>
    </div>
  )
}

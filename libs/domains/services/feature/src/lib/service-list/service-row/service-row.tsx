import { useNavigate, useParams } from '@tanstack/react-router'
import { type DeploymentHistoryService, type Environment } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { DevopsCopilotTroubleshootTrigger } from '@qovery/shared/devops-copilot/feature'
import {
  AnimatedGradientText,
  Button,
  DeploymentAction,
  Icon,
  Link,
  StatusChip,
  TablePrimitives,
  Tooltip,
} from '@qovery/shared/ui'
import { formatCronExpression, twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useDeploymentStatus } from '../../hooks/use-deployment-status/use-deployment-status'
import { useServiceDeploymentAndRunningStatuses } from '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses'
import { ServiceActions } from '../../service-actions/service-actions'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import { ServiceLinksPopover } from '../../service-links-popover/service-links-popover'
import { ServiceTemplateIndicator } from '../../service-template-indicator/service-template-indicator'
import { gridLayoutClassName } from '../service-list'
import { ServiceRunningStatusCell, ServiceVersionCell } from '../service-list-cells'

const { Table } = TablePrimitives

const LinkDeploymentStatus = ({ environmentId, serviceId }: { environmentId: string; serviceId: string }) => {
  const navigate = useNavigate()
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
        className="flex cursor-pointer  items-center gap-0.5 truncate text-ssm font-medium text-negative underline-offset-2 hover:text-negative-hover hover:underline"
        onClick={(e) => {
          e.stopPropagation()
          // TODO new-nav : Route not yet created
          // navigate({
          //   to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs',
          //   params: {
          //     organizationId: environment.organization.id,
          //     projectId: environment.project.id,
          //     environmentId: environment.id,
          //     serviceId: service.id,
          //   },
          // })
        }}
      >
        Last deployment failed
        <Icon iconName="arrow-up-right" />
      </button>
    ))
    .otherwise(() => null)
}

const ServiceStatus = ({ service, environmentId }: { service: AnyService; environmentId: string }) => {
  const {
    data: { runningStatus, deploymentStatus },
  } = useServiceDeploymentAndRunningStatuses({ environmentId, service })

  const serviceStatus = match(service)
    .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => deploymentStatus?.state)
    .otherwise(() => runningStatus?.state)

  return <StatusChip status={serviceStatus} />
}

export const ServiceRow = ({ service, environment }: { service: AnyService; environment: Environment }) => {
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const cellClassName = 'h-auto border-l border-neutral py-2'

  const handleNavigate = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId',
      params: { organizationId, projectId, environmentId: environment.id, serviceId: service.id },
    })
  }

  const { data: deploymentStatus } = useDeploymentStatus({ environmentId: environment.id, serviceId: service.id })

  const subAction = deploymentStatus?.status_details?.sub_action
  const triggerAction = subAction !== 'NONE' ? subAction : deploymentStatus?.status_details?.action

  return (
    <Table.Row
      key={service.id}
      tabIndex={0}
      role="link"
      className={twMerge(
        'w-full hover:cursor-pointer hover:bg-surface-neutral-subtle focus:bg-surface-neutral-subtle',
        gridLayoutClassName
      )}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleNavigate()
      }}
    >
      <Table.Cell className={twMerge(cellClassName, 'border-none')}>
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <ServiceTemplateIndicator service={service} size="sm">
                <ServiceAvatar
                  service={service}
                  size="custom"
                  className="h-5 w-5"
                  serviceAvatarRadius="sm"
                  radius="none"
                />
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
          <ServiceStatus service={service} environmentId={environment.id} />
        </div>
      </Table.Cell>
      <Table.Cell className={twMerge(cellClassName)}>
        <div className="flex h-full items-center">
          <div className="flex w-full items-center justify-between">
            <DeploymentAction status={triggerAction} />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {deploymentStatus?.status_details?.status === 'ERROR' && (
                  <DevopsCopilotTroubleshootTrigger
                    source="service-deployment-list"
                    deploymentId={deploymentStatus?.execution_id}
                    message={
                      deploymentStatus?.execution_id
                        ? `Why did my deployment fail? (execution id: ${deploymentStatus?.execution_id})`
                        : 'Why did my deployment fail?'
                    }
                  />
                )}
                <StatusChip status={deploymentStatus?.status_details?.status} />
              </div>
            </div>
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className={twMerge(cellClassName)}>
        <ServiceVersionCell service={service} organizationId={organizationId} projectId={projectId} />
      </Table.Cell>
      <Table.Cell className={twMerge(cellClassName)}>
        <div className="flex h-full items-center" onClick={(e) => e.stopPropagation()}>
          <ServiceActions serviceId={service.id} environment={environment} />
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

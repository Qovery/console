import { Link } from '@tanstack/react-router'
import { type Environment } from 'qovery-typescript-axios'
import { type KeyboardEvent, type MouseEvent } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import ServiceLinksPopover from '../../service-links-popover/service-links-popover'
import ServiceTemplateIndicator from '../../service-template-indicator/service-template-indicator'

export function ServiceNameCell({ service, environment }: { service: AnyService; environment: Environment }) {
  const serviceLinkParams = {
    organizationId: environment.organization.id,
    projectId: environment.project.id,
    environmentId: environment.id,
    serviceId: service.id,
  }
  const stopRowNavigation = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  return (
    <div className="flex h-full min-w-0 max-w-full items-center justify-between overflow-hidden">
      <div className="flex h-full min-w-0 flex-1 items-center gap-3">
        <div className="flex h-full items-center gap-2.5 overflow-hidden text-sm font-medium">
          <ServiceTemplateIndicator service={service} size="sm" side="bottom" align="end">
            <ServiceAvatar service={service} size="custom" className="h-5 w-5" serviceAvatarRadius="sm" radius="none" />
          </ServiceTemplateIndicator>
          {match(service)
            .with({ serviceType: 'DATABASE' }, (db) => {
              return (
                <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Link
                      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                      params={serviceLinkParams}
                      onClick={stopRowNavigation}
                      onKeyDown={stopRowNavigation}
                      className="group min-w-0"
                    >
                      <Tooltip content={db.name}>
                        <span className="block min-w-0 truncate group-hover:underline">{db.name}</span>
                      </Tooltip>
                    </Link>
                  </span>
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
                <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Link
                      to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                      params={serviceLinkParams}
                      onClick={stopRowNavigation}
                      onKeyDown={stopRowNavigation}
                      className="group min-w-0"
                    >
                      <Tooltip content={service.name}>
                        <span className="block min-w-0 truncate group-hover:underline">{service.name}</span>
                      </Tooltip>
                    </Link>
                    <Tooltip content={schedule}>
                      <span className="shrink-0 truncate text-sm font-normal text-neutral-subtle">
                        <Icon iconName="info-circle" iconStyle="regular" />
                      </span>
                    </Tooltip>
                  </span>
                </span>
              )
            })
            .otherwise(() => (
              <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Link
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview"
                  params={serviceLinkParams}
                  onClick={stopRowNavigation}
                  onKeyDown={stopRowNavigation}
                  className="group min-w-0"
                >
                  <Tooltip content={service.name}>
                    <span className="block min-w-0 truncate group-hover:underline">{service.name}</span>
                  </Tooltip>
                </Link>
              </span>
            ))}
        </div>

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ServiceLinksPopover
            organizationId={environment.organization.id}
            projectId={environment.project.id}
            environmentId={environment.id}
            serviceId={service.id}
            align="start"
          >
            <Button variant="outline" color="neutral" radius="full" iconOnly aria-label="Links" size="xs">
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

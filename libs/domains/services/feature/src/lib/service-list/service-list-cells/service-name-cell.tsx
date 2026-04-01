import { type Environment } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Button, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import ServiceLinksPopover from '../../service-links-popover/service-links-popover'
import ServiceTemplateIndicator from '../../service-template-indicator/service-template-indicator'

export function ServiceNameCell({ service, environment }: { service: AnyService; environment: Environment }) {
  return (
    <div className="flex h-full items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
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
                      <span className="truncate text-sm font-normal text-neutral-subtle">
                        <Icon iconName="info-circle" iconStyle="regular" />
                      </span>
                    </Tooltip>
                  </span>
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
            <Button variant="outline" color="neutral" radius="full" iconOnly aria-label="Links">
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

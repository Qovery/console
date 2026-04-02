import { type Environment } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Button, Icon, Tooltip } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { ServiceAvatar } from '../../service-avatar/service-avatar'
import ServiceLinksPopover from '../../service-links-popover/service-links-popover'
import ServiceTemplateIndicator from '../../service-template-indicator/service-template-indicator'

export function ServiceNameCell({ service, environment }: { service: AnyService; environment: Environment }) {
  return (
    <div className="flex h-full min-w-0 max-w-full items-center justify-between overflow-hidden">
      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden text-sm font-medium">
          <ServiceTemplateIndicator service={service} size="sm">
            <ServiceAvatar service={service} size="custom" className="h-5 w-5" serviceAvatarRadius="sm" radius="none" />
          </ServiceTemplateIndicator>
          {match(service)
            .with({ serviceType: 'DATABASE' }, (db) => {
              return (
                <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Tooltip content={db.name}>
                      <span className="block min-w-0 truncate">{db.name}</span>
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
                <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Tooltip content={service.name}>
                      <span className="block min-w-0 flex-1 truncate">{service.name}</span>
                    </Tooltip>
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
                <Tooltip content={service.name}>
                  <span className="block min-w-0 truncate">{service.name}</span>
                </Tooltip>
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

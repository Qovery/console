import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Avatar, Icon } from '@qovery/shared/ui'
import { type IconURI, ServiceIcons } from '../service-icon/service-icon'

// XXX: Todo remove `job_type`
// https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1427
export interface ServiceAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  service:
    | {
        icon_uri: string
        serviceType: Extract<AnyService['service_type'], 'JOB'>
        job_type: 'CRON' | 'LIFECYCLE'
      }
    | {
        icon_uri: string
        serviceType: Exclude<AnyService['service_type'], 'JOB'>
        job_type?: never
      }
}

export const ServiceAvatar = forwardRef<ElementRef<typeof Avatar>, ServiceAvatarProps>(function ServiceAvatar(
  { service, ...props },
  ref
) {
  const iconName = match(service)
    .with({ serviceType: 'HELM' }, () => 'HELM')
    .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, () => 'LIFECYCLE_JOB')
    .with({ serviceType: 'JOB', job_type: 'CRON' }, () => 'CRON_JOB')
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, () => 'APPLICATION')
    .with({ serviceType: 'DATABASE' }, () => 'DATABASE')
    .with({ serviceType: 'TERRAFORM' }, () => 'TERRAFORM')
    .exhaustive()

  const serviceAvatar = ServiceIcons[service.icon_uri as IconURI]

  return (
    <Avatar
      ref={ref}
      fallback={
        serviceAvatar ? (
          <img
            src={serviceAvatar.icon}
            alt={service.serviceType}
            height="100%"
            width="100%"
            className="max-h-full max-w-full rounded-full object-contain"
          />
        ) : (
          <Icon name={iconName} height="100%" width="100%" />
        )
      }
      {...props}
    />
  )
})

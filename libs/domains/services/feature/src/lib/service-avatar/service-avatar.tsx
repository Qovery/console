import clsx from 'clsx'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Avatar, Icon } from '@qovery/shared/ui'
import { type IconURI, ServiceIcons } from '../service-icon/service-icon'

// XXX: Todo remove `job_type`
// https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1427
type ServiceAvatarRadius = 'none' | 'sm' | 'md' | 'full'

export interface ServiceAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback' | 'size'> {
  size?: ComponentPropsWithoutRef<typeof Avatar>['size'] | 'custom'
  serviceAvatarRadius?: ServiceAvatarRadius
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
  { service, size, className, radius, serviceAvatarRadius = 'full', ...props },
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
      size={size}
      radius={radius}
      className={className}
      fallback={
        serviceAvatar ? (
          <img
            src={serviceAvatar.icon}
            alt={service.serviceType}
            height="100%"
            width="100%"
            className={clsx(
              'max-h-full max-w-full object-contain',
              `rounded-${serviceAvatarRadius}`,
              serviceAvatar.className
            )}
          />
        ) : (
          <Icon name={iconName} height="100%" width="100%" />
        )
      }
      {...props}
    />
  )
})

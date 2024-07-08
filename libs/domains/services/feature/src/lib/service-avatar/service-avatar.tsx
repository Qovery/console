import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Avatar, Icon } from '@qovery/shared/ui'

export interface ServiceAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  service: AnyService
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
    .exhaustive()

  return <Avatar ref={ref} fallback={<Icon name={iconName} height="100%" width="100%" />} {...props} />
})

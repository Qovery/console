import { BuildModeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { IconEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'

export interface ServiceIconProps {
  service: AnyService
  buildMode?: BuildModeEnum
  size?: string
  padding?: string
  className?: string
  notRounded?: boolean
}

export const iconByService = (service: AnyService) => {
  return match(service)
    .with({ serviceType: 'APPLICATION' }, (application) => (
      <Icon
        name={application.build_mode === BuildModeEnum.DOCKER ? IconEnum.DOCKER : IconEnum.BUILDPACKS}
        className={`${application.build_mode === BuildModeEnum.DOCKER ? 'relative left-[1px] ' : ''}h-full w-full`}
      />
    ))
    .with({ serviceType: 'CONTAINER' }, () => <Icon name={IconEnum.CONTAINER} className="h-full w-full" />)
    .with({ job_type: 'CRON' }, () => <Icon name={IconEnum.CRON_JOB} className="h-full w-full" />)
    .with({ job_type: 'LIFECYCLE' }, () => <Icon name={IconEnum.LIFECYCLE_JOB} className="h-full w-full" />)
    .with({ serviceType: 'DATABASE' }, () => <Icon name={IconEnum.DATABASE} className="h-full w-full" />)
    .with({ serviceType: 'HELM' }, () => <Icon name={IconEnum.HELM} className="h-full w-full" />)
    .exhaustive()
}

// @deprecated use ServiceAvatar instead
export function ServiceIcon({ service, notRounded, size = '28', padding = '1', className = '' }: ServiceIconProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center 
      ${!notRounded ? 'rounded-full border border-neutral-200' : ''} 
      ${className} `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: `${padding}px`,
      }}
    >
      <span className={`h-full w-full ${!notRounded ? 'p-1' : ''}`}>{iconByService(service)}</span>
    </div>
  )
}

export default ServiceIcon

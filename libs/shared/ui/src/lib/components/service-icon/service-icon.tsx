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
        className={`w-full h-full ${application.build_mode === BuildModeEnum.DOCKER ? 'relative left-[1px]' : ''}`}
      />
    ))
    .with({ serviceType: 'CONTAINER' }, () => <Icon name={IconEnum.CONTAINER} className="w-full h-full" />)
    .with({ job_type: 'CRON' }, () => <Icon name={IconEnum.CRON_JOB} className="w-full h-full" />)
    .with({ job_type: 'LIFECYCLE' }, () => <Icon name={IconEnum.LIFECYCLE_JOB} className="w-full h-full" />)
    .with({ serviceType: 'DATABASE' }, () => <Icon name={IconEnum.DATABASE} className="w-full h-full" />)
    .with({ serviceType: 'HELM' }, () => <Icon name={IconEnum.HELM} className="w-full h-full" />)
    .exhaustive()
}

export function ServiceIcon({ service, notRounded, size = '28', padding = '1', className = '' }: ServiceIconProps) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 
      ${!notRounded ? 'border border-neutral-200 rounded-full' : ''} 
      ${className} `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: `${padding}px`,
      }}
    >
      <span className={`w-full h-full ${!notRounded ? 'p-1' : ''}`}>{iconByService(service)}</span>
    </div>
  )
}

export default ServiceIcon

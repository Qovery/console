import { BuildModeEnum, type CloudProviderEnum } from 'qovery-typescript-axios'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'

export interface ServiceIconProps {
  serviceType: ServiceTypeEnum
  cloudProvider?: CloudProviderEnum
  buildMode?: BuildModeEnum
  size?: string
  padding?: string
  className?: string
  notRounded?: boolean
}

export const iconByService = (
  serviceType: ServiceTypeEnum,
  cloudProvider?: CloudProviderEnum,
  buildMode?: BuildModeEnum
) => {
  switch (serviceType) {
    case ServiceTypeEnum.APPLICATION:
      return (
        <Icon
          name={buildMode === BuildModeEnum.DOCKER ? IconEnum.DOCKER : IconEnum.BUILDPACKS}
          className={`w-full h-full ${buildMode === BuildModeEnum.DOCKER ? 'relative left-[1px]' : ''}`}
        />
      )
    case ServiceTypeEnum.CONTAINER:
      return <Icon name={IconEnum.CONTAINER} className="w-full h-full" />
    case ServiceTypeEnum.CRON_JOB:
      return <Icon name={IconEnum.CRON_JOB} className="w-full h-full" />
    case ServiceTypeEnum.LIFECYCLE_JOB:
      return <Icon name={IconEnum.LIFECYCLE_JOB} className="w-full h-full" />
    case ServiceTypeEnum.DATABASE:
      return <Icon name={IconEnum.DATABASE} className="w-full h-full" />

    default:
      return serviceType
  }
}

export function ServiceIcon(props: ServiceIconProps) {
  const { serviceType, buildMode, cloudProvider, notRounded, size = '28', padding = '1', className = '' } = props

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
      <span className={`w-full h-full ${!notRounded ? 'p-1' : ''}`}>
        {iconByService(serviceType, cloudProvider, buildMode)}
      </span>
    </div>
  )
}

export default ServiceIcon

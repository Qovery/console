import { CloudProviderEnum } from 'qovery-typescript-axios'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'

export interface BadgeServiceProps {
  serviceType: ServiceTypeEnum
  cloudProvider: CloudProviderEnum
  size?: string
  className?: string
}

export const iconByService = (serviceType: ServiceTypeEnum, cloudProvider: CloudProviderEnum) => {
  switch (serviceType) {
    case ServiceTypeEnum.APPLICATION:
      return <Icon name={IconEnum.DOCKER} className="w-full h-full relative left-[1px]" />
    case ServiceTypeEnum.CONTAINER:
      return <Icon name={IconEnum.CONTAINER} className="w-full h-full relative left-[1px]" />
    case ServiceTypeEnum.CRON_JOB:
      return <Icon name={IconEnum.CRON_JOB} className="w-full h-full" />
    case ServiceTypeEnum.LIFECYCLE_JOB:
      return <Icon name={IconEnum.LIFECYCLE_JOB} className="w-full h-full" />
    case ServiceTypeEnum.DATABASE:
      return (
        <Icon name={cloudProvider === CloudProviderEnum.AWS ? IconEnum.AWS : IconEnum.SCW} className="w-full h-full" />
      )

    default:
      return serviceType
  }
}

export function BadgeService(props: BadgeServiceProps) {
  const { serviceType, cloudProvider, size = '28', className = '' } = props

  return (
    <div
      className={`flex items-center justify-center shrink-0 border border-element-light-lighter-400 rounded-full ${className} `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <span className="w-full h-full p-1">{iconByService(serviceType, cloudProvider)}</span>
    </div>
  )
}

export default BadgeService

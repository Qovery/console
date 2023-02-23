import { render } from '__tests__/utils/setup-jest'
import { BuildModeEnum, CloudProviderEnum } from 'qovery-typescript-axios'
import { IconEnum, ServiceTypeEnum } from '@qovery/shared/enums'
import Icon from '../icon/icon'
import BadgeService, { iconByService } from './badge-service'

describe('BadgeService', () => {
  it('renders with correct icon and size', () => {
    const { container } = render(
      <BadgeService
        serviceType={ServiceTypeEnum.APPLICATION}
        cloudProvider={CloudProviderEnum.AWS}
        buildMode={BuildModeEnum.DOCKER}
        size="50"
        padding="2"
      />
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('name', IconEnum.DOCKER)
    expect(container.firstChild).toHaveStyle({ width: '50px', height: '50px', padding: '2px' })
  })

  it('returns correct icon for each service type with iconByService function', () => {
    expect(iconByService(ServiceTypeEnum.APPLICATION, CloudProviderEnum.AWS, BuildModeEnum.DOCKER)).toEqual(
      <Icon name={IconEnum.DOCKER} className="w-full h-full relative left-[1px]" />
    )
    expect(iconByService(ServiceTypeEnum.APPLICATION, CloudProviderEnum.AWS, BuildModeEnum.BUILDPACKS)).toEqual(
      <Icon name={IconEnum.BUILDPACKS} className="w-full h-full" />
    )
    expect(iconByService(ServiceTypeEnum.CONTAINER, CloudProviderEnum.AWS)).toEqual(
      <Icon name={IconEnum.CONTAINER} className="w-full h-full" />
    )
    expect(iconByService(ServiceTypeEnum.CRON_JOB, CloudProviderEnum.AWS)).toEqual(
      <Icon name={IconEnum.CRON_JOB} className="w-full h-full" />
    )
    expect(iconByService(ServiceTypeEnum.LIFECYCLE_JOB, CloudProviderEnum.AWS)).toEqual(
      <Icon name={IconEnum.LIFECYCLE_JOB} className="w-full h-full" />
    )
    expect(iconByService(ServiceTypeEnum.DATABASE, CloudProviderEnum.AWS)).toEqual(
      <Icon name={IconEnum.AWS} className="w-full h-full" />
    )
    expect(iconByService(ServiceTypeEnum.DATABASE, CloudProviderEnum.SCW)).toEqual(
      <Icon name={IconEnum.SCW} className="w-full h-full" />
    )
  })
})

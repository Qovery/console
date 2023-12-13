import { BuildModeEnum } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { renderWithProviders } from '@qovery/shared/util-tests'
import Icon from '../icon/icon'
import ServiceIcon, { iconByService } from './service-icon'

describe('ServiceIcon', () => {
  it('renders with correct icon and size', () => {
    const { container } = renderWithProviders(
      <ServiceIcon
        service={{
          serviceType: 'APPLICATION',
          build_mode: BuildModeEnum.DOCKER,
        }}
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
    expect(
      iconByService({
        serviceType: 'APPLICATION',
        build_mode: BuildModeEnum.DOCKER,
      })
    ).toEqual(<Icon name={IconEnum.DOCKER} className="w-full h-full relative left-[1px]" />)
    expect(
      iconByService({
        serviceType: 'APPLICATION',
        build_mode: BuildModeEnum.BUILDPACKS,
      })
    ).toEqual(<Icon name={IconEnum.BUILDPACKS} className="w-full h-full " />)
    expect(
      iconByService({
        serviceType: 'CONTAINER',
      })
    ).toEqual(<Icon name={IconEnum.CONTAINER} className="w-full h-full" />)
    expect(
      iconByService({
        serviceType: 'JOB',
        job_type: 'CRON',
      })
    ).toEqual(<Icon name={IconEnum.CRON_JOB} className="w-full h-full" />)
    expect(
      iconByService({
        serviceType: 'JOB',
        job_type: 'LIFECYCLE',
      })
    ).toEqual(<Icon name={IconEnum.LIFECYCLE_JOB} className="w-full h-full" />)

    expect(
      iconByService({
        serviceType: 'DATABASE',
      })
    ).toEqual(<Icon name={IconEnum.DATABASE} className="w-full h-full" />)
    expect(
      iconByService({
        serviceType: 'HELM',
      })
    ).toEqual(<Icon name={IconEnum.HELM} className="w-full h-full" />)
  })
})

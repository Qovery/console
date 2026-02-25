import { ResourceStatusDto, UnitDto } from 'qovery-ws-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders } from '@qovery/shared/util-tests'
import * as useDeploymentStatusImport from '../../hooks/use-deployment-status/use-deployment-status'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import { InstanceMetrics } from './instance-metrics'

describe('InstanceMetrics', () => {
  const service = {
    id: '1',
    serviceType: ServiceTypeEnum.APPLICATION,
    created_at: '1696923386000',
    healthchecks: {},
    environment: { id: '1' },
  } as AnyService

  it('should match snapshot with data', () => {
    jest.spyOn(useMetricsImport, 'useMetrics').mockReturnValue({
      data: [
        {
          cpu: {
            current: 12,
            current_percent: 5,
            limit: 80,
            status: ResourceStatusDto.OK,
            unit: UnitDto.M_CPU,
          },
          memory: {
            current: 30,
            current_percent: 20,
            limit: 80,
            status: ResourceStatusDto.OK,
            unit: UnitDto.MI_B,
          },
          pod_name: 'foobar',
          storages: [],
        },
      ],
      isLoading: false,
      error: {},
      isError: false,
    })
    const { container } = renderWithProviders(<InstanceMetrics environmentId="1" serviceId="1" service={service} />)
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with empty data', () => {
    jest.spyOn(useMetricsImport, 'useMetrics').mockReturnValue({
      data: [],
      isLoading: false,
      error: {},
      isError: false,
    })
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        id: '1',
        service_deployment_status: 'UP_TO_DATE',
        state: 'READY',
      },
      isLoading: false,
      error: {},
      isError: false,
    })
    const { container } = renderWithProviders(<InstanceMetrics environmentId="1" serviceId="1" service={service} />)
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with null data', () => {
    jest.spyOn(useMetricsImport, 'useMetrics').mockReturnValue({
      data: null,
      isLoading: false,
      error: {},
      isError: false,
    })
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        id: '1',
        service_deployment_status: 'UP_TO_DATE',
        state: 'READY',
      },
      isLoading: false,
      error: {},
      isError: false,
    })
    const { container } = renderWithProviders(<InstanceMetrics environmentId="1" serviceId="1" service={service} />)
    expect(container).toMatchSnapshot()
  })
})

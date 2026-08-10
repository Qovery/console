import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { ResourceStatusDto, UnitDto } from 'qovery-ws-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeploymentStatusImport from '../../hooks/use-deployment-status/use-deployment-status'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import * as useRunningStatusImport from '../../hooks/use-running-status/use-running-status'
import * as useServiceImport from '../../hooks/use-service/use-service'
import { InstanceMetrics } from './instance-metrics'

describe('InstanceMetrics', () => {
  const service = {
    id: '1',
    serviceType: ServiceTypeEnum.APPLICATION,
    created_at: '1696923386000',
    healthchecks: {},
    environment: { id: '1' },
  } as AnyService

  beforeEach(() => {
    jest.restoreAllMocks()
  })

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

  it('shows the deploy empty state instead of the technical error when the service was never deployed', () => {
    const databaseService = {
      ...service,
      serviceType: ServiceTypeEnum.DATABASE,
    } as AnyService

    jest.spyOn(useMetricsImport, 'useMetrics').mockReturnValue({
      data: [],
      isLoading: false,
      error: {},
      isError: false,
    })
    jest.spyOn(useDeploymentStatusImport, 'useDeploymentStatus').mockReturnValue({
      data: {
        id: '1',
        service_deployment_status: ServiceDeploymentStatusEnum.NEVER_DEPLOYED,
        state: StateEnum.READY,
      },
      isLoading: false,
      error: {},
      isError: false,
    })
    jest.spyOn(useRunningStatusImport, 'useRunningStatus').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: {},
      isError: false,
    })
    jest.spyOn(useServiceImport, 'useService').mockReturnValue({
      data: databaseService,
      isLoading: false,
      error: {},
      isError: false,
    })

    renderWithProviders(<InstanceMetrics environmentId="1" serviceId="1" service={databaseService} />)

    expect(screen.getByText('Database is not running')).toBeInTheDocument()
    expect(screen.getByText('Deploy the database first')).toBeInTheDocument()
    expect(screen.queryByText('Metrics for instances are not available, try again')).not.toBeInTheDocument()
  })
})

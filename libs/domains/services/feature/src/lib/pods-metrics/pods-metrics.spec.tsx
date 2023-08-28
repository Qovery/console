import { ResourceStatusDto, UnitDto } from 'qovery-ws-typescript-axios'
import { renderWithProviders } from '@qovery/shared/util-tests'
import * as useMetricsImport from '../hooks/use-metrics/use-metrics'
import PodsMetrics from './pods-metrics'

describe('PodsMetrics', () => {
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
    const { container } = renderWithProviders(<PodsMetrics environmentId="1" serviceId="1" />)
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with empty data', () => {
    jest.spyOn(useMetricsImport, 'useMetrics').mockReturnValue({
      data: [],
      isLoading: false,
      error: {},
      isError: false,
    })
    const { container } = renderWithProviders(<PodsMetrics environmentId="1" serviceId="1" />)
    expect(container).toMatchSnapshot()
  })
  it('should match snapshot with null data', () => {
    jest.spyOn(useMetricsImport, 'useMetrics').mockReturnValue({
      data: null,
      isLoading: false,
      error: {},
      isError: false,
    })
    const { container } = renderWithProviders(<PodsMetrics environmentId="1" serviceId="1" />)
    expect(container).toMatchSnapshot()
  })
})

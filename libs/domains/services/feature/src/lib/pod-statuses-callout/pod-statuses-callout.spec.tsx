import { ServiceStateDto } from 'qovery-ws-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useRunningStatusImport from '../hooks/use-running-status/use-running-status'
import * as useServiceTypeImport from '../hooks/use-service-type/use-service-type'
import { PodStatusesCallout } from './pod-statuses-callout'

describe('PodStatusesCallout', () => {
  it('should render successfully', () => {
    jest.spyOn(useServiceTypeImport, 'useServiceType').mockReturnValue({
      data: ServiceTypeEnum.APPLICATION,
      isLoading: false,
      error: {},
    })
    jest.spyOn(useRunningStatusImport, 'useRunningStatus').mockReturnValue({
      data: {
        state: ServiceStateDto.ERROR,
        id: 'id',
        pods: [
          {
            containers: [],
            name: 'foo',
            restart_count: 0,
            service_version: '',
            state: ServiceStateDto.ERROR,
            state_message: 'bar',
            state_reason: 'baz',
          },
        ],
      },
      isLoading: false,
    })
    const { baseElement } = renderWithProviders(<PodStatusesCallout environmentId="1" serviceId="1" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should handle certificate errors properly', async () => {
    jest.spyOn(useServiceTypeImport, 'useServiceType').mockReturnValue({
      data: ServiceTypeEnum.APPLICATION,
      isLoading: false,
      error: {},
    })
    jest.spyOn(useRunningStatusImport, 'useRunningStatus').mockReturnValue({
      data: {
        state: ServiceStateDto.WARNING,
        id: 'id',
        pods: [
          {
            containers: [],
            name: 'foo2',
            restart_count: 0,
            service_version: '',
            state: ServiceStateDto.WARNING,
            state_message: 'bar',
            state_reason: 'baz',
          },
        ],
        certificates: [
          {
            dns_names: ['foo.com', 'bar.com'],
            failed_issuance_attempt_count: 0,
            state: ServiceStateDto.ERROR,
          },
        ],
      },
      isLoading: false,
    })
    renderWithProviders(<PodStatusesCallout environmentId="1" serviceId="1" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })
})

import { ServiceStateDto } from 'qovery-ws-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useRunningStatusImport from '../hooks/use-running-status/use-running-status'
import { PodStatusesCallout } from './pod-statuses-callout'

describe('PodStatusesCallout', () => {
  it('should render successfully', () => {
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
  it('should handle multiple messages', async () => {
    jest.spyOn(useRunningStatusImport, 'useRunningStatus').mockReturnValue({
      data: {
        state: ServiceStateDto.ERROR,
        id: 'id',
        pods: [
          {
            containers: [],
            name: 'foo1',
            restart_count: 0,
            service_version: '',
            state: ServiceStateDto.ERROR,
            state_message: 'bar',
            state_reason: 'baz',
          },
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
    const { userEvent } = renderWithProviders(<PodStatusesCallout environmentId="1" serviceId="1" />)
    let buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).toBeEnabled()
    await userEvent.click(buttons[1])

    buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeEnabled()
    await userEvent.click(buttons[1])

    buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeDisabled()
  })
})
